import axios from "axios";
import https from "node:https";

/**
 * In `next dev`, Node often cannot verify external.transitapp.com (corporate MITM, CA bundle
 * mismatch vs the browser). We skip certificate verification for these Transit-only requests
 * when not in production so local dev works without extra env vars.
 *
 * - Production (`next build` / `next start`): always verify TLS (never bypass).
 * - Development: bypass by default. Set TRANSIT_STRICT_TLS=true to force verification.
 * - Legacy: TRANSIT_ALLOW_INSECURE_TLS=true still implied in dev; strict flag wins.
 */
export function transitTlsBypassEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.TRANSIT_STRICT_TLS === "true") return false;
  return true;
}

const bypassAgent = new https.Agent({ rejectUnauthorized: false });

/** GET JSON from Transit App HTTPS APIs with optional dev TLS bypass. */
export async function transitHttpGet(
  url: string,
  headers: Record<string, string>
): Promise<{ ok: boolean; status: number; data: unknown }> {
  try {
    const res = await axios.get(url, {
      headers,
      validateStatus: () => true,
      timeout: 45_000,
      ...(transitTlsBypassEnabled() ? { httpsAgent: bypassAgent } : {}),
    });
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      data: res.data,
    };
  } catch (e) {
    const err = e as { message?: string };
    console.error("transitHttpGet:", err?.message ?? e);
    return { ok: false, status: 0, data: {} };
  }
}
