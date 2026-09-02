import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE, isValidToken } from "@/lib/auth";

export async function hasAdminSession() {
  const cookieStore = await cookies();
  return isValidToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdminSession(returnTo: string) {
  if (!(await hasAdminSession())) {
    redirect(`/login?from=${encodeURIComponent(returnTo)}`);
  }
}

export async function isAuthorizedAdminRequest(request: Request) {
  const cookieStore = await cookies();
  const serverToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (isValidToken(serverToken)) return true;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(ADMIN_SESSION_COOKIE.length + 1);

  if (!token) return false;
  try {
    return isValidToken(decodeURIComponent(token));
  } catch {
    return false;
  }
}
