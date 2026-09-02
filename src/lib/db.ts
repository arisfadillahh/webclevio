import "server-only";

import { Pool } from "pg";

import { getPostgresSslConfig } from "@/lib/postgres-ssl";

declare global {
  var clevioPostgresPool: Pool | undefined;
}

export function isDatabaseConfigured() {
  return process.env.CONTENT_STORAGE_MODE !== "json" && Boolean(process.env.DATABASE_URL);
}

export function getContentStorageMode(): "postgres" | "json-development" {
  return isDatabaseConfigured() ? "postgres" : "json-development";
}

export function getDatabasePool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }

  if (!globalThis.clevioPostgresPool) {
    globalThis.clevioPostgresPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DATABASE_POOL_SIZE ?? 5),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 8_000,
      allowExitOnIdle: true,
      ssl: getPostgresSslConfig(),
    });
  }

  return globalThis.clevioPostgresPool;
}
