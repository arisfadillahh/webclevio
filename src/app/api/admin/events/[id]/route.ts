import { NextResponse } from "next/server";

import { isAuthorizedAdminRequest } from "@/lib/admin-session";
import { deleteEvent, updateEvent } from "@/lib/content";
import { eventInputSchema, formatValidationIssues } from "@/lib/content-validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const result = eventInputSchema.safeParse(await request.json());
  if (!result.success) {
    return NextResponse.json(
      { ok: false, message: "Data event belum valid.", issues: formatValidationIssues(result.error) },
      { status: 400 },
    );
  }
  const { id } = await context.params;
  try {
    const item = await updateEvent(id, result.data);
    if (!item) return NextResponse.json({ ok: false, message: "Event tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: "Event gagal diperbarui." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const removed = await deleteEvent(id);
  if (!removed) return NextResponse.json({ ok: false, message: "Event tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
