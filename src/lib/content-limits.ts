export interface ContentLimitIssue {
  path: string;
  limit: number;
  length: number;
}

const MEDIA_KEY_PATTERN = /(image|gambar|logo|avatar|shape|icon|href|link|tautan|url|video|media)/i;
const BODY_KEY_PATTERN = /(^|\.)(body)$/i;
const LONG_TEXT_KEY_PATTERN = /(description|excerpt|message|text|blurb|content)/i;
const TITLE_KEY_PATTERN = /(title|heading|headline)/i;
const SHORT_TEXT_KEY_PATTERN = /(label|tagline|eyebrow|name|role|author|days|time|date|age|highlight)/i;
const CONTACT_KEY_PATTERN = /(phone|whatsapp)/i;
const EMAIL_KEY_PATTERN = /email/i;
const ADDRESS_KEY_PATTERN = /(address|location)/i;

export function getContentTextLimit(key: string, multiline = false) {
  if (MEDIA_KEY_PATTERN.test(key)) return 2000;
  if (BODY_KEY_PATTERN.test(key) || /isi (artikel|event)|konten lengkap/i.test(key)) return 8000;
  if (EMAIL_KEY_PATTERN.test(key)) return 160;
  if (CONTACT_KEY_PATTERN.test(key)) return 40;
  if (ADDRESS_KEY_PATTERN.test(key)) return multiline ? 220 : 140;
  if (LONG_TEXT_KEY_PATTERN.test(key)) return multiline ? 360 : 220;
  if (TITLE_KEY_PATTERN.test(key)) return multiline ? 140 : 100;
  if (SHORT_TEXT_KEY_PATTERN.test(key)) return 80;
  return multiline ? 300 : 120;
}

export function validateContentTextLimits(value: unknown) {
  const issues: ContentLimitIssue[] = [];

  const visit = (current: unknown, path: string) => {
    if (typeof current === "string") {
      const key = path.split(".").at(-1) ?? path;
      const limit = getContentTextLimit(key, LONG_TEXT_KEY_PATTERN.test(key));
      if (current.length > limit) {
        issues.push({ path, limit, length: current.length });
      }
      return;
    }

    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }

    if (current && typeof current === "object") {
      Object.entries(current).forEach(([key, item]) => {
        visit(item, path ? `${path}.${key}` : key);
      });
    }
  };

  visit(value, "");
  return issues;
}
