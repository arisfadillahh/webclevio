import fs from "node:fs/promises";
import path from "node:path";
import { parseHTML } from "linkedom";

import { bindTemplate, DEFAULT_ROOT_ID } from "@/lib/themeBinding";
import type { SiteContent } from "@/types/content";

const TEMPLATE_PATH = path.join(process.cwd(), "src", "templates", "home.html");

export async function getTemplateMarkup(): Promise<string> {
  return fs.readFile(TEMPLATE_PATH, "utf-8");
}

export async function getBoundTemplateMarkup(
  content: SiteContent,
  rootId: string = DEFAULT_ROOT_ID,
): Promise<string> {
  const markup = await getTemplateMarkup();
  const { document } = parseHTML(`<div id="${rootId}">${markup}</div>`);
  const root = document.getElementById(rootId);
  if (!root) return markup;

  bindTemplate(root as unknown as HTMLElement, content, {
    attachWindowEvents: false,
    enableSmoothScroll: false,
    rootId,
    documentRef: document,
  });

  return root.innerHTML;
}
