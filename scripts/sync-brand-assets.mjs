import nextEnv from "@next/env";
import pg from "pg";

import { getPostgresSslConfig } from "./postgres-ssl.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum tersedia.");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  ssl: getPostgresSslConfig(),
});

try {
  const result = await pool.query(
    `UPDATE site_content
     SET payload = jsonb_set(
       jsonb_set(
         jsonb_set(
           jsonb_set(
             jsonb_set(
               payload,
               '{hero,media,image}',
               to_jsonb($1::text),
               true
             ),
             '{freeTrial,visualImage}',
             to_jsonb($2::text),
             true
           ),
           '{programs,0,image}',
           to_jsonb($3::text),
           true
         ),
         '{programs,1,image}',
         to_jsonb($4::text),
         true
       ),
       '{programs,2,image}',
       to_jsonb($5::text),
       true
     ),
     revision = revision + 1,
     updated_at = now()
     WHERE id = 'main'
     RETURNING
       revision,
       payload #>> '{hero,media,image}' AS hero_image,
       payload #>> '{freeTrial,visualImage}' AS trial_image,
       payload #>> '{programs,0,image}' AS explorer_image,
       payload #>> '{programs,1,image}' AS creator_image,
       payload #>> '{programs,2,image}' AS innovator_image`,
    [
      "/assets/img/hero/hero-creator-tech-brand-v4.png",
      "/assets/img/free-trial-coding-brand-v2.png",
      "/assets/img/program/level-explorer.webp",
      "/assets/img/program/level-creator.webp",
      "/assets/img/program/level-innovator.webp",
    ],
  );

  if (!result.rows[0]) {
    throw new Error("Data site_content utama tidak ditemukan.");
  }

  console.log("Aset brand tersinkron:", result.rows[0]);
} finally {
  await pool.end();
}
