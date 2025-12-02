import fs from "node:fs/promises";
import path from "node:path";

const TEMPLATE_PATH = path.join(process.cwd(), "src", "templates", "home.html");

export async function getTemplateMarkup(): Promise<string> {
  return fs.readFile(TEMPLATE_PATH, "utf-8");
}
