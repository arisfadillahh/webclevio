import fs from "node:fs/promises";
import path from "node:path";

import type { SiteContent } from "@/types/content";

const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");

export async function getSiteContent(): Promise<SiteContent> {
  const raw = await fs.readFile(CONTENT_PATH, "utf-8");
  return JSON.parse(raw) as SiteContent;
}

export async function updateSiteContent(payload: SiteContent): Promise<void> {
  const data = JSON.stringify(payload, null, 2);
  await fs.writeFile(CONTENT_PATH, `${data}\n`, "utf-8");
}
