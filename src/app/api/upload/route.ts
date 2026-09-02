import { NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { isAuthorizedAdminRequest } from "@/lib/admin-session";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/db";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_MULTIPART_BODY_SIZE = MAX_FILE_SIZE + 1024 * 1024;
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MEDIA_PATH_PATTERN = /^\/api\/media\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;

export async function POST(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const useDatabaseStorage = isDatabaseConfigured();
  if (!useDatabaseStorage && process.env.NODE_ENV === "production" && process.env.ALLOW_LOCAL_UPLOADS !== "true") {
    return NextResponse.json(
      {
        ok: false,
        message: "Upload lokal dinonaktifkan di production. Gunakan URL dari object storage/CDN.",
      },
      { status: 503 },
    );
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("multipart/form-data")) {
    return NextResponse.json(
      { ok: false, message: "Content-Type harus multipart/form-data." },
      { status: 415 },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isFinite(declaredLength) || declaredLength < 0) {
    return NextResponse.json({ ok: false, message: "Ukuran request tidak valid." }, { status: 400 });
  }
  if (declaredLength > MAX_MULTIPART_BODY_SIZE) {
    return NextResponse.json({ ok: false, message: "Ukuran request melebihi batas upload." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, message: "Format upload tidak valid." }, { status: 400 });
  }
  const file = formData.get("file");
  const previousPath = formData.get("previousPath");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "File tidak ditemukan" }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json({ ok: false, message: "Format gambar harus JPG, PNG, atau WebP." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ ok: false, message: "Ukuran maksimum 8MB." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  let optimizedBuffer: Buffer;
  try {
    optimizedBuffer = await sharp(Buffer.from(arrayBuffer))
      .rotate()
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84, effort: 4 })
      .toBuffer();
  } catch {
    return NextResponse.json({ ok: false, message: "File gambar tidak valid atau rusak." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  let publicUrl: string;

  if (useDatabaseStorage) {
    await getDatabasePool().query(
      `INSERT INTO media_assets (id, original_name, mime_type, byte_size, content)
       VALUES ($1,$2,$3,$4,$5)`,
      [id, file.name.slice(0, 255) || "image", "image/webp", optimizedBuffer.length, optimizedBuffer],
    );
    publicUrl = `/api/media/${id}`;
  } else {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const safeName = `${id}.webp`;
    await fs.writeFile(path.join(UPLOADS_DIR, safeName), optimizedBuffer);
    publicUrl = `/uploads/${safeName}`;
  }

  if (typeof previousPath === "string") {
    const mediaMatch = previousPath.match(MEDIA_PATH_PATTERN);
    if (useDatabaseStorage && mediaMatch) {
      await getDatabasePool().query("DELETE FROM media_assets WHERE id=$1", [mediaMatch[1]]).catch(() => undefined);
    } else if (!useDatabaseStorage) {
      const previousName = path.basename(previousPath);
      const isDirectUploadPath = previousPath === `/uploads/${previousName}`;
      if (isDirectUploadPath) {
        await fs.unlink(path.join(UPLOADS_DIR, previousName)).catch(() => undefined);
      }
    }
  }

  return NextResponse.json({ ok: true, url: publicUrl });
}
