import type { SiteContent } from "../types/content";

export interface HomePageSection {
  id: string;
  label: string;
  detail: string;
  hiddenByDefault?: boolean;
}

export const HOME_PAGE_SECTIONS: HomePageSection[] = [
  { id: "hero", label: "Bagian atas", detail: "Judul dan gambar pembuka" },
  { id: "partners", label: "Partner", detail: "Logo partner" },
  { id: "about", label: "Tentang", detail: "Profil Clevio" },
  { id: "activities", label: "Aktivitas", detail: "Kegiatan yang ditampilkan" },
  { id: "programs", label: "Level belajar", detail: "Kartu level dan software" },
  { id: "work-process", label: "Alur belajar", detail: "Langkah proses belajar" },
  { id: "free-trial", label: "Free Trial", detail: "Ajakan daftar setelah level" },
  { id: "events", label: "Student Showcase", detail: "Karya yang dipamerkan" },
  { id: "gallery", label: "Galeri Karya", detail: "Galeri foto karya", hiddenByDefault: true },
  { id: "news", label: "Clevio Stories", detail: "Artikel dan cerita", hiddenByDefault: true },
  { id: "testimonials", label: "Testimoni", detail: "Kata orang tua" },
  { id: "cta", label: "Ajakan penutup", detail: "Tombol di akhir halaman" },
  { id: "instagram", label: "Instagram", detail: "Foto dan tautan Instagram" },
  { id: "contact", label: "Kontak dan footer", detail: "Informasi di bagian bawah" },
];

const SECTION_IDS = new Set(HOME_PAGE_SECTIONS.map((section) => section.id));

export function isKnownHomeSection(id: string) {
  return SECTION_IDS.has(id);
}

export function resolveSectionVisibility(visibility: SiteContent["sectionVisibility"]) {
  return Object.fromEntries(
    HOME_PAGE_SECTIONS.map((section) => [
      section.id,
      typeof visibility?.[section.id] === "boolean" ? visibility[section.id] : !section.hiddenByDefault,
    ]),
  );
}

export function isHomeSectionVisible(content: Pick<SiteContent, "sectionVisibility">, id: string) {
  if (!isKnownHomeSection(id)) return true;
  return resolveSectionVisibility(content.sectionVisibility)[id];
}
