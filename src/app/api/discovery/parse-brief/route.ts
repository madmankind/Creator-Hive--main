import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { requireUser } from "@/server/authz";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  BRIEF_EXTRACTION_SYSTEM,
  ExtractedBriefSchema,
  extractedToBriefPayload,
} from "@/lib/briefExtraction";

export const runtime = "nodejs";

const MAX_BYTES = 6 * 1024 * 1024;
const MAX_TEXT_CHARS = 14_000;

async function extractPlainText(buffer: Buffer, mime: string, name: string): Promise<string> {
  const lower = name.toLowerCase();
  if (mime === "text/plain" || lower.endsWith(".txt")) {
    return buffer.toString("utf8");
  }
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value ?? "";
  }
  if (mime === "application/pdf" || lower.endsWith(".pdf")) {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const textResult = await parser.getText();
      return textResult.text ?? "";
    } finally {
      await parser.destroy();
    }
  }
  throw new Error("UNSUPPORTED_TYPE");
}

function truncate(s: string): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= MAX_TEXT_CHARS) return t;
  return `${t.slice(0, MAX_TEXT_CHARS)}\n…[truncated]`;
}

async function callGrokExtract(documentText: string): Promise<string> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error("NO_GROK");
  }
  const userContent =
    documentText.trim().length === 0
      ? "(No text could be extracted from this file. Ask the user to upload PDF, DOCX, or TXT, or paste the brief.)"
      : `Brief document text:\n---\n${documentText}\n---`;

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "grok-3-mini",
      messages: [
        { role: "system", content: BRIEF_EXTRACTION_SYSTEM },
        { role: "user", content: userContent },
      ],
      max_tokens: 900,
      temperature: 0.25,
    }),
  });

  if (!res.ok) {
    throw new Error(`GROK_${res.status}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

function parseJsonFromReply(raw: string): unknown {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("NO_JSON");
  }
  return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
}

export async function POST(req: NextRequest) {
  const authResult = await requireUser({ roles: ["AGENCY", "ADMIN"] });
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const rl = await checkRateLimit("ai_analyze", { userId: user.id, ip });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Daily brief-parse limit reached.", rateLimit: rl },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 6 MB)" }, { status: 413 });
  }

  const mime = file.type || "application/octet-stream";
  const ab = await file.arrayBuffer();
  const buffer = Buffer.from(ab);

  let plain: string;
  try {
    plain = truncate(await extractPlainText(buffer, mime, file.name));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "UNSUPPORTED_TYPE") {
      return NextResponse.json(
        { error: "Upload PDF, DOCX, or TXT only." },
        { status: 415 },
      );
    }
    return NextResponse.json({ error: "Could not read this file." }, { status: 422 });
  }

  let grokRaw: string;
  try {
    grokRaw = await callGrokExtract(plain);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NO_GROK") {
      return NextResponse.json({ error: "Brief parsing is not configured." }, { status: 503 });
    }
    return NextResponse.json({ error: "Brief analysis failed — try again." }, { status: 502 });
  }

  let parsed: unknown;
  try {
    parsed = parseJsonFromReply(grokRaw);
  } catch {
    return NextResponse.json(
      {
        error: "Could not parse AI response.",
        assistantFallback:
          "I read your file but had trouble structuring it. Paste your key objectives, timeline, and budget here and I’ll take it from there.",
      },
      { status: 502 },
    );
  }

  const ex = ExtractedBriefSchema.safeParse(parsed);
  if (!ex.success) {
    return NextResponse.json(
      {
        error: "Brief extraction schema mismatch.",
        assistantFallback:
          "I pulled notes from your brief — tell me your main objective and timeline in one message so I can line up the right team.",
      },
      { status: 502 },
    );
  }

  const savePayload = extractedToBriefPayload(ex.data);
  const notesExtra = [
    savePayload.notes,
    typeof ex.data.deliverables === "string"
      ? `Deliverables: ${ex.data.deliverables}`
      : Array.isArray(ex.data.deliverables)
        ? `Deliverables: ${ex.data.deliverables.join("; ")}`
        : null,
    `Source file: ${file.name}`,
  ]
    .filter(Boolean)
    .join("\n");

  return NextResponse.json({
    extracted: ex.data,
    savePayload: { ...savePayload, notes: notesExtra || savePayload.notes },
    assistantMessage: ex.data.followUpMessage,
    rateLimit: { remaining: rl.remaining, limit: rl.limit, resetAt: rl.resetAt },
  });
}
