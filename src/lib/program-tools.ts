export interface ProgramTool {
  name: string;
  logo: string;
}

const TOOL_ICON_RULES: Array<{ match: string; icon: string }> = [
  { match: "scratch", icon: "/assets/img/program/detail/software-scratch.svg" },
  { match: "code.org", icon: "/assets/img/program/detail/software-codeorg.svg" },
  { match: "kodu", icon: "/assets/img/program/detail/software-construct3.svg" },
  { match: "bebras", icon: "/assets/img/program/detail/software-codeorg.svg" },
  { match: "minecraft", icon: "/assets/img/program/detail/software-minecraft.svg" },
  { match: "gdevelop", icon: "/assets/img/program/detail/software-construct3.svg" },
  { match: "construct", icon: "/assets/img/program/detail/software-construct3.svg" },
  { match: "canva", icon: "/assets/img/program/detail/software-canva.svg" },
  { match: "book creator", icon: "/assets/img/program/detail/software-web.svg" },
  { match: "app inventor", icon: "/assets/img/program/detail/software-web.svg" },
  { match: "thunkable", icon: "/assets/img/program/detail/software-web.svg" },
  { match: "makecode", icon: "/assets/img/program/detail/software-codeorg.svg" },
  { match: "trinket", icon: "/assets/img/program/detail/software-python.svg" },
  { match: "visual studio code", icon: "/assets/img/program/detail/software-web.svg" },
  { match: "roblox", icon: "/assets/img/program/detail/software-roblox-studio.svg" },
  { match: "html", icon: "/assets/img/program/detail/software-web.svg" },
  { match: "python", icon: "/assets/img/program/detail/software-python.svg" },
];

const FALLBACK_TOOL_LOGO = "/assets/img/program/detail/software-codeorg.svg";

export function defaultToolLogo(name: string) {
  const normalized = name.toLowerCase();
  const rule = TOOL_ICON_RULES.find((entry) => normalized.includes(entry.match));
  return rule?.icon ?? FALLBACK_TOOL_LOGO;
}

function usableLogo(logo: string, name: string) {
  const value = logo.trim();
  if (
    value.startsWith("/")
    || value.startsWith("https://")
    || value.startsWith("http://")
    || value.startsWith("data:image/")
  ) {
    return value;
  }
  return defaultToolLogo(name);
}

export function normalizeProgramTool(value: unknown): ProgramTool | null {
  if (typeof value === "string") {
    const name = value.trim();
    return name ? { name, logo: defaultToolLogo(name) } : null;
  }
  if (!value || typeof value !== "object") return null;
  const record = value as { name?: unknown; logo?: unknown };
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!name) return null;
  const logo = typeof record.logo === "string" ? usableLogo(record.logo, name) : defaultToolLogo(name);
  return { name, logo };
}

export function normalizeProgramTools(tools: unknown): ProgramTool[] {
  if (!Array.isArray(tools)) return [];
  return tools.flatMap((tool) => {
    const normalized = normalizeProgramTool(tool);
    return normalized ? [normalized] : [];
  });
}
