import fs from "node:fs/promises";
import path from "node:path";

const TEMPLATE_PATH = path.join(process.cwd(), "src", "templates", "home.html");

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function getTemplateMarkup(initialLogo?: string): Promise<string> {
  const markup = await fs.readFile(TEMPLATE_PATH, "utf-8");
  if (!initialLogo) return markup;

  return markup.replaceAll(
    "/assets/img/logo/logo.svg",
    escapeHtmlAttribute(initialLogo),
  );
}
