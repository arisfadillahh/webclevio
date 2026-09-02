export const SECTION_PREVIEW_MAP: Record<string, string[]> = {
  header: ["header", "header-top"],
  hero: ["hero"],
  branding: ["header", "header-top"],
  programs: ["programs"],
  freeTrial: ["free-trial"],
  about: ["about"],
  activities: ["activities"],
  testimonials: ["testimonials"],
  partners: ["partners"],
  news: ["news"],
  blog: ["news"],
  newsletter: ["newsletter"],
  instagram: ["instagram"],
  contact: ["contact"],
  "work-process": ["work-process"],
  events: ["work-process"],
};

export function getPreviewKeys(section: string): string[] {
  return SECTION_PREVIEW_MAP[section] ?? [section];
}
