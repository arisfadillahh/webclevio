import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import nextEnv from "@next/env";
import pg from "pg";

import { getPostgresSslConfig } from "./postgres-ssl.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { loadEnvConfig } = nextEnv;
loadEnvConfig(projectRoot);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL belum dikonfigurasi. Aplikasi sedang memakai fallback JSON untuk development.");
  process.exitCode = 1;
} else {
  const { Pool } = pg;
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    ssl: getPostgresSslConfig(),
  });
  try {
    const result = await pool.query(
      `SELECT
        current_database() AS database,
        (SELECT count(*)::int FROM articles) AS articles,
        (SELECT count(*)::int FROM events) AS events,
        (SELECT revision::int FROM site_content WHERE id = 'main') AS revision`,
    );
    console.log("Database siap:", result.rows[0]);
  } finally {
    await pool.end();
  }
}
