const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

export function getSafeLocalPath(value: string | null | undefined, fallback = "/admin") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\") || CONTROL_CHARACTER_PATTERN.test(value)) return fallback;
  return value;
}
