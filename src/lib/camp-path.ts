export const CAMP_PREFIX = "/camp";
export const CAMP_BASE_HEADER = "x-clevio-base";

export function isCampPath(pathname: string) {
  return pathname === CAMP_PREFIX || pathname.startsWith(`${CAMP_PREFIX}/`);
}

export function stripCampPrefix(pathname: string) {
  if (pathname === CAMP_PREFIX || pathname === `${CAMP_PREFIX}/`) return "/";
  if (pathname.startsWith(`${CAMP_PREFIX}/`)) return pathname.slice(CAMP_PREFIX.length) || "/";
  return pathname;
}

export function withBase(base: string, path: string) {
  if (!base) return path;
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (path === base || path.startsWith(`${base}/`)) return path;
  return path === "/" ? base : `${base}${path}`;
}

export function browserPublicBase() {
  if (typeof window === "undefined") return "";
  return isCampPath(window.location.pathname) ? CAMP_PREFIX : "";
}

export function browserPublicPath(path: string) {
  return withBase(browserPublicBase(), path);
}
