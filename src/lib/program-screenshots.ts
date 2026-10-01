import type { Program } from "../types/content";

export function programScreenshots(program: Pick<Program, "projectImages" | "projectImage" | "image">) {
  if (Array.isArray(program.projectImages)) {
    return program.projectImages.map((image) => image.trim()).filter(Boolean);
  }
  const fallback = (program.projectImage || program.image || "").trim();
  return fallback ? [fallback] : [];
}
