import "server-only";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { getDatabasePool, isDatabaseConfigured } from "@/lib/db";
import type { BlogPost, EventItem, Program, SiteContent } from "@/types/content";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");
let jsonWriteQueue = Promise.resolve();

const DEFAULT_FREE_TRIAL: SiteContent["freeTrial"] = {
  eyebrow: "Free Trial Terbatas",
  title: "Yuk Coba Free Trial Coding",
  highlight: "Gratis!",
  subtitle: "Lihat Anak Mulai Belajar & Berkarya",
  description:
    "Ajak anak ikut sesi trial gratis bersama mentor Clevio. Kuota terbatas untuk kesempatan terbaik ini.",
  benefits: [
    "Gratis, tanpa komitmen",
    "Didampingi mentor langsung",
    "Dapat rekomendasi level yang tepat",
  ],
  ctaLabel: "Daftar Free Trial Gratis",
  ctaLink: "https://lms.clev.io/free-trial",
  note: "Kuota free trial terbatas! Daftar sekarang sebelum penuh.",
  visualImage: "/assets/img/free-trial-coding-brand-v2.png",
  availabilityTitle: "Slot Free Trial Masih Tersedia!",
  availabilityText: "Isi form singkat dan tim Clevio akan menghubungi Anda.",
  availabilityBadge: "Kuota Terbatas",
  trustTitle: "Aman & Terpercaya",
  trustText: "Kelas trial bersama mentor berpengalaman Clevio.",
};

const DEFAULT_BENEFITS: SiteContent["benefits"] = {
  tagline: "Perjalanan Belajar Anak",
  title: "Dari Ide hingga Produk Siap Diluncurkan",
  description:
    "Empat tahap pembelajaran terstruktur untuk membantu anak mengubah ide menjadi karya nyata yang berdampak.",
  items: [
    {
      title: "Explore",
      description: "Tahap mencari ide dan memahami masalah yang ingin diselesaikan",
      icon: "fa-solid fa-code",
    },
    {
      title: "Project",
      description: "Tahap pengerjaan terstruktur untuk mengembangkan solusi sesuai tujuan yang telah ditetapkan",
      icon: "fa-solid fa-laptop-code",
    },
    {
      title: "Big Project",
      description: "Tahap pembuatan karya besar yang lebih kompleks dan menyeluruh sebagai hasil akhir dari proses belajar",
      icon: "fa-solid fa-microchip",
    },
    {
      title: "Product Launching",
      description: "Tahap mempresentasikan dan merilis hasil pembelajaran agar dapat digunakan atau dinilai oleh orang lain.",
      icon: "fa-solid fa-robot",
    },
  ],
};

const DEFAULT_PROGRAM_DETAILS: Array<
  Pick<Program, "learningPoints" | "projectExamples" | "tools">
> = [
  {
    learningPoints: ["Logika coding dasar", "Animasi dan storytelling", "Dasar desain digital"],
    projectExamples: ["Maze game", "Cerita interaktif", "Poster digital"],
    tools: ["Scratch", "Code.org", "Minecraft Education"],
  },
  {
    learningPoints: ["Game mechanics", "Logika aplikasi", "Video dan digital storytelling"],
    projectExamples: ["Platformer game", "Prototype aplikasi", "Komik digital"],
    tools: ["Scratch", "Construct 3", "Canva", "CapCut"],
  },
  {
    learningPoints: ["Web dan app development", "Dasar AI dan data", "Product design"],
    projectExamples: ["AI chatbot", "Portfolio website", "Roblox experience"],
    tools: ["Roblox Studio", "HTML, CSS & JavaScript", "Python", "Figma", "AI Tools"],
  },
];

function normalizePrograms(programs: Program[] | undefined): Program[] {
  return (programs ?? []).map((program, index) => {
    const defaults = DEFAULT_PROGRAM_DETAILS[index] ?? DEFAULT_PROGRAM_DETAILS[0];
    return {
      ...program,
      learningPoints: Array.isArray(program.learningPoints)
        ? program.learningPoints
        : defaults.learningPoints,
      projectExamples: Array.isArray(program.projectExamples)
        ? program.projectExamples
        : defaults.projectExamples,
      tools: Array.isArray(program.tools) ? program.tools : defaults.tools,
      projectImage: program.projectImage || program.image,
    };
  });
}

export function createContentSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "konten";
}

