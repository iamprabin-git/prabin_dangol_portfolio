import { get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { getRecord, hasDatabase, setRecord } from "./db";
import { getAdminPassword } from "./auth";
import { hasBlobStore, isVercel } from "./storage";

const AUTH_BLOB = "portfolio/admin-auth.json";
const AUTH_FILE = path.join(process.cwd(), "data", "admin-auth.json");
const encoder = new TextEncoder();

type StoredAuth = {
  salt: string;
  hash: string;
  updatedAt: string;
};

function bytesToHex(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return [...view].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function hashPassword(password: string, salt: Uint8Array) {
  const saltBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltBuffer).set(salt);
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBuffer, iterations: 120_000 },
    key,
    256,
  );
  return bytesToHex(bits);
}

async function streamToText(stream: ReadableStream<Uint8Array> | null) {
  if (!stream) return "";
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

export async function getStoredAuth(): Promise<StoredAuth | null> {
  if (hasDatabase()) {
    const fromDb = await getRecord<StoredAuth>(AUTH_BLOB);
    if (fromDb) return fromDb;
  }

  if (hasBlobStore()) {
    try {
      const result = await get(AUTH_BLOB, { access: "private", useCache: false });
      if (result?.stream) {
        const raw = await streamToText(result.stream);
        return JSON.parse(raw) as StoredAuth;
      }
    } catch {
      // Fall through to the local file.
    }
  }

  try {
    const raw = await fs.readFile(AUTH_FILE, "utf8");
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export async function saveAdminPassword(password: string) {
  if (isVercel() && !hasDatabase() && !hasBlobStore()) {
    throw new Error(
      "This host cannot store a new password. Connect Vercel Postgres (Neon) or set ADMIN_PASSWORD and redeploy.",
    );
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const record: StoredAuth = {
    salt: bytesToHex(salt),
    hash: await hashPassword(password, salt),
    updatedAt: new Date().toISOString(),
  };
  const payload = JSON.stringify(record, null, 2);

  if (hasDatabase()) {
    await setRecord(AUTH_BLOB, record);
    return;
  }

  if (hasBlobStore()) {
    await put(AUTH_BLOB, payload, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }

  await fs.mkdir(path.dirname(AUTH_FILE), { recursive: true });
  await fs.writeFile(AUTH_FILE, payload, "utf8");
}

export async function verifyAdminPassword(password: string) {
  const stored = await getStoredAuth();
  if (stored?.salt && stored.hash) {
    const next = await hashPassword(password, hexToBytes(stored.salt));
    return next === stored.hash;
  }
  const expected = getAdminPassword();
  return Boolean(expected && password === expected);
}

export function recoveryEmail(siteEmail: string) {
  return (process.env.ADMIN_EMAIL || siteEmail).trim().toLowerCase();
}
