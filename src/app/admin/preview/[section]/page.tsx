import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import HomePage from "@/components/home/HomePage";
import { getSiteContent } from "@/lib/content";
import PreviewVisibility from "@/components/admin/PreviewVisibility";
import PreviewAssets from "@/components/admin/PreviewAssets";
import { ADMIN_SESSION_COOKIE, isValidToken } from "@/lib/auth";
import { getPreviewKeys } from "@/lib/preview";

interface Props {
  params: { section: string };
}

export default async function PreviewSectionPage({ params }: Props) {
  const cookieStore = await cookies();
  let token = typeof cookieStore.get === "function"
    ? cookieStore.get(ADMIN_SESSION_COOKIE)?.value
    : undefined;

  if (!token) {
    const headerStore = await headers();
    const cookieHeader =
      typeof headerStore.get === "function"
        ? headerStore.get("cookie") ?? ""
        : "";
    token = extractCookie(cookieHeader, ADMIN_SESSION_COOKIE);
  }

  if (!isValidToken(token)) {
    redirect("/login?from=/admin");
  }

  const content = await getSiteContent();
  const allowed = getPreviewKeys(params.section);

  return (
    <div className="preview-scoped">
      <HomePage content={content} />
      <PreviewAssets />
      <PreviewVisibility keys={allowed} />
    </div>
  );
}

function extractCookie(cookieHeader: string, name: string) {
  const matches = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));
  if (!matches) return undefined;
  const value = matches.substring(name.length + 1);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
