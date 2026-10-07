export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// One-time nonce cookie that binds a Google login to the browser that started
// it. The `__Host-` prefix forces the cookie host-only (Secure, Path=/, no
// Domain).
export const OAUTH_STATE_COOKIE = "__Host-oauth_state";

/**
 * A post-login redirect target from `?next=`, or null. Resolving against a throwaway origin rejects
 * anything a browser would send off-site ("//x.com", "/\x.com", "/\t/x.com", absolute URLs).
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/")) return null;
  const base = "https://site.invalid";
  try {
    const url = new URL(next, base);
    return url.origin === base ? url.pathname + url.search + url.hash : null;
  } catch {
    return null;
  }
}

/**
 * Phone numbers are typed many ways (+20 102 082 4464, 01020824464, 00201020824464).
 * Compare the last 10 digits, which is the national number for Egyptian mobiles.
 */
export function samePhone(a: string | null | undefined, b: string | null | undefined): boolean {
  const digits = (s: string | null | undefined) => (s ?? "").replace(/\D/g, "");
  const x = digits(a), y = digits(b);
  if (x.length < 7 || y.length < 7) return false;
  return x.slice(-10) === y.slice(-10);
}
