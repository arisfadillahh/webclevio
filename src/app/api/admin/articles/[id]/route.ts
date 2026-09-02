import { NextResponse } from "next/server";

import { isAuthorizedAdminRequest } from "@/lib/admin-session";
import { deleteArticle, updateArticle } from "@/lib/content";
import { articleInputSchema, formatValidationIssues } from "@/lib/content-validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
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
  const { id } = await context.params;
  try {
    const item = await updateArticle(id, result.data);
    if (!item) return NextResponse.json({ ok: false, message: "Artikel tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    if ((error as Error).message === "SLUG_CONFLICT") {
      return NextResponse.json({ ok: false, message: "Slug sudah digunakan artikel lain." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ ok: false, message: "Artikel gagal diperbarui." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const removed = await deleteArticle(id);
  if (!removed) return NextResponse.json({ ok: false, message: "Artikel tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
