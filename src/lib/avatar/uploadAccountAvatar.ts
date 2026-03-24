/**
 * Client-side account avatar upload.
 *
 * Today: POST multipart to `/api/settings/account/avatar` (Supabase storage or inline fallback).
 * Later: swap this function for presigned direct-to-cloud uploads without changing settings UI.
 */
export async function uploadAccountAvatar(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/settings/account/avatar", {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  const j = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) {
    throw new Error(j.error && typeof j.error === "string" ? j.error : "Could not upload photo.");
  }
  if (!j.url) {
    throw new Error("Could not upload photo.");
  }
  return { url: j.url };
}
