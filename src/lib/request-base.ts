import "server-only";

import { headers } from "next/headers";

import { CAMP_BASE_HEADER, CAMP_PREFIX } from "@/lib/camp-path";

export async function getRequestBasePath() {
  const headerStore = await headers();
  return headerStore.get(CAMP_BASE_HEADER) === CAMP_PREFIX ? CAMP_PREFIX : "";
}
