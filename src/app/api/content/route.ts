import { NextResponse } from "next/server";
import { getSiteContent, updateSiteContent } from "@/lib/content";
import { validateContentTextLimits } from "@/lib/content-limits";
import type { SiteContent } from "@/types/content";
import { isAuthorizedAdminRequest } from "@/lib/admin-session";

export async function GET(request: Request) {
  const data = await getSiteContent();
  if (await isAuthorizedAdminRequest(request)) return NextResponse.json(data);
  return NextResponse.json({
    ...data,
    events: data.events.filter((item) => item.status === "published"),
    blog: {
      ...data.blog,
      posts: data.blog.posts.filter((item) => item.status === "published"),
    },
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const requestedPayload = (await request.json()) as SiteContent;
    const currentContent = await getSiteContent();
    const payload: SiteContent = {
      ...requestedPayload,
      events: currentContent.events,
      blog: {
        ...requestedPayload.blog,
        posts: currentContent.blog.posts,
      },
    };
    const limitIssues = validateContentTextLimits(payload);
    if (limitIssues.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Beberapa teks melebihi batas karakter.",
          issues: limitIssues.slice(0, 20),
        },
        { status: 400 },
      );
    }
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