function normalizeLegacyTechnologyIcons(content: SiteContent): SiteContent {
  const heroDecorations = content.hero.decorations.map((decoration) => {
    if (decoration.id === "book" && decoration.image.startsWith("data:image")) {
      return { ...decoration, image: "/assets/img/tech/laptop-code.svg" };
    }
    return decoration;
  });

  return {
    ...content,
    programs: normalizePrograms(content.programs),
    benefits: {
      ...DEFAULT_BENEFITS,
      ...(content.benefits ?? {}),
      items: Array.isArray(content.benefits?.items)
        ? content.benefits.items
        : DEFAULT_BENEFITS.items,
    },
    freeTrial: {
      ...DEFAULT_FREE_TRIAL,
      ...(content.freeTrial ?? {}),
      benefits: Array.isArray(content.freeTrial?.benefits)
        ? content.freeTrial.benefits
        : DEFAULT_FREE_TRIAL.benefits,
    },
    testimonialsSection: {
      tagline: content.testimonialsSection?.tagline || "Testimoni Orang Tua",
      title: content.testimonialsSection?.title || "Apa Kata Orang Tua Tentang Clevio",
      description:
        content.testimonialsSection?.description ||
        "Cerita nyata tentang anak yang belajar, bertumbuh, dan makin percaya diri bersama Clevio.",
    },
    hero: { ...content.hero, decorations: heroDecorations },
    eventsSection: content.eventsSection ?? {
      tagline: "Event Clevio",
      title: "Belajar, bereksperimen, dan berkarya bersama",
      description: "Temukan workshop, kelas spesial, dan aktivitas teknologi terbaru dari Clevio.",
    },
    events: (content.events ?? []).map((event) => ({
      ...event,
      image: event.image || "/assets/img/news/01.jpg",
      status: event.status || "published",
      audience: event.audience || "Anak dan orang tua",
      landingPageUrl: event.landingPageUrl || content.branding.ctaLink || "#contact",
    })),
    blog: {
      ...content.blog,
      posts: (content.blog?.posts ?? []).map((post, index) => ({
        ...post,
        slug: post.slug || createContentSlug(post.title || `artikel-${index + 1}`),
        category: post.category || "Insight Clevio",
        readingTime: post.readingTime || "5 menit baca",
        status: post.status || "published",
        body: post.body || `${post.excerpt}\n\nArtikel ini disiapkan oleh tim Clevio untuk membantu orang tua dan anak mendapatkan pengalaman belajar yang lebih menyenangkan, terarah, dan relevan dengan perkembangan teknologi.`,
        gallery: Array.isArray(post.gallery)
          ? post.gallery.filter((image): image is string => typeof image === "string" && image.length > 0).slice(0, 8)
          : [],
        galleryMode: post.galleryMode === "grid" ? "grid" : "carousel",
      })),
    },
    instructorsDecorations: {
      loveShape: content.instructorsDecorations.loveShape.startsWith("data:image")
        ? "/assets/img/tech/neural-network.svg"
        : content.instructorsDecorations.loveShape,
      frameShape: content.instructorsDecorations.frameShape.startsWith("data:image")
        ? "/assets/img/tech/code-frame.svg"
        : content.instructorsDecorations.frameShape,
    },
  };
}

function withoutManagedCollections(content: SiteContent): SiteContent {
  return {
    ...content,
    events: [],
    blog: { ...content.blog, posts: [] },
  };
}

async function readJsonContent() {
  const raw = await fs.readFile(CONTENT_PATH, "utf-8");
  return normalizeLegacyTechnologyIcons(JSON.parse(raw) as SiteContent);
}

async function writeJsonContent(content: SiteContent) {
  jsonWriteQueue = jsonWriteQueue.then(() =>
    fs.writeFile(CONTENT_PATH, `${JSON.stringify(content, null, 2)}\n`, "utf-8"),
  );
  await jsonWriteQueue;
}

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image_url: string;
  date_label: string;
  author: string;
  category: string;
  reading_time: string;
  status: "draft" | "published";
  gallery_images: unknown;
  gallery_mode: "carousel" | "grid";
};

type EventRow = {
  id: string;
  date_label: string;
  time_label: string;
  title: string;
  location: string;
  description: string;
  image_url: string;
  status: "draft" | "published";
  audience: string;
  landing_page_url: string;
};

function mapArticle(row: ArticleRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    image: row.image_url,
    date: row.date_label,
    author: row.author,
    category: row.category,
    readingTime: row.reading_time,
    status: row.status,
    gallery: Array.isArray(row.gallery_images)
      ? row.gallery_images.filter((image): image is string => typeof image === "string" && image.length > 0).slice(0, 8)
      : [],
    galleryMode: row.gallery_mode === "grid" ? "grid" : "carousel",
  };
}

