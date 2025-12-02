import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

import { ADMIN_SESSION_COOKIE, isValidToken } from "@/lib/auth";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: Request) {
  const token = await getToken(request);
  if (!isValidToken(token)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const previousPath = formData.get("previousPath");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "File tidak ditemukan" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, message: "Tipe file harus gambar" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ ok: false, message: "Ukuran maksimum 2MB" }, { status: 400 });
  }

  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  const extension = path.extname(file.name) || ".png";
  const safeName = `${Date.now()}-${Math.random().toString(16).slice(2)}${extension}`;
  const filePath = path.join(UPLOADS_DIR, safeName);
  const publicUrl = `/uploads/${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);

  if (typeof previousPath === "string" && previousPath.startsWith("/uploads/")) {
    const prevFullPath = path.join(process.cwd(), "public", previousPath.replace(/^\//, ""));
    try {
      await fs.unlink(prevFullPath);
    } catch {
      // ignore missing/permission errors
    }
  }

  return NextResponse.json({ ok: true, url: publicUrl });
}

type CookieStore = {
  get?: (name: string) => { value?: string } | undefined;
};

async function getToken(request: Request) {
  // Try cookies helper first (works in route handlers)
  const cookieHeader = request.headers.get("cookie") ?? "";
  const tokenFromHeader = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${ADMIN_SESSION_COOKIE}=`));

  if (tokenFromHeader) {
    return decodeURIComponent(tokenFromHeader.substring(ADMIN_SESSION_COOKIE.length + 1));
  }

  try {
    const { cookies } = await import("next/headers");
    const store = (await cookies()) as unknown as CookieStore;
    const token = store.get?.(ADMIN_SESSION_COOKIE)?.value;
    if (token) return token;
  } catch {
    // noop
  }

  return undefined;
}
