import "server-only";

import crypto from "node:crypto";

import { getDatabasePool, isDatabaseConfigured } from "@/lib/db";

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

interface AttemptState {
  failures: number;
  windowStartedAt: number;
  blockedUntil: number | null;
}

export interface LoginRateLimitStatus {
  allowed: boolean;
  retryAfterSeconds: number;
  keys: string[];
}

declare global {
  var clevioLoginAttempts: Map<string, AttemptState> | undefined;
}

function getMemoryStore() {
  globalThis.clevioLoginAttempts ??= new Map<string, AttemptState>();
  return globalThis.clevioLoginAttempts;
}

function hashKey(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function getClientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .at(-1);
  return forwarded
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
}

export function getLoginRateLimitKeys(request: Request, identifier: string) {
  const account = identifier.trim().toLowerCase() || "<empty>";
  const clientAddress = getClientAddress(request);
  return [hashKey(`ip:${clientAddress}`), hashKey(`account:${account}`)];
}

function secondsUntil(timestamp: number | null, now = Date.now()) {
  return timestamp && timestamp > now ? Math.max(1, Math.ceil((timestamp - now) / 1000)) : 0;
}

function checkMemory(keys: string[]): LoginRateLimitStatus {
  const store = getMemoryStore();
  const now = Date.now();
  let retryAfterSeconds = 0;

  for (const key of keys) {
    const state = store.get(key);
    const retry = secondsUntil(state?.blockedUntil ?? null, now);
    retryAfterSeconds = Math.max(retryAfterSeconds, retry);
    if (state && !retry && now - state.windowStartedAt >= WINDOW_MS) store.delete(key);
  }

  return { allowed: retryAfterSeconds === 0, retryAfterSeconds, keys };
}

async function checkPostgres(keys: string[]): Promise<LoginRateLimitStatus> {
  const result = await getDatabasePool().query<{ retry_after_seconds: number | null }>(
    `SELECT ceil(extract(epoch FROM (max(blocked_until) - now())))::int AS retry_after_seconds
     FROM admin_login_attempts
     WHERE key_hash = ANY($1::text[])
       AND blocked_until > now()`,
    [keys],
  );
  const retryAfterSeconds = Math.max(0, result.rows[0]?.retry_after_seconds ?? 0);
  return { allowed: retryAfterSeconds === 0, retryAfterSeconds, keys };
}

export async function checkLoginRateLimit(request: Request, identifier: string) {
  const keys = getLoginRateLimitKeys(request, identifier);
  return isDatabaseConfigured() ? checkPostgres(keys) : checkMemory(keys);
}

function recordMemoryFailure(keys: string[]) {
  const store = getMemoryStore();
  const now = Date.now();
  let retryAfterSeconds = 0;

  for (const key of keys) {
    const existing = store.get(key);
    const resetWindow = !existing || now - existing.windowStartedAt >= WINDOW_MS;
    const failures = resetWindow ? 1 : existing.failures + 1;
    const blockedUntil = failures >= MAX_FAILURES ? now + BLOCK_MS : existing?.blockedUntil ?? null;
    store.set(key, {
      failures,
      windowStartedAt: resetWindow ? now : existing.windowStartedAt,
      blockedUntil,
    });
    retryAfterSeconds = Math.max(retryAfterSeconds, secondsUntil(blockedUntil, now));
  }

  return retryAfterSeconds;
}

async function recordPostgresFailure(keys: string[]) {
  const client = await getDatabasePool().connect();
  const now = Date.now();
  let retryAfterSeconds = 0;

  try {
    await client.query("BEGIN");
    for (const key of keys) {
      await client.query(
        `INSERT INTO admin_login_attempts (key_hash, failure_count, window_started_at, updated_at)
         VALUES ($1, 0, now(), now())
         ON CONFLICT (key_hash) DO NOTHING`,
        [key],
      );
      const selected = await client.query<{
        failure_count: number;
        window_started_at: Date;
        blocked_until: Date | null;
      }>(
        `SELECT failure_count, window_started_at, blocked_until
         FROM admin_login_attempts
         WHERE key_hash = $1
         FOR UPDATE`,
        [key],
      );
      const row = selected.rows[0];
      const resetWindow = !row || now - new Date(row.window_started_at).getTime() >= WINDOW_MS;
      const failures = resetWindow ? 1 : row.failure_count + 1;
      const blockedUntil = failures >= MAX_FAILURES
        ? new Date(now + BLOCK_MS)
        : row.blocked_until && row.blocked_until.getTime() > now
          ? row.blocked_until
          : null;
      await client.query(
        `UPDATE admin_login_attempts
         SET failure_count = $2,
             window_started_at = $3,
             blocked_until = $4,
             updated_at = now()
         WHERE key_hash = $1`,
        [key, failures, resetWindow ? new Date(now) : row.window_started_at, blockedUntil],
      );
      retryAfterSeconds = Math.max(retryAfterSeconds, secondsUntil(blockedUntil?.getTime() ?? null, now));
    }
    await client.query("COMMIT");
    return retryAfterSeconds;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function recordLoginFailure(keys: string[]) {
  return isDatabaseConfigured() ? recordPostgresFailure(keys) : recordMemoryFailure(keys);
}

export async function clearLoginFailures(keys: string[]) {
  if (isDatabaseConfigured()) {
    await getDatabasePool().query(
      "DELETE FROM admin_login_attempts WHERE key_hash = ANY($1::text[])",
      [keys],
    );
    return;
  }

  const store = getMemoryStore();
  keys.forEach((key) => store.delete(key));
}
