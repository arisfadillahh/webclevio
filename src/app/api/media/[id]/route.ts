import { NextResponse } from "next/server";

import { getDatabasePool, isDatabaseConfigured } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type MediaRow = {
  mime_type: string;
  byte_size: number;
  content: Buffer;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ message: "Media storage tidak tersedia." }, { status: 404 });
  }

  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ message: "Media tidak ditemukan." }, { status: 404 });
  }

  const result = await getDatabasePool().query<MediaRow>(
    "SELECT mime_type, byte_size, content FROM media_assets WHERE id=$1",
    [id],
  );
  const media = result.rows[0];
  if (!media) {
    return NextResponse.json({ message: "Media tidak ditemukan." }, { status: 404 });
  }

  return new Response(new Uint8Array(media.content), {
    status: 200,
    headers: {
      "Content-Type": media.mime_type,
      "Content-Length": String(media.byte_size),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: `"${id}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