function mapEvent(row: EventRow): EventItem {
  return {
    id: row.id,
    date: row.date_label,
    time: row.time_label,
    title: row.title,
    location: row.location,
    description: row.description,
    image: row.image_url,
    status: row.status,
    audience: row.audience,
    landingPageUrl: row.landing_page_url,
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!isDatabaseConfigured()) return readJsonContent();

  const pool = getDatabasePool();
  const [websiteResult, articleResult, eventResult] = await Promise.all([
    pool.query<{ payload: SiteContent }>("SELECT payload FROM site_content WHERE id = 'main'"),
    pool.query<ArticleRow>(
      `SELECT id, slug, title, excerpt, body, image_url, date_label, author, category, reading_time, status, gallery_images, gallery_mode
       FROM articles
       ORDER BY COALESCE(published_at, created_at) DESC, created_at DESC`,
    ),
    pool.query<EventRow>(
      `SELECT id, date_label, time_label, title, location, description, image_url, status, audience, landing_page_url
       FROM events
       ORDER BY sort_order ASC, COALESCE(starts_at, created_at) DESC`,
    ),
  ]);

  const website = websiteResult.rows[0]?.payload;
  if (!website) {
    throw new Error("Database belum dimigrasikan. Jalankan npm run db:migrate.");
  }

  return normalizeLegacyTechnologyIcons({
    ...website,
    blog: { ...website.blog, posts: articleResult.rows.map(mapArticle) },
    events: eventResult.rows.map(mapEvent),
  });
}

export async function updateSiteContent(payload: SiteContent): Promise<void> {
  if (!isDatabaseConfigured()) {
    await writeJsonContent(payload);
    return;
  }

  const websitePayload = withoutManagedCollections(payload);
  const result = await getDatabasePool().query(
    `UPDATE site_content
     SET payload = $1::jsonb, revision = revision + 1, updated_at = now()
     WHERE id = 'main'`,
    [JSON.stringify(websitePayload)],
  );
  if (result.rowCount !== 1) {
    throw new Error("Data website utama belum tersedia. Jalankan npm run db:migrate.");
  }
}

export async function listArticles() {
  if (!isDatabaseConfigured()) return (await readJsonContent()).blog.posts;
  const result = await getDatabasePool().query<ArticleRow>(
    `SELECT id, slug, title, excerpt, body, image_url, date_label, author, category, reading_time, status, gallery_images, gallery_mode
     FROM articles ORDER BY updated_at DESC, created_at DESC`,
  );
  return result.rows.map(mapArticle);
}

export async function createArticle(input: Omit<BlogPost, "id"> & { id?: string }) {
  const article: BlogPost = {
    ...input,
    id: input.id ?? `article-${crypto.randomUUID()}`,
    slug: input.slug || createContentSlug(input.title),
    gallery: input.gallery ?? [],
    galleryMode: input.galleryMode === "grid" ? "grid" : "carousel",
  };
  if (!isDatabaseConfigured()) {
    const content = await readJsonContent();
    if (content.blog.posts.some((item) => item.slug === article.slug)) throw new Error("SLUG_CONFLICT");
    content.blog.posts.unshift(article);
    await writeJsonContent(content);
    return article;
  }
  try {
    const result = await getDatabasePool().query<ArticleRow>(
      `INSERT INTO articles
        (id, slug, title, excerpt, body, image_url, date_label, author, category, reading_time, status, published_at, gallery_images, gallery_mode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::varchar,CASE WHEN $11::text = 'published' THEN now() ELSE NULL END,$12::jsonb,$13)
       RETURNING id, slug, title, excerpt, body, image_url, date_label, author, category, reading_time, status, gallery_images, gallery_mode`,
      [article.id, article.slug, article.title, article.excerpt, article.body, article.image, article.date, article.author, article.category, article.readingTime, article.status, JSON.stringify(article.gallery), article.galleryMode],
    );
    return mapArticle(result.rows[0]);
  } catch (error) {
    if ((error as { code?: string }).code === "23505") throw new Error("SLUG_CONFLICT");
    throw error;
  }
}

