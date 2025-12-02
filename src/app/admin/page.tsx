import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getSiteContent } from "@/lib/content";
import { ADMIN_SESSION_COOKIE, isValidToken } from "@/lib/auth";
import { getTemplateMarkup } from "@/lib/template";

export const metadata = {
  title: "Clevio Admin Dashboard",
};

export default async function AdminPage() {
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

  const [content, templateMarkup] = await Promise.all([
    getSiteContent(),
    getTemplateMarkup(),
  ]);
  return <AdminDashboard initialContent={content} templateMarkup={templateMarkup} />;
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
