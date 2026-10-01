import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { CAMP_BASE_HEADER, CAMP_PREFIX, isCampPath, stripCampPrefix } from "@/lib/camp-path";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isCampPath(pathname)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = stripCampPrefix(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CAMP_BASE_HEADER, CAMP_PREFIX);
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/camp", "/camp/:path*"],
};