export async function updateArticle(id: string, input: Omit<BlogPost, "id">) {
  const article: BlogPost = {
    ...input,
    id,
    slug: input.slug || createContentSlug(input.title),
    gallery: input.gallery ?? [],
    galleryMode: input.galleryMode === "grid" ? "grid" : "carousel",
  };
  if (!isDatabaseConfigured()) {
    const content = await readJsonContent();
    const index = content.blog.posts.findIndex((item) => item.id === id);
    if (index < 0) return null;
    if (content.blog.posts.some((item) => item.id !== id && item.slug === article.slug)) throw new Error("SLUG_CONFLICT");
    content.blog.posts[index] = article;
    await writeJsonContent(content);
    return article;
  }
  try {
    const result = await getDatabasePool().query<ArticleRow>(
      `UPDATE articles SET
        slug=$2, title=$3, excerpt=$4, body=$5, image_url=$6, date_label=$7,
        author=$8, category=$9, reading_time=$10, status=$11::varchar,
        published_at=CASE WHEN $11::text = 'published' THEN COALESCE(published_at, now()) ELSE NULL END,
        gallery_images=$12::jsonb, gallery_mode=$13
       WHERE id=$1
       RETURNING id, slug, title, excerpt, body, image_url, date_label, author, category, reading_time, status, gallery_images, gallery_mode`,
      [id, article.slug, article.title, article.excerpt, article.body, article.image, article.date, article.author, article.category, article.readingTime, article.status, JSON.stringify(article.gallery), article.galleryMode],
    );
    return result.rows[0] ? mapArticle(result.rows[0]) : null;
  } catch (error) {
    if ((error as { code?: string }).code === "23505") throw new Error("SLUG_CONFLICT");
    throw error;
  }
}

export async function deleteArticle(id: string) {
  if (!isDatabaseConfigured()) {
    const content = await readJsonContent();
    const before = content.blog.posts.length;
    content.blog.posts = content.blog.posts.filter((item) => item.id !== id);
    if (before === content.blog.posts.length) return false;
    await writeJsonContent(content);
    return true;
  }
  const result = await getDatabasePool().query("DELETE FROM articles WHERE id=$1", [id]);
  return result.rowCount === 1;
}

export async function listEvents() {
  if (!isDatabaseConfigured()) return (await readJsonContent()).events;
  const result = await getDatabasePool().query<EventRow>(
    `SELECT id, date_label, time_label, title, location, description, image_url, status, audience, landing_page_url
     FROM events ORDER BY sort_order ASC, updated_at DESC`,
  );
  return result.rows.map(mapEvent);
}

export async function createEvent(input: Omit<EventItem, "id"> & { id?: string }) {
  const event: EventItem = { ...input, id: input.id ?? `event-${crypto.randomUUID()}` };
  if (!isDatabaseConfigured()) {
    const content = await readJsonContent();
    content.events.push(event);
    await writeJsonContent(content);
    return event;
  }
  const result = await getDatabasePool().query<EventRow>(
    `INSERT INTO events
      (id, date_label, time_label, title, location, description, image_url, status, audience, landing_page_url, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,(SELECT COALESCE(MAX(sort_order), -1) + 1 FROM events))
     RETURNING id, date_label, time_label, title, location, description, image_url, status, audience, landing_page_url`,
    [event.id, event.date, event.time, event.title, event.location, event.description, event.image, event.status, event.audience, event.landingPageUrl],
  );
  return mapEvent(result.rows[0]);
}

export async function updateEvent(id: string, input: Omit<EventItem, "id">) {
  const event: EventItem = { ...input, id };
  if (!isDatabaseConfigured()) {
    const content = await readJsonContent();
    const index = content.events.findIndex((item) => item.id === id);
    if (index < 0) return null;
    content.events[index] = event;
    await writeJsonContent(content);
    return event;
  }
  const result = await getDatabasePool().query<EventRow>(
    `UPDATE events SET
      date_label=$2, time_label=$3, title=$4, location=$5, description=$6,
      image_url=$7, status=$8, audience=$9, landing_page_url=$10
     WHERE id=$1
     RETURNING id, date_label, time_label, title, location, description, image_url, status, audience, landing_page_url`,
    [id, event.date, event.time, event.title, event.location, event.description, event.image, event.status, event.audience, event.landingPageUrl],
  );
  return result.rows[0] ? mapEvent(result.rows[0]) : null;
}

export async function deleteEvent(id: string) {
  if (!isDatabaseConfigured()) {
    const content = await readJsonContent();
    const before = content.events.length;
    content.events = content.events.filter((item) => item.id !== id);
    if (before === content.events.length) return false;
    await writeJsonContent(content);
    return true;
  }
  const result = await getDatabasePool().query("DELETE FROM events WHERE id=$1", [id]);
  return result.rowCount === 1;
}
