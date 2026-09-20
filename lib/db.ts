import { neon } from "@neondatabase/serverless";

type Sql = ReturnType<typeof neon>;

let schemaReady: Promise<void> | null = null;
let cachedUrl: string | undefined;

function trimEnv(value: string | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}

function asPostgresUrl(value: string) {
  const url = value.replace(/^prisma\+/, "");
  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) return "";
  // Neon serverless (HTTP) does not support SCRAM channel binding.
  return url.replace(/([?&])channel_binding=require&?/g, "$1").replace(/[?&]$/, "");
}

export function databaseUrl() {
  if (cachedUrl !== undefined) return cachedUrl;

  const named = [
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_PRISMA_URL,
    process.env.NEON_DATABASE_URL,
    process.env.POSTGRES_URL_NO_SSL,
  ];
  for (const candidate of named) {
    const url = asPostgresUrl(trimEnv(candidate));
    if (url) {
      cachedUrl = url;
      return url;
    }
  }

  const host = trimEnv(process.env.POSTGRES_HOST || process.env.PGHOST);
  const user = trimEnv(process.env.POSTGRES_USER || process.env.PGUSER);
  const password = trimEnv(process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD);
  const database = trimEnv(
    process.env.POSTGRES_DATABASE || process.env.PGDATABASE || process.env.POSTGRES_DB,
  );
  if (host && user && password && database) {
    cachedUrl = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${database}?sslmode=require`;
    return cachedUrl;
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (!/POSTGRES|DATABASE|NEON|^PG/i.test(key)) continue;
    const url = asPostgresUrl(trimEnv(value));
    if (url) {
      cachedUrl = url;
      return url;
    }
  }

  cachedUrl = "";
  return cachedUrl;
}

export function hasDatabase() {
  return Boolean(databaseUrl());
}

function sql(): Sql {
  const url = databaseUrl();
  if (!url) throw new Error("DATABASE_URL is not set.");
  return neon(url);
}

export async function ensureSchema() {
  if (!hasDatabase()) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = sql();
      await db`CREATE TABLE IF NOT EXISTS portfolio_records (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await db`CREATE TABLE IF NOT EXISTS portfolio_files (
        id TEXT PRIMARY KEY,
        mime TEXT NOT NULL,
        data BYTEA NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

export async function getRecord<T>(key: string): Promise<T | null> {
  if (!hasDatabase()) return null;
  try {
    await ensureSchema();
    const rows = (await sql()`SELECT value FROM portfolio_records WHERE key = ${key}`) as Array<{
      value: T;
    }>;
    return rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function setRecord<T>(key: string, value: T) {
  await ensureSchema();
  const db = sql();
  await db`
    INSERT INTO portfolio_records (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
}

function toBytes(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) return new Uint8Array(value);
  if (typeof value === "string") {
    const hex = value.startsWith("\\x") ? value.slice(2) : value.replace(/^\\x/, "");
    return Uint8Array.from(Buffer.from(hex, "hex"));
  }
  throw new Error("Invalid file data.");
}

export async function putFile(id: string, mime: string, bytes: Uint8Array) {
  await ensureSchema();
  await sql()`
    INSERT INTO portfolio_files (id, mime, data)
    VALUES (${id}, ${mime}, ${Buffer.from(bytes)})
    ON CONFLICT (id) DO UPDATE SET mime = EXCLUDED.mime, data = EXCLUDED.data
  `;
}

export async function getFile(id: string) {
  if (!hasDatabase()) return null;
  try {
    await ensureSchema();
    const rows = (await sql()`SELECT mime, data FROM portfolio_files WHERE id = ${id}`) as Array<{
      mime: string;
      data: unknown;
    }>;
    const row = rows[0];
    if (!row) return null;
    return { mime: row.mime, data: toBytes(row.data) };
  } catch {
    return null;
  }
}

export async function deleteFile(id: string) {
  if (!hasDatabase()) return;
  await ensureSchema();
  await sql()`DELETE FROM portfolio_files WHERE id = ${id}`;
}

export function mediaHref(id: string) {
  return `/api/media/${id}`;
}

export function mediaIdFromUrl(url: string) {
  const match = url.match(/\/api\/media\/([^/?#]+)/);
  return match?.[1] || "";
}
