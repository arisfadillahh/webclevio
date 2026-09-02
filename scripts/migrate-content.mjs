import fs from "node:fs/promises";
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
  throw new Error("DATABASE_URL belum diisi. Salin .env.example ke .env.local lalu isi koneksi PostgreSQL.");
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  ssl: getPostgresSslConfig(),
});

const schema = await fs.readFile(path.join(projectRoot, "database", "schema.sql"), "utf8");
const content = JSON.parse(await fs.readFile(path.join(projectRoot, "data", "content.json"), "utf8"));
const websitePayload = {
  ...content,
  events: [],
  blog: { ...content.blog, posts: [] },
};

const client = await pool.connect();
try {
  await client.query(schema);
  await client.query("BEGIN");

  await client.query(
    `INSERT INTO site_content (id, payload)
     VALUES ('main', $1::jsonb)
     ON CONFLICT (id) DO NOTHING`,
    [JSON.stringify(websitePayload)],
  );

  const heroVideoUrl = websitePayload.hero?.media?.videoUrl?.trim();
  if (heroVideoUrl) {
    await client.query(
      `UPDATE site_content
       SET payload = jsonb_set(
             payload,
             '{hero,secondaryCta,href}',
             to_jsonb($1::text),
             true
           ),
           revision = revision + 1,
           updated_at = now()
       WHERE id = 'main'
         AND COALESCE(payload #>> '{hero,secondaryCta,href}', '') IN ('', '#programs')`,
      [heroVideoUrl],
    );
  }

  const activitiesDescription = websitePayload.activities?.description?.trim();
  if (activitiesDescription) {
    await client.query(
      `UPDATE site_content
       SET payload = jsonb_set(
             payload,
             '{activities,description}',
             to_jsonb($1::text),
             true
           ),
           revision = revision + 1,
           updated_at = now()
       WHERE id = 'main'
         AND COALESCE(payload #>> '{activities,description}', '') = ''`,
      [activitiesDescription],
    );
  }

  for (const [index, article] of (content.blog?.posts ?? []).entries()) {
    await client.query(
      `INSERT INTO articles
        (id, slug, title, excerpt, body, image_url, date_label, author, category, reading_time, status, published_at, gallery_images, gallery_mode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14)
       ON CONFLICT (id) DO NOTHING`,
      [
        article.id,
        article.slug,
        article.title,
        article.excerpt,
        article.body,
        article.image,
        article.date,
        article.author,
        article.category,
        article.readingTime,
        article.status,
        article.status === "published" ? new Date(Date.now() - index * 60_000).toISOString() : null,
        JSON.stringify(Array.isArray(article.gallery) ? article.gallery : []),
        article.galleryMode === "grid" ? "grid" : "carousel",
      ],
    );
  }

  for (const [index, event] of (content.events ?? []).entries()) {
    await client.query(
      `INSERT INTO events
        (id, title, description, date_label, time_label, location, audience, image_url, landing_page_url, status, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO NOTHING`,
      [
        event.id,
        event.title,
        event.description,
        event.date,
        event.time,
        event.location,
        event.audience,
        event.image,
        event.landingPageUrl,
        event.status,
        index,
      ],
    );
  }

  await client.query("COMMIT");
  const counts = await client.query(
    `SELECT
       (SELECT count(*)::int FROM articles) AS articles,
       (SELECT count(*)::int FROM events) AS events,
       (SELECT revision::int FROM site_content WHERE id = 'main') AS revision`,
  );
  console.log("Migrasi database selesai:", counts.rows[0]);
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  client.release();
  await pool.end();
}
