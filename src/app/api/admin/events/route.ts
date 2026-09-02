import { NextResponse } from "next/server";

import { isAuthorizedAdminRequest } from "@/lib/admin-session";
import { createEvent, listEvents } from "@/lib/content";
import { eventInputSchema, formatValidationIssues } from "@/lib/content-validation";

export async function GET(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, items: await listEvents() });
}

export async function POST(request: Request) {
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
  try {
    const item = await createEvent(result.data);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: "Event gagal disimpan." }, { status: 500 });
  }
}
