import { z } from "zod";

const publicationStatus = z.enum(["draft", "published"]);
const imagePath = z
  .string()
  .trim()
  .min(1, "Gambar wajib diisi.")
  .max(800)
  .refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), "Gunakan URL gambar atau path yang diawali /.");

export const articleInputSchema = z.object({
  id: z.string().trim().min(1).max(100).optional(),
  slug: z
    .string()
    .trim()
    .max(120)
    .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung."),
  title: z.string().trim().min(4).max(100),
  excerpt: z.string().trim().min(20).max(220),
  body: z.string().trim().min(80).max(20_000),
  image: imagePath,
  date: z.string().trim().min(4).max(40),
  author: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(60),
  readingTime: z.string().trim().min(2).max(32),
  status: publicationStatus,
  gallery: z.array(imagePath).max(8, "Maksimal 8 gambar dokumentasi.").default([]),
  galleryMode: z.enum(["carousel", "grid"]).default("carousel"),
});

export const eventInputSchema = z.object({
  id: z.string().trim().min(1).max(100).optional(),
  date: z.string().trim().min(4).max(48),
  time: z.string().trim().min(2).max(48),
  title: z.string().trim().min(4).max(100),
  location: z.string().trim().min(2).max(120),
  description: z.string().trim().min(20).max(260),
  image: imagePath,
  status: publicationStatus,
  audience: z.string().trim().min(2).max(100),
  landingPageUrl: z.string().trim().url("Link landing page harus berupa URL lengkap.").max(800),
});

export function formatValidationIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}
