import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSiteContent, updateSiteContent } from "@/lib/content";
import type { SiteContent } from "@/types/content";
import { ADMIN_SESSION_COOKIE, isValidToken } from "@/lib/auth";

export async function GET() {
  const data = await getSiteContent();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const token = await getToken(request);
  if (!isValidToken(token)) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const payload = (await request.json()) as SiteContent;
    await updateSiteContent(payload);

    if (process.env.N8N_SYNC_WEBHOOK) {
      fetch(process.env.N8N_SYNC_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "clevio-content", payload }),
      }).catch(() => null);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "Unable to persist content" },
      { status: 500 },
    );
  }
}

type CookieStore = {
  get?: (name: string) => { value?: string } | undefined;
};

async function getToken(request: Request) {
  const cookieStore = (await cookies()) as unknown as CookieStore;
  if (typeof cookieStore.get === "function") {
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (token) return token;
  }
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  if (!match) return undefined;
  return decodeURIComponent(match.substring(ADMIN_SESSION_COOKIE.length + 1));
}
