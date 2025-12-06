export const MODASH_BASE = process.env.MODASH_API_BASE!;
const TOKEN = process.env.MODASH_API_KEY!;

function assertEnv() {
  if (!MODASH_BASE || !TOKEN) throw new Error("Missing Modash env vars");
}

async function backoff<T>(fn: () => Promise<T>) {
  const delays = [0, 1000, 2000, 4000];
  let lastErr: any;
  for (const d of delays) {
    if (d) await new Promise(r => setTimeout(r, d));
    try { 
      return await fn(); 
    } catch (e: any) {
      if (e?.status !== 429) throw e;
      lastErr = e;
    }
  }
  throw lastErr;
}

export async function mfetch<T>(
  path: string, 
  init: RequestInit = {}, 
  options?: { revalidate?: number }
): Promise<T> {
  assertEnv();
  const url = `${MODASH_BASE}${path}`;
  
  return backoff(async () => {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        ...(init.headers || {})
      },
      next: options?.revalidate ? { revalidate: options.revalidate } : undefined,
      cache: "no-store"
    });

    let body: any = null;
    if (!res.ok) {
      try { body = await res.json(); } catch {}
      const err: any = new Error(`Modash error ${body?.code || res.status}: ${body?.message || res.statusText}`);
      err.status = res.status; 
      throw err;
    }
    
    return res.json() as Promise<T>;
  });
}
