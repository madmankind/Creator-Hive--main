/**
 * User Agreement generation service
 * Orchestrates: data fetch -> template render -> PDF gen -> storage -> DB write
 */

import { db } from "@/server/db";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { generateUserAgreementPdf } from "@/lib/pdf/user-agreement-pdf";
import type { AgreementVariables } from "@/lib/legal/user-agreement-template";
import {
  DEFAULT_ENTITY,
  DEFAULT_CONTACT,
  TEMPLATE_VERSION,
} from "@/lib/legal/user-agreement-template";

const BUCKET = "user-agreements";
const VERSION = TEMPLATE_VERSION;

export type GenerateResult =
  | { ok: true; agreementRef: string; storageUrl: string }
  | { ok: false; error: string };

function generateAgreementRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CH-UA-${ts}-${rnd}`;
}

export async function getAgreementData(userId: string): Promise<
  | { ok: true; vars: AgreementVariables }
  | { ok: false; error: string }
> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      creatorProfile: true,
      agencyAccount: true,
    },
  });

  if (!user) return { ok: false, error: "User not found" };

  const fullLegalName =
    user.creatorProfile?.fullName ||
    user.creatorProfile?.name ||
    user.name ||
    user.email;
  const email = user.email;
  const accountType =
    user.role === "CREATOR"
      ? "Creator"
      : user.role === "AGENCY"
        ? "Agency/Brand"
        : user.role;

  const companyName =
    user.agencyAccount?.name || user.creatorProfile?.name || "";
  const location = user.creatorProfile?.location || user.agencyAccount?.location || "";
  const [city, country] = location ? location.split(",").map((s) => s.trim()) : ["", ""];

  const onboardingDate =
    user.creatorProfile?.updatedAt || user.agencyAccount?.updatedAt || user.createdAt;

  if (!fullLegalName || !email) {
    return {
      ok: false,
      error: "Missing required fields: full legal name and email are required",
    };
  }

  const vars: AgreementVariables = {
    fullLegalName,
    email,
    phone: "",
    companyName: companyName || "N/A",
    accountType,
    country: country || "UAE",
    city: city || "—",
    onboardingCompletionDate: new Date(onboardingDate).toLocaleDateString("en-GB"),
    agreementIssueDate: new Date().toLocaleDateString("en-GB"),
    agreementReference: "",
    entityName: DEFAULT_ENTITY,
    contactEmail: DEFAULT_CONTACT,
  };

  return { ok: true, vars };
}

export async function generateUserAgreement(
  userId: string,
  forceRegenerate = false
): Promise<GenerateResult> {
  const dataResult = await getAgreementData(userId);
  if (!dataResult.ok) return dataResult;

  const existing = await db.userAgreement.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (existing && !forceRegenerate) {
    return {
      ok: true,
      agreementRef: existing.agreementRef,
      storageUrl: existing.storageUrl || "",
    };
  }

  const agreementRef = generateAgreementRef();
  const vars: AgreementVariables = {
    ...dataResult.vars,
    agreementReference: agreementRef,
  };

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = generateUserAgreementPdf(vars);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF generation failed";
    return { ok: false, error: `PDF generation failed: ${msg}` };
  }

  const storagePath = `${userId}/${agreementRef}.pdf`;
  let storageUrl = "";

  try {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      return {
        ok: false,
        error: `Storage upload failed: ${error.message}`,
      };
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);
    storageUrl = urlData.publicUrl;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Storage error";
    return { ok: false, error: `Storage failed: ${msg}` };
  }

  try {
    if (existing) {
      await db.userAgreement.update({
        where: { id: existing.id },
        data: {
          agreementRef,
          version: VERSION,
          status: "GENERATED",
          storagePath,
          storageUrl,
          updatedAt: new Date(),
        },
      });
    } else {
      await db.userAgreement.create({
        data: {
          userId,
          agreementRef,
          version: VERSION,
          status: "GENERATED",
          storagePath,
          storageUrl,
        },
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Database write failed";
    return { ok: false, error: `Database error: ${msg}` };
  }

  return { ok: true, agreementRef, storageUrl };
}

export async function getUserAgreement(userId: string) {
  return db.userAgreement.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
