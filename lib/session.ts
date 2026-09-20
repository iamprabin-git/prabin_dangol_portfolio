const encoder = new TextEncoder();

export const COOKIE_NAME = "pd_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function signingSecret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || "local-dev-secret";
}

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(signingSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return bytesToHex(signature);
}

export async function createSessionToken() {
  const payload = `ok.${Date.now() + SESSION_MAX_AGE * 1000}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [flag, exp, signature] = parts;
  const payload = `${flag}.${exp}`;
  const expected = await sign(payload);
  if (!safeEqual(signature, expected)) return false;
  if (flag !== "ok") return false;
  if (Number(exp) < Date.now()) return false;
  return true;
}
