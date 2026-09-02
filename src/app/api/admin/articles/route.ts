import { NextResponse } from "next/server";

import { isAuthorizedAdminRequest } from "@/lib/admin-session";
import { createArticle, listArticles } from "@/lib/content";
import { articleInputSchema, formatValidationIssues } from "@/lib/content-validation";

export async function GET(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, items: await listArticles() });
}

export async function POST(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const result = articleInputSchema.safeParse(await request.json());
  if (!result.success) {
    return NextResponse.json(
      { ok: false, message: "Data artikel belum valid.", issues: formatValidationIssues(result.error) },
      { status: 400 },
    );
  }

  try {
    const item = await createArticle(result.data);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    if ((error as Error).message === "SLUG_CONFLICT") {
      return NextResponse.json({ ok: false, message: "Slug sudah digunakan artikel lain." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ ok: false, message: "Artikel gagal disimpan." }, { status: 500 });
  }
}
