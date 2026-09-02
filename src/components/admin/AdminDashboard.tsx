"use client";

import { useMemo, useState, ChangeEvent, useId, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { NavItem, SiteContent } from "@/types/content";
import ThemeBinder from "@/components/home/ThemeBinder";
import PreviewAssets, { fixAssetPaths } from "@/components/admin/PreviewAssets";
import { getPreviewKeys } from "@/lib/preview";
import { getContentTextLimit } from "@/lib/content-limits";
import {
  PiCheckCircleBold,
  PiCircleNotchBold,
  PiPlusBold,
  PiTrashBold,
  PiHouseBold,
  PiPaletteBold,
  PiUserBold,
  PiCalendarBold,
  PiArticleBold,
  PiPhoneBold,
  PiImageBold,
  PiBellBold,
  PiInstagramLogoBold,
  PiChalkboardTeacherBold,
  PiInfoBold,
  PiListBold,
  PiCodeBold,
  PiMagnifyingGlassBold,
  PiArrowSquareOutBold,
  PiLinkBold,
  PiNewspaperBold,
  PiRocketLaunchBold,
  PiArrowRightBold,
  PiLockKeyBold,
} from "react-icons/pi";

interface Props {
  initialContent: SiteContent;
  templateMarkup: string;
  embedded?: boolean;
}

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  previewMode?: "asset" | "logo";
}

function ImageInput({
  label,
  value,
  onChange,
  helperText,
  previewMode = "asset",
}: ImageInputProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string | null>(null);
  const previewFailed = failedPreviewUrl === value;

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran maksimum 2MB");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (value && value.startsWith("/uploads/")) {
        formData.append("previousPath", value);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Upload gagal");
      }

      const data = (await res.json()) as { url: string };
      onChange(data.url);
    } catch (err) {
      console.error(err);
      setError("Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`image-input ${previewMode === "logo" ? "is-logo" : ""}`}>
      <div className="image-input-preview">
        {value && !previewFailed ? (
          <Image
            src={value}
            alt={`Preview ${label}`}
            width={360}
            height={160}
            sizes="(max-width: 768px) 100vw, 360px"
            unoptimized
            onError={() => setFailedPreviewUrl(value)}
          />
        ) : (
          <div className="image-input-empty">
            <PiImageBold aria-hidden="true" />
            <span>{value ? "Gambar tidak dapat dimuat" : "Belum ada gambar"}</span>
          </div>
        )}
      </div>

      <div className="image-input-controls">
        <label className="image-input-url">
          <span>{label}</span>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="URL atau /uploads/..."
          />
        </label>
        <label
          className={`image-upload-trigger ${uploading ? "is-uploading" : ""}`}
          htmlFor={inputId}
          aria-disabled={uploading}
        >
          <PiImageBold aria-hidden="true" />
          {uploading ? "Mengunggah..." : "Pilih file"}
        </label>
        <input
          id={inputId}
          className="image-file-input"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFile}
          disabled={uploading}
        />
      </div>

      <div className="image-input-meta">
        {helperText && <small>{helperText}</small>}
        {error && <small className="image-input-error">{error}</small>}
      </div>
    </div>
  );
}

function getPartnerDisplayName(id: string, index: number) {
  if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id)) return `Partner ${index + 1}`;
  return id
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || `Partner ${index + 1}`;
}

const TECH_ICON_OPTIONS = [
  { value: "fa-solid fa-code", label: "Kode" },
  { value: "fa-solid fa-laptop-code", label: "Laptop Coding" },
  { value: "fa-solid fa-microchip", label: "Microchip" },
  { value: "fa-solid fa-robot", label: "AI Robot" },
  { value: "fa-solid fa-brain", label: "AI Brain" },
  { value: "fa-solid fa-database", label: "Database" },
  { value: "fa-solid fa-cloud", label: "Cloud" },
  { value: "fa-solid fa-network-wired", label: "Network" },
  { value: "fa-solid fa-terminal", label: "Terminal" },
  { value: "fa-solid fa-code-branch", label: "Code Branch" },
  { value: "fa-solid fa-gears", label: "Automation" },
  { value: "fa-solid fa-cubes", label: "Technology Blocks" },
];

interface TechIconSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function TechIconSelect({ label, value, onChange }: TechIconSelectProps) {
  const selectedValue = TECH_ICON_OPTIONS.some((option) => option.value === value)
    ? value
    : TECH_ICON_OPTIONS[0].value;

  return (
    <label className="tech-icon-field">
      {label}
      <span className="tech-icon-control">
        <span className="tech-icon-preview" aria-hidden="true">
          <i className={selectedValue} />
        </span>
        <select value={selectedValue} onChange={(event) => onChange(event.target.value)}>
          {TECH_ICON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

type Status = "idle" | "saving" | "saved" | "error";

function publicContentHref(href: string) {
  return href.startsWith("#") ? `/${href}` : href;
}

const SOCIAL_FIELDS = [
  { icon: "facebook-f", label: "Facebook" },
  { icon: "instagram", label: "Instagram" },
  { icon: "linkedin-in", label: "LinkedIn" },
];

type ActiveSection =
  | "overview"
  | "navigation"
  | "branding"
  | "hero"
  | "partners"
  | "about"
  | "programs"
  | "freeTrial"
  | "activities"
  | "workProcess"
  | "eventLinks"
  | "blog"
  | "newsletter"
  | "instagram"
  | "testimonials"
  | "contact"
  | "advanced";

const SAFE_CONTENT_SECTIONS = new Set<ActiveSection>([
  "navigation",
  "branding",
  "hero",
  "partners",
  "about",
  "programs",
  "freeTrial",
  "activities",
  "workProcess",
  "testimonials",
  "newsletter",
  "instagram",
  "contact",
]);

export default function AdminDashboard({ initialContent, templateMarkup, embedded = false }: Props) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>({
    ...initialContent,
    about: {
      ...initialContent.about,
      ctaLabel: initialContent.about?.ctaLabel ?? initialContent.branding.ctaLabel,
      ctaLink: initialContent.about?.ctaLink ?? initialContent.branding.ctaLink,
      phone: initialContent.about?.phone ?? initialContent.contact.whatsapp,
    },
    programDecorations: initialContent.programDecorations ?? {
      topShape: "/assets/img/section-top-shape.png",
      bottomShape: "/assets/img/section-bottom-shape.png",
      mask: "/assets/img/tech/code-cloud.svg",
      mask2: "/assets/img/tech/circuit-plus.svg",
      pencil: "/assets/img/tech/code-pencil.svg",
      compass: "/assets/img/tech/chip-ruler.svg",
    },
    activitiesDecorations: initialContent.activitiesDecorations ?? {
      pencil: "/assets/img/tech/code-pencil.svg",
      giraffe: "/assets/img/tech/ai-bot.svg",
      radius: "/assets/img/tech/neural-network.svg",
    },
    footer: {
      text: initialContent.footer?.text ?? "© Clevio Innovator Camp 2025. All rights reserved.",
      quickLinks: initialContent.footer?.quickLinks ?? [],
      categories: initialContent.footer?.categories ?? [],
      policies: initialContent.footer?.policies ?? [],
      blurb:
        initialContent.footer?.blurb ??
        initialContent.about?.text ??
        "Phasellus ultricies aliquam volutpat ullamcorper laoreet neque.",
      contacts:
        initialContent.footer?.contacts ??
        [
          {
            label: "Call Us 7/24",
            value: initialContent.contact?.whatsapp ?? "+62 812-3456-7890",
            href: `tel:${(initialContent.contact?.whatsapp ?? "").replace(/[^+\\d]/g, "")}`,
          },
          {
            label: "Make a Quote",
            value: initialContent.contact?.email ?? "info@clevio.id",
            href: `mailto:${initialContent.contact?.email ?? "info@clevio.id"}`,
          },
          {
            label: "Location",
            value: initialContent.contact?.address ?? "Alamat sekolah",
            href: undefined,
          },
        ],
      newsletter: initialContent.footer?.newsletter ?? {
        title: "Newsletter",
        text: "Dapatkan tips parenting, promo event, dan modul belajar setiap minggu.",
      },
    },
    programsSection: initialContent.programsSection ?? {
      tagline: "Our Programs",
      title: "We Meet Kids At Their Level<br>Regardless Of Their Age",
    },
    freeTrial: initialContent.freeTrial ?? {
      eyebrow: "Free Trial Terbatas",
      title: "Yuk Coba Free Trial Coding",
      highlight: "Gratis!",
      subtitle: "Lihat Anak Mulai Belajar & Berkarya",
      description:
        "Ajak anak ikut sesi trial gratis bersama mentor Clevio. Kuota terbatas untuk kesempatan terbaik ini.",
      benefits: [
        "Gratis, tanpa komitmen",
        "Didampingi mentor langsung",
        "Dapat rekomendasi level yang tepat",
      ],
      ctaLabel: "Daftar Free Trial Gratis",
      ctaLink: "https://lms.clev.io/free-trial",
      note: "Kuota free trial terbatas! Daftar sekarang sebelum penuh.",
      visualImage: "/assets/img/free-trial-coding.png",
      availabilityTitle: "Slot Free Trial Masih Tersedia!",
      availabilityText: "Isi form singkat dan tim Clevio akan menghubungi Anda.",
      availabilityBadge: "Kuota Terbatas",
      trustTitle: "Aman & Terpercaya",
      trustText: "Kelas trial bersama mentor berpengalaman Clevio.",
    },
    instructorsDecorations: initialContent.instructorsDecorations ?? {
      loveShape: "/assets/img/tech/neural-network.svg",
      frameShape: "/assets/img/tech/code-frame.svg",
    },
    testimonialsSection: initialContent.testimonialsSection ?? {
      tagline: "Testimoni Orang Tua",
      title: "Apa Kata Orang Tua Tentang Clevio",
      description: "Cerita nyata tentang anak yang belajar, bertumbuh, dan makin percaya diri bersama Clevio.",
    },
    partners: initialContent.partners ?? [
      { id: "pencilbox", logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='60' viewBox='0 0 180 60'><text x='50%' y='50%' fill='%2394a3b8' font-size='20' font-family='Arial, sans-serif' text-anchor='middle' dominant-baseline='middle'>PencilBox</text></svg>" },
      { id: "udemy", logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='60' viewBox='0 0 150 60'><text x='50%' y='50%' fill='%2394a3b8' font-size='22' font-family='Arial, sans-serif' font-weight='600' text-anchor='middle' dominant-baseline='middle'>udemy</text></svg>" },
      { id: "amd", logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='60' viewBox='0 0 140 60'><text x='50%' y='50%' fill='%2394a3b8' font-size='22' font-family='Arial, sans-serif' font-weight='700' text-anchor='middle' dominant-baseline='middle'>AMD</text></svg>" },
      { id: "coursera", logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='60' viewBox='0 0 180 60'><text x='50%' y='50%' fill='%2394a3b8' font-size='20' font-family='Arial, sans-serif' font-weight='700' text-anchor='middle' dominant-baseline='middle'>coursera</text></svg>" },
      { id: "amazon", logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='170' height='60' viewBox='0 0 170 60'><text x='50%' y='50%' fill='%2394a3b8' font-size='20' font-family='Arial, sans-serif' font-weight='700' text-anchor='middle' dominant-baseline='middle'>amazon</text></svg>" },
      { id: "adobe", logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='60' viewBox='0 0 150 60'><text x='50%' y='50%' fill='%2394a3b8' font-size='20' font-family='Arial, sans-serif' font-weight='700' text-anchor='middle' dominant-baseline='middle'>Adobe</text></svg>" },
    ],
  });
  const [status, setStatus] = useState<Status>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>(embedded ? "hero" : "overview");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [navigationSearch, setNavigationSearch] = useState("");
  const [advancedJson, setAdvancedJson] = useState(() => JSON.stringify(initialContent, null, 2));
  const [advancedError, setAdvancedError] = useState<string | null>(null);
  const adminShellRef = useRef<HTMLDivElement>(null);
  const lastSavedSnapshotRef = useRef(JSON.stringify(content));
  const isDirty = useMemo(
    () => JSON.stringify(content) !== lastSavedSnapshotRef.current,
    [content],
  );

  useEffect(() => {
    if (activeSection === "advanced") {
      setAdvancedJson(JSON.stringify(content, null, 2));
      setAdvancedError(null);
    }
  }, [activeSection, content]);

  useEffect(() => {
    const root = adminShellRef.current;
    if (!root) return;

    const fieldSelector =
      'input:not([type="file"]):not([type="number"]):not([type="range"]):not([data-no-limit]), textarea:not([data-no-limit])';
    const configureField = (field: HTMLInputElement | HTMLTextAreaElement) => {
      const label = field.closest("label");
      const labelText = label?.childNodes[0]?.textContent?.trim() || field.placeholder || "konten";
      const limit = getContentTextLimit(labelText, field instanceof HTMLTextAreaElement);
      field.maxLength = limit;
      if (label) label.dataset.characterCounter = `${field.value.length}/${limit} karakter`;
    };
    const configureFields = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(fieldSelector).forEach(configureField);
    };
    const handleInput = (event: Event) => {
      const field = event.target;
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
        if (field.matches(fieldSelector)) configureField(field);
      }
    };

    configureFields(root);
    root.addEventListener("input", handleInput);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            if (node.matches(fieldSelector)) configureField(node as HTMLInputElement | HTMLTextAreaElement);
            configureFields(node);
          }
        });
      });
    });
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      root.removeEventListener("input", handleInput);
      observer.disconnect();
    };
  }, [activeSection]);

  const statCards = useMemo(
    () => [
      { label: "Program Aktif", value: content.programs.length, icon: PiChalkboardTeacherBold },
      { label: "Event Tayang", value: content.events.filter((event) => event.status === "published").length, icon: PiCalendarBold },
      { label: "Artikel Tayang", value: content.blog.posts.filter((post) => post.status === "published").length, icon: PiNewspaperBold },
    ],
    [content],
  );

  const recentContent = useMemo(
    () => [
      ...content.events.map((event) => ({ id: event.id, title: event.title, type: "Event", status: event.status, section: "eventLinks" as ActiveSection })),
      ...content.blog.posts.map((post) => ({ id: post.id, title: post.title, type: "Artikel", status: post.status, section: "blog" as ActiveSection })),
    ].slice(0, 6),
    [content.events, content.blog.posts],
  );

  const navigationItems = useMemo(() => [
    { id: "overview" as ActiveSection, group: "Ringkasan", label: "Dashboard", icon: PiHouseBold, description: "Status dan akses cepat" },
    { id: "navigation" as ActiveSection, group: "Tampilan Utama", label: "Menu Utama", icon: PiListBold, description: "Navigasi header" },
    { id: "branding" as ActiveSection, group: "Tampilan Utama", label: "Branding", icon: PiPaletteBold, description: "Logo dan identitas" },
    { id: "hero" as ActiveSection, group: "Tampilan Utama", label: "Hero", icon: PiImageBold, description: "Bagian pembuka" },
    { id: "partners" as ActiveSection, group: "Tampilan Utama", label: "Partner", icon: PiImageBold, description: "Logo partner" },
    { id: "about" as ActiveSection, group: "Tampilan Utama", label: "Tentang Kami", icon: PiInfoBold, description: "Profil Clevio" },
    { id: "programs" as ActiveSection, group: "Konten Website", label: "Program", icon: PiChalkboardTeacherBold, description: "Program pembelajaran" },
    { id: "freeTrial" as ActiveSection, group: "Konten Website", label: "Free Trial", icon: PiRocketLaunchBold, description: "Ajakan daftar kelas percobaan" },
    { id: "activities" as ActiveSection, group: "Konten Website", label: "Aktivitas", icon: PiArticleBold, description: "Kegiatan mingguan" },
    { id: "workProcess" as ActiveSection, group: "Konten Website", label: "Alur Belajar", icon: PiListBold, description: "Langkah proses" },
    { id: "testimonials" as ActiveSection, group: "Konten Website", label: "Testimonial", icon: PiArticleBold, description: "Kata orang tua" },
    { id: "eventLinks" as ActiveSection, group: "Publikasi", label: "Event & Link", icon: PiRocketLaunchBold, description: "Kartu menuju landing page" },
    { id: "blog" as ActiveSection, group: "Publikasi", label: "Artikel", icon: PiNewspaperBold, description: "Artikel dan berita" },
    { id: "newsletter" as ActiveSection, group: "Publikasi", label: "Newsletter", icon: PiBellBold, description: "Berlangganan" },
    { id: "instagram" as ActiveSection, group: "Publikasi", label: "Instagram", icon: PiInstagramLogoBold, description: "Feed Instagram" },
    { id: "contact" as ActiveSection, group: "Pengaturan", label: "Kontak & Footer", icon: PiPhoneBold, description: "Informasi kontak" },
    { id: "advanced" as ActiveSection, group: "Pengaturan", label: "Data Lanjutan", icon: PiCodeBold, description: "Editor data lengkap" },
  ], []);

  const navigationGroups = useMemo(() => {
    const query = navigationSearch.trim().toLowerCase();
    const filteredItems = query
      ? navigationItems.filter((item) => `${item.label} ${item.description}`.toLowerCase().includes(query))
      : navigationItems;
    return ["Ringkasan", "Tampilan Utama", "Konten Website", "Publikasi", "Pengaturan"]
      .map((group) => ({ group, items: filteredItems.filter((item) => item.group === group) }))
      .filter((section) => section.items.length > 0);
  }, [navigationItems, navigationSearch]);

  const safeNavigationGroups = useMemo(() => {
    return navigationGroups
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => SAFE_CONTENT_SECTIONS.has(item.id)),
      }))
      .filter((section) => section.items.length > 0);
  }, [navigationGroups]);

  const addNavigationItem = () => {
    setContent((prev) => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        menu: [...prev.navigation.menu, { label: "Menu Baru", href: "#section" }],
      },
    }));
  };

  const updateNavigationItem = (index: number, field: keyof NavItem, value: string) => {
    setContent((prev) => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        menu: prev.navigation.menu.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item,
        ),
      },
    }));
  };

  const removeNavigationItem = (index: number) => {
    setContent((prev) => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        menu: prev.navigation.menu.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const applyAdvancedContent = () => {
    try {
      const parsed = JSON.parse(advancedJson) as SiteContent;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Format konten harus berupa object JSON.");
      }
      setContent(parsed);
      setAdvancedError(null);
    } catch (error) {
      setAdvancedError(error instanceof Error ? error.message : "JSON tidak valid.");
    }
  };

  const handleHeroChange = (field: keyof typeof content.hero, value: string) => {
    setContent((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const handleProgramsSectionChange = (
    field: keyof SiteContent["programsSection"],
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      programsSection: { ...prev.programsSection, [field]: value },
    }));
  };

  const handleFreeTrialChange = (
    field: Exclude<keyof SiteContent["freeTrial"], "benefits">,
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      freeTrial: { ...prev.freeTrial, [field]: value },
    }));
  };

  const updateFreeTrialBenefit = (index: number, value: string) => {
    setContent((prev) => ({
      ...prev,
      freeTrial: {
        ...prev.freeTrial,
        benefits: prev.freeTrial.benefits.map((item, itemIndex) =>
          itemIndex === index ? value : item,
        ),
      },
    }));
  };

  const updateHeroDecoration = (index: number, value: string) => {
    setContent((prev) => {
      const decorations = [...prev.hero.decorations];
      decorations[index] = { ...decorations[index], image: value };
      return { ...prev, hero: { ...prev.hero, decorations } };
    });
  };

  const updateProgram = (
    index: number,
    field: "title" | "description" | "ageRange" | "image" | "projectImage",
    value: string,
  ) => {
    setContent((prev) => {
      const programs = [...prev.programs];
      programs[index] = { ...programs[index], [field]: value };
      return { ...prev, programs };
    });
  };

  const updateProgramList = (
    index: number,
    field: "learningPoints" | "projectExamples" | "tools",
    value: string,
  ) => {
    setContent((prev) => {
      const programs = [...prev.programs];
      programs[index] = { ...programs[index], [field]: value.split(/\r?\n/).slice(0, 6) };
      return { ...prev, programs };
    });
  };

  const addProgram = () => {
    setContent((prev) => ({
      ...prev,
      programs: [
        ...prev.programs,
        {
          id: crypto.randomUUID(),
          title: "Program Baru",
          description: "Deskripsi singkat program",
          ageRange: "3-5 Tahun",
          image: prev.programs[0]?.image ?? "/assets/img/program/01.jpg",
          learningPoints: ["Logika coding", "Kreativitas digital", "Problem solving"],
          projectExamples: ["Game sederhana", "Animasi interaktif"],
          tools: ["Scratch", "Canva"],
          projectImage: prev.programs[0]?.projectImage ?? prev.programs[0]?.image ?? "/assets/img/program/01.jpg",
        },
      ],
    }));
  };

  const removeProgram = (index: number) => {
    setContent((prev) => ({
      ...prev,
      programs: prev.programs.filter((_, idx) => idx !== index),
    }));
  };

  const updateEvent = (
    index: number,
    field: keyof (typeof content.events)[number],
    value: string,
  ) => {
    setContent((prev) => {
      const events = [...prev.events];
      events[index] = { ...events[index], [field]: value };
      return { ...prev, events };
    });
  };

  const addEvent = () => {
    setContent((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        {
          id: crypto.randomUUID(),
          date: "01 Jan 2025",
          time: "09.00",
          title: "Event Baru",
          location: "Clevio Center",
          description: "Tambahkan detail event",
          image: prev.events[0]?.image ?? "/assets/img/news/01.jpg",
          status: "draft",
          audience: "Usia peserta",
          landingPageUrl: "https://",
        },
      ],
    }));
  };

  const removeEvent = (index: number) => {
    setContent((prev) => ({
      ...prev,
      events: prev.events.filter((_, idx) => idx !== index),
    }));
  };

  const updateEventsSection = (
    field: keyof SiteContent["eventsSection"],
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      eventsSection: { ...prev.eventsSection, [field]: value },
    }));
  };

  const updateBlog = (
    index: number,
    field: keyof (typeof content.blog.posts)[number],
    value: string,
  ) => {
    setContent((prev) => {
      const posts = [...prev.blog.posts];
      posts[index] = { ...posts[index], [field]: value };
      return { ...prev, blog: { ...prev.blog, posts } };
    });
  };

  const addBlogPost = () => {
    setContent((prev) => ({
      ...prev,
      blog: {
        ...prev.blog,
        posts: [
          ...prev.blog.posts,
          {
            id: crypto.randomUUID(),
            slug: "judul-artikel-baru",
            title: "Judul Artikel",
            excerpt: "Ringkasan singkat artikel baru.",
            image: prev.blog.posts[0]?.image ?? "",
            date: "01 Jan 2025",
            author: "Clevio Team",
            category: "Insight Clevio",
            readingTime: "5 menit baca",
            status: "draft",
            body: "Tulis isi artikel lengkap di sini.",
            gallery: [],
            galleryMode: "carousel",
          },
        ],
      },
    }));
  };

const removeBlogPost = (index: number) => {
  setContent((prev) => ({
    ...prev,
    blog: {
      ...prev.blog,
      posts: prev.blog.posts.filter((_, idx) => idx !== index),
    },
  }));
};

const handleContactChange = (
  field: keyof typeof content.contact,
  value: string,
) => {
  setContent((prev) => ({
    ...prev,
    contact: { ...prev.contact, [field]: value },
  }));
};

const handleFooterFieldChange = (field: keyof SiteContent["footer"], value: string) => {
  setContent((prev) => ({
    ...prev,
    footer: { ...prev.footer, [field]: value },
  }));
};

const updateFooterNavItem = (
  key: "quickLinks" | "categories" | "policies",
  index: number,
  field: keyof NavItem,
  value: string,
) => {
  setContent((prev) => {
    const list = [...(prev.footer[key] || [])];
    list[index] = { ...list[index], [field]: value };
    return { ...prev, footer: { ...prev.footer, [key]: list } };
  });
};

const addFooterNavItem = (key: "quickLinks" | "categories" | "policies") => {
  setContent((prev) => ({
    ...prev,
    footer: {
      ...prev.footer,
      [key]: [...(prev.footer[key] || []), { label: "Menu baru", href: "#" }],
    },
  }));
};

const removeFooterNavItem = (key: "quickLinks" | "categories" | "policies", index: number) => {
  setContent((prev) => ({
    ...prev,
    footer: {
      ...prev.footer,
      [key]: (prev.footer[key] || []).filter((_, idx) => idx !== index),
    },
  }));
};

const updateFooterContact = (
  index: number,
  field: keyof NonNullable<SiteContent["footer"]["contacts"]>[number],
  value: string,
) => {
  setContent((prev) => {
    const contacts = [...(prev.footer.contacts || [])];
    contacts[index] = { ...contacts[index], [field]: value };
    return { ...prev, footer: { ...prev.footer, contacts } };
  });
};

  const handleBrandingChange = (
    field: keyof typeof content.branding,
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      branding: { ...prev.branding, [field]: value },
    }));
  };

  const updateBrandingSocial = (icon: string, value: string) => {
    setContent((prev) => {
      const existing = new Map(prev.branding.socials.map((item) => [item.icon, item]));
      if (value.trim()) {
        const meta = SOCIAL_FIELDS.find((item) => item.icon === icon);
        existing.set(icon, {
          icon,
          label: meta?.label ?? icon,
          href: value,
        });
      } else {
        existing.delete(icon);
      }
      const ordered = SOCIAL_FIELDS.map((field) => existing.get(field.icon)).filter(Boolean) as typeof prev.branding.socials;
      return {
        ...prev,
        branding: { ...prev.branding, socials: ordered },
      };
    });
  };

  const handleHeroMediaChange = (
    field: keyof typeof content.hero.media,
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        media: { ...prev.hero.media, [field]: value },
      },
    }));
  };

  const handleAboutFieldChange = (
    field: "tagline" | "title" | "text" | "ctaLabel" | "ctaLink" | "phone",
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      about: { ...prev.about, [field]: value },
    }));
  };

  const handleAboutImageChange = (
    field: keyof typeof content.about.images,
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        images: { ...prev.about.images, [field]: value },
      },
    }));
  };

  const updateAboutBullet = (index: number, value: string) => {
    setContent((prev) => {
      const bullets = [...prev.about.bullets];
      bullets[index] = value;
      return { ...prev, about: { ...prev.about, bullets } };
    });
  };

  const handleProgramDecorationChange = (
    field: keyof SiteContent["programDecorations"],
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      programDecorations: { ...prev.programDecorations, [field]: value },
    }));
  };

  const handleActivitiesDecorationChange = (
    field: keyof SiteContent["activitiesDecorations"],
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      activitiesDecorations: { ...prev.activitiesDecorations, [field]: value },
    }));
  };

  const addAboutBullet = () => {
    setContent((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        bullets: [...prev.about.bullets, "Bullet baru"],
      },
    }));
  };

  const removeAboutBullet = (index: number) => {
    setContent((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        bullets: prev.about.bullets.filter((_, idx) => idx !== index),
      },
    }));
  };

  const handleActivitiesFieldChange = (
    field: "tagline" | "title" | "description" | "image",
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      activities: { ...prev.activities, [field]: value },
    }));
  };

  const updateActivityItem = (
    index: number,
    field: keyof (typeof content.activities.items)[number],
    value: string,
  ) => {
    setContent((prev) => {
      const items = [...prev.activities.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, activities: { ...prev.activities, items } };
    });
  };

  const addActivityItem = () => {
    setContent((prev) => ({
      ...prev,
      activities: {
        ...prev.activities,
        items: [
          ...prev.activities.items,
          { title: "Aktivitas baru", description: "Deskripsi singkat", icon: "fa-solid fa-code" },
        ],
      },
    }));
  };

  const removeActivityItem = (index: number) => {
    setContent((prev) => ({
      ...prev,
      activities: {
        ...prev.activities,
        items: prev.activities.items.filter((_, idx) => idx !== index),
      },
    }));
  };

  const addInstagramItem = () => {
    setContent((prev) => ({
      ...prev,
      instagram: [
        ...prev.instagram,
        {
          id: crypto.randomUUID(),
          image: "/assets/img/instagram/01.jpg",
          link: "https://instagram.com/clevio",
        },
      ],
    }));
  };

  const updateInstagramItem = (
    index: number,
    field: keyof (typeof content.instagram)[number],
    value: string,
  ) => {
    setContent((prev) => {
      const instagram = [...prev.instagram];
      instagram[index] = { ...instagram[index], [field]: value };
      return { ...prev, instagram };
    });
  };

  const updateTestimonial = (
    index: number,
    field: keyof (typeof content.testimonials)[number],
    value: string | number,
  ) => {
    setContent((prev) => {
      const testimonials = [...prev.testimonials];
      testimonials[index] = { ...testimonials[index], [field]: value };
      return { ...prev, testimonials };
    });
  };

  const addTestimonial = () => {
    setContent((prev) => ({
      ...prev,
      testimonials: [
        ...prev.testimonials,
        {
          id: crypto.randomUUID(),
          name: "Nama Orang Tua",
          role: "Orang Tua Murid",
          message: "Testimoni baru dari orang tua.",
          avatar: "",
          rating: 5,
        },
      ],
    }));
  };

  const removeTestimonial = (index: number) => {
    setContent((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, idx) => idx !== index),
    }));
  };

  const addPartner = () => {
    setContent((prev) => ({
      ...prev,
      partners: [
        ...prev.partners,
        {
          id: crypto.randomUUID(),
          logo: "/assets/img/partner/new.png",
        },
      ],
    }));
  };

  const updatePartner = (index: number, value: string) => {
    setContent((prev) => {
      const partners = [...prev.partners];
      partners[index] = { ...partners[index], logo: value };
      return { ...prev, partners };
    });
  };

  const removePartner = (index: number) => {
    setContent((prev) => ({
      ...prev,
      partners: prev.partners.filter((_, idx) => idx !== index),
    }));
  };

  const handleWorkProcessFieldChange = (
    field: "tagline" | "title" | "description",
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      benefits: { ...prev.benefits, [field]: value },
    }));
  };

  const updateWorkProcessItem = (
    index: number,
    field: keyof SiteContent["benefits"]["items"][number],
    value: string,
  ) => {
    setContent((prev) => {
      const items = [...prev.benefits.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, benefits: { ...prev.benefits, items } };
    });
  };

  const addWorkProcessItem = () => {
    setContent((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        items: [
          ...prev.benefits.items,
          {
            title: "Langkah baru",
            description: "Deskripsi singkat proses.",
            icon: "fa-solid fa-code"
          },
        ],
      },
    }));
  };

  const removeWorkProcessItem = (index: number) => {
    setContent((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        items: prev.benefits.items.filter((_, idx) => idx !== index),
      },
    }));
  };

  const removeInstagramItem = (index: number) => {
    setContent((prev) => ({
      ...prev,
      instagram: prev.instagram.filter((_, idx) => idx !== index),
    }));
  };

  const handleNewsletterChange = (
    field: keyof typeof content.newsletter,
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      newsletter: { ...prev.newsletter, [field]: value },
    }));
  };

  const handleTestimonialsSectionChange = (
    field: keyof SiteContent["testimonialsSection"],
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      testimonialsSection: { ...prev.testimonialsSection, [field]: value },
    }));
  };

  const saveChanges = async () => {
    if (status === "saving") return;
    setStatus("saving");
    setSaveError(null);
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message || "Gagal menyimpan perubahan.");
      }
      setStatus("saved");
      lastSavedSnapshotRef.current = JSON.stringify(content);
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error(error);
      setSaveError(error instanceof Error ? error.message : "Gagal menyimpan perubahan.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const resetContent = () => {
    const savedContent = JSON.parse(lastSavedSnapshotRef.current) as SiteContent;
    setContent(savedContent);
    setAdvancedJson(JSON.stringify(savedContent, null, 2));
    setAdvancedError(null);
    setSaveError(null);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="admin-overview">
            <div className={`admin-save-notice ${isDirty ? "dirty" : "saved"}`}>
              <PiCheckCircleBold />
              <div>
                <strong>{isDirty ? "Ada perubahan yang belum disimpan" : "Semua perubahan sudah tersimpan"}</strong>
                <span>{isDirty ? "Periksa hasilnya lalu klik Simpan Perubahan." : "Konten website sudah sama dengan data di dashboard."}</span>
              </div>
            </div>

            <div className="admin-quick-actions">
              <button onClick={() => setActiveSection("eventLinks")}>
                <span><PiRocketLaunchBold /></span>
                <div><strong>Tambahkan Event</strong><small>Hubungkan kartu ke landing page yang sudah jadi.</small></div>
                <PiArrowRightBold />
              </button>
              <button onClick={() => setActiveSection("blog")}>
                <span><PiNewspaperBold /></span>
                <div><strong>Tulis Artikel</strong><small>Kelola ringkasan dan isi halaman artikel.</small></div>
                <PiArrowRightBold />
              </button>
            </div>

            <div className="admin-stats">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label}>
                    <span className="admin-stat-icon"><Icon /></span>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="admin-overview-panels">
              <section className="admin-recent-panel">
                <div className="admin-panel-heading"><div><span>Konten terbaru</span><h2>Event dan artikel</h2></div></div>
                <div className="admin-recent-list">
                  {recentContent.map((item) => (
                    <button key={`${item.type}-${item.id}`} onClick={() => setActiveSection(item.section)}>
                      <span className="recent-content-icon">{item.type === "Event" ? <PiCalendarBold /> : <PiNewspaperBold />}</span>
                      <div><strong>{item.title}</strong><small>{item.type}</small></div>
                      <span className={`admin-content-status ${item.status}`}>{item.status === "published" ? "Tayang" : "Draft"}</span>
                    </button>
                  ))}
                </div>
              </section>
              <section className="admin-help-panel">
                <span>Alur kerja aman</span>
                <h2>Edit dengan lebih terarah</h2>
                <ol>
                  <li>Pilih bagian konten dari menu kiri.</li>
                  <li>Isi form dan perhatikan batas karakter.</li>
                  <li>Buka pratinjau atau halaman publik.</li>
                  <li>Simpan setelah hasilnya sesuai.</li>
                </ol>
                <a href="/" target="_blank" rel="noreferrer">Buka website <PiArrowSquareOutBold /></a>
              </section>
            </div>
          </div>
        );

      case "navigation":
        return (
          <>
            <div className="section-context">
              <h2>Menu Utama Website</h2>
              <p>Atur label dan tujuan menu yang tampil di header website.</p>
            </div>

            <PreviewFrame
              section="header"
              title="Navigasi Header"
              description="Preview menu utama website"
              height={260}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard title="Daftar Menu" description="Gunakan tautan section seperti #about atau URL halaman lengkap.">
              <div className="list-header">
                <p>{content.navigation.menu.length} Menu</p>
                <button className="ghost-btn small" onClick={addNavigationItem}>
                  <PiPlusBold /> Tambah Menu
                </button>
              </div>
              <div className="admin-list">
                {content.navigation.menu.map((item, index) => (
                  <div key={`navigation-${index}`} className="list-card">
                    <div className="list-card-header">
                      <strong>{item.label || `Menu ${index + 1}`}</strong>
                      <button onClick={() => removeNavigationItem(index)} aria-label={`Hapus ${item.label}`}>
                        <PiTrashBold />
                      </button>
                    </div>
                    <div className="form-grid">
                      <label>
                        Label Menu
                        <input
                          value={item.label}
                          onChange={(event) => updateNavigationItem(index, "label", event.target.value)}
                          placeholder="Tentang Kami"
                        />
                      </label>
                      <label>
                        URL Menu
                        <input
                          value={item.href}
                          onChange={(event) => updateNavigationItem(index, "href", event.target.value)}
                          placeholder="#about"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </>
        );

      case "branding":
        return (
          <>
            <div className="section-context">
              <h2>🏷️ Branding & Identitas Website</h2>
              <p>Section ini mengatur logo, nama brand, dan informasi kontak yang muncul di header website. Perubahan akan terlihat di bagian atas semua halaman.</p>
            </div>

            <PreviewFrame
              section="header"
              title="Header & CTA"
              description="Tampilan navigasi utama lengkap dengan tombol ajakan"
              height={360}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Informasi Utama Brand"
              description="Nama, logo, dan tagline yang muncul di header"
            >
              <div className="form-grid">
              <label>
                Nama Brand
                <input
                  value={content.branding.name}
                  onChange={(e) => handleBrandingChange("name", e.target.value)}
                  placeholder="Clevio Innovator Camp"
                />
              </label>
              <label>
                Tagline
                <input
                  value={content.branding.tagline}
                  onChange={(e) => handleBrandingChange("tagline", e.target.value)}
                  placeholder="Tempat belajar dan bermain"
                />
              </label>
              <ImageInput
                label="Logo Website"
                value={content.branding.logo}
                onChange={(value) => handleBrandingChange("logo", value)}
                previewMode="logo"
              />
              <label>
                Telepon
                <input
                  value={content.branding.phone}
                  onChange={(e) => handleBrandingChange("phone", e.target.value)}
                  placeholder="+62 812-3456-7890"
                />
              </label>
              <label>
                Email
                <input
                  value={content.branding.email}
                  onChange={(e) => handleBrandingChange("email", e.target.value)}
                  placeholder="info@clevio.id"
                />
              </label>
              <label>
                Alamat Lengkap
                <textarea
                  value={content.branding.address}
                  onChange={(e) => handleBrandingChange("address", e.target.value)}
                  placeholder="Jl. Contoh No. 123, Jakarta"
                />
              </label>
              <label>
                Teks Tombol Utama
                <input
                  value={content.branding.ctaLabel}
                  onChange={(e) => handleBrandingChange("ctaLabel", e.target.value)}
                  placeholder="Daftar Sekarang"
                />
              </label>
              <label>
                Link Tombol Utama
                <input
                  value={content.branding.ctaLink}
                  onChange={(e) => handleBrandingChange("ctaLink", e.target.value)}
                  placeholder="/register"
                />
              </label>
            </div>
            <div className="social-inputs" style={{ marginTop: "1.25rem" }}>
              <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Media Sosial Header</p>
              {SOCIAL_FIELDS.map((social) => {
                const current = content.branding.socials.find((item) => item.icon === social.icon);
                return (
                  <label key={`branding-${social.icon}`}>
                    {social.label}
                    <input
                      value={current?.href ?? ""}
                      onChange={(e) => updateBrandingSocial(social.icon, e.target.value)}
                      placeholder={`Link ${social.label}`}
                    />
                  </label>
                );
              })}
            </div>
          </AdminCard>
        </>
        );

      case "partners":
        return (
          <>
            <div className="section-context">
              <h2>Partner Clevio</h2>
              <p>Logo partner ditampilkan berurutan di bawah hero. Preview di setiap kartu menunjukkan logo yang sedang Anda ubah.</p>
            </div>

            <PreviewFrame
              section="partners"
              title="Partner Logo"
              description="Logo partner berjalan horizontal"
              height={180}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Logo Partner"
              description="Preview logo ditampilkan langsung agar setiap aset mudah dikenali."
            >
              <div className="list-header">
                <p><strong>{content.partners.length}</strong> logo aktif di website</p>
                <button className="ghost-btn small" onClick={addPartner}>
                  <PiPlusBold /> Tambah Logo
                </button>
              </div>
              <div className="partner-admin-grid">
                {content.partners.map((partner, index) => (
                  <article key={partner.id} className="partner-admin-card">
                    <header className="partner-admin-card-header">
                      <div>
                        <span>Logo {String(index + 1).padStart(2, "0")}</span>
                        <strong>{getPartnerDisplayName(partner.id, index)}</strong>
                      </div>
                      <button onClick={() => removePartner(index)} aria-label={`Hapus logo ${getPartnerDisplayName(partner.id, index)}`}>
                        <PiTrashBold />
                      </button>
                    </header>
                    <ImageInput
                      label="Sumber logo"
                      value={partner.logo}
                      onChange={(value) => updatePartner(index, value)}
                      helperText="Gunakan PNG transparan, SVG, atau WebP agar logo tetap tajam."
                      previewMode="logo"
                    />
                  </article>
                ))}
              </div>
            </AdminCard>
          </>
        );

      case "hero":
        return (
          <>
            <div className="section-context">
              <h2>🎯 Hero Section (Halaman Depan)</h2>
              <p>Section ini adalah bagian pertama yang pengunjung lihat. Konten di sini muncul di bagian atas halaman utama dengan gambar besar dan call-to-action.</p>
            </div>

            <PreviewFrame
              section="hero"
              title="Hero Section"
              description="Area pertama yang muncul ketika halaman dibuka"
              height={620}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Konten Utama Hero"
              description="Judul, deskripsi, dan tombol utama halaman depan"
            >
              <div className="form-grid">
                <label>
                  Eyebrow/Tagline Atas
                  <input
                    value={content.hero.eyebrow}
                    onChange={(e) => handleHeroChange("eyebrow", e.target.value)}
                    placeholder="Kindergarten & Baby Care"
                  />
                </label>
                <label>
                  Judul Utama
                  <input
                    value={content.hero.title}
                    onChange={(e) => handleHeroChange("title", e.target.value)}
                    placeholder="Selamat Datang di Clevio"
                  />
                </label>
                <label>
                  Deskripsi Singkat
                  <textarea
                    value={content.hero.description}
                    onChange={(e) => handleHeroChange("description", e.target.value)}
                    placeholder="Tempat terbaik untuk pertumbuhan anak Anda"
                  />
                </label>
                <label>
                  Highlight/Kata Penting
                  <input
                    value={content.hero.highlight}
                    onChange={(e) => handleHeroChange("highlight", e.target.value)}
                    placeholder="Pembelajaran Bermain"
                  />
                </label>
                <label>
                  Teks Tombol Utama
                  <input
                    value={content.hero.primaryCta.label}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          primaryCta: { ...prev.hero.primaryCta, label: e.target.value },
                        },
                      }))
                    }
                    placeholder="Mulai Sekarang"
                  />
                </label>
                <label>
                  Link Tombol Utama
                  <input
                    value={content.hero.primaryCta.href}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          primaryCta: { ...prev.hero.primaryCta, href: e.target.value },
                        },
                      }))
                    }
                    placeholder="/register"
                  />
                </label>
                <label>
                  Teks Tombol Kedua
                  <input
                    value={content.hero.secondaryCta.label}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          secondaryCta: { ...prev.hero.secondaryCta, label: e.target.value },
                        },
                      }))
                    }
                    placeholder="Kenali Program Clevio"
                  />
                </label>
                <label>
                  Link Tombol Kedua
                  <input
                    value={content.hero.secondaryCta.href}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          secondaryCta: { ...prev.hero.secondaryCta, href: e.target.value },
                        },
                      }))
                    }
                    placeholder="#programs"
                  />
                </label>
                <label>
                  Video URL (opsional)
                  <input
                    value={content.hero.media.videoUrl}
                    onChange={(e) => handleHeroMediaChange("videoUrl", e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </label>
              </div>
            </AdminCard>

            <AdminCard
              title="Hero Media"
              description="Gambar dan dekorasi halaman depan"
            >
              <ImageInput
                label="Gambar Hero Utama"
                value={content.hero.media.image}
                onChange={(value) => handleHeroMediaChange("image", value)}
              />
              <ImageInput
                label="Background Shape"
                value={content.hero.media.shape}
                onChange={(value) => handleHeroMediaChange("shape", value)}
              />
            </AdminCard>

            <AdminCard
              title="Dekorasi Hero"
              description="Icon dekorasi di halaman depan"
            >
              <div className="admin-list">
                {content.hero.decorations.map((decor, index) => (
                  <div key={decor.id} className="list-card">
                    <div className="list-card-header">
                      <strong>{decor.label}</strong>
                    </div>
                    <div className="image-preview">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={decor.image} alt={decor.label} />
                    </div>
                    <ImageInput
                      label="Icon Dekorasi"
                      value={decor.image}
                      onChange={(value) => updateHeroDecoration(index, value)}
                    />
                    <p className="image-note">
                      <strong>Rekomendasi:</strong> 160 × 160 px (PNG transparan)
                    </p>
                  </div>
                ))}
              </div>
            </AdminCard>
          </>
        );

      case "about":
        return (
          <>
            <div className="section-context">
              <h2>🏫 Tentang Kami</h2>
              <p>Section ini menampilkan informasi lengkap tentang sekolah, visi-misi, dan keunggulan yang ditawarkan. Konten muncul di halaman utama dengan gambar dan bullet points.</p>
            </div>

            <PreviewFrame
              section="about"
              title="Tentang Kami"
              description="Gambaran singkat tentang sekolah dan keunggulannya"
              height={520}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Informasi Sekolah"
              description="Tagline, judul, dan deskripsi lengkap"
            >
              <div className="form-grid">
                <label>
                  Tagline
                  <input
                    value={content.about.tagline}
                    onChange={(e) => handleAboutFieldChange("tagline", e.target.value)}
                    placeholder="Mengenal Lebih Dekat"
                  />
                </label>
                <label>
                  Judul Section
                  <input
                    value={content.about.title}
                    onChange={(e) => handleAboutFieldChange("title", e.target.value)}
                    placeholder="Tentang Clevio Innovator Camp"
                  />
                </label>
                <label>
                  Deskripsi Lengkap
                  <textarea
                    value={content.about.text}
                    onChange={(e) => handleAboutFieldChange("text", e.target.value)}
                    placeholder="Clevio adalah lembaga pendidikan anak usia dini..."
                    style={{ minHeight: "150px" }}
                  />
                </label>
                <label>
                  Teks Tombol
                  <input
                    value={content.about.ctaLabel ?? ""}
                    onChange={(e) => handleAboutFieldChange("ctaLabel", e.target.value)}
                    placeholder="Lihat Program"
                  />
                </label>
                <label>
                  Link Tombol
                  <input
                    value={content.about.ctaLink ?? ""}
                    onChange={(e) => handleAboutFieldChange("ctaLink", e.target.value)}
                    placeholder="#about"
                  />
                </label>
                <label>
                  No. Telepon (di samping tombol)
                  <input
                    value={content.about.phone ?? ""}
                    onChange={(e) => handleAboutFieldChange("phone", e.target.value)}
                    placeholder="+62 812-3456-7890"
                  />
                </label>
              </div>
            </AdminCard>

            <AdminCard
              title="Galeri Tentang Kami"
              description="Gambar-gambar pendukung"
            >
              <div className="form-grid">
                <ImageInput
                  label="Gambar Utama"
                  value={content.about.images.primary}
                  onChange={(value) => handleAboutImageChange("primary", value)}
                />
                <ImageInput
                  label="Gambar Pendukung"
                  value={content.about.images.secondary}
                  onChange={(value) => handleAboutImageChange("secondary", value)}
                />
              </div>
            </AdminCard>

            <AdminCard
              title="Keunggulan Kami"
              description="Daftar keunggulan sekolah"
            >
              <div className="list-header">
                <p>{content.about.bullets.length} Keunggulan</p>
                <button className="ghost-btn small" onClick={addAboutBullet}>
                  <PiPlusBold /> Tambah
                </button>
              </div>
              <div className="admin-list">
                {content.about.bullets.map((bullet, index) => (
                  <div key={`bullet-${index}`} className="list-card">
                    <div className="list-card-header">
                      <strong>Keunggulan {index + 1}</strong>
                      <button onClick={() => removeAboutBullet(index)}>
                        <PiTrashBold />
                      </button>
                    </div>
                    <input
                      value={bullet}
                      onChange={(e) => updateAboutBullet(index, e.target.value)}
                      placeholder="Contoh: Kurikulum bermain yang menyenangkan"
                    />
                  </div>
                ))}
              </div>
            </AdminCard>
          </>
        );

      case "programs":
        return (
          <>
            <div className="section-context">
              <h2>📚 Program Pembelajaran</h2>
              <p>Program-program ini akan ditampilkan sebagai card di halaman utama. Setiap program memiliki gambar, judul, deskripsi, dan rentang usia.</p>
            </div>

            <PreviewFrame
              section="programs"
              title="Program Pembelajaran"
              description="Grid program lengkap sesuai tampilan website"
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Dekorasi Program"
              description="Atur ikon/shape yang tampil di sekitar section program"
            >
              <div className="form-grid">
                <ImageInput
                  label="Shape Atas"
                  value={content.programDecorations.topShape}
                  onChange={(value) => handleProgramDecorationChange("topShape", value)}
                  helperText="Default: /assets/img/section-top-shape.png"
                />
                <ImageInput
                  label="Shape Bawah"
                  value={content.programDecorations.bottomShape}
                  onChange={(value) => handleProgramDecorationChange("bottomShape", value)}
                  helperText="Default: /assets/img/section-bottom-shape.png"
                />
                <ImageInput
                  label="Ikon Code Cloud"
                  value={content.programDecorations.mask}
                  onChange={(value) => handleProgramDecorationChange("mask", value)}
                  helperText="Default: /assets/img/tech/code-cloud.svg"
                />
                <ImageInput
                  label="Ikon Circuit Plus"
                  value={content.programDecorations.mask2}
                  onChange={(value) => handleProgramDecorationChange("mask2", value)}
                  helperText="Default: /assets/img/tech/circuit-plus.svg"
                />
                <ImageInput
                  label="Ikon Code Pencil"
                  value={content.programDecorations.pencil}
                  onChange={(value) => handleProgramDecorationChange("pencil", value)}
                  helperText="Default: /assets/img/tech/code-pencil.svg"
                />
                <ImageInput
                  label="Ikon Chip Ruler"
                  value={content.programDecorations.compass}
                  onChange={(value) => handleProgramDecorationChange("compass", value)}
                  helperText="Default: /assets/img/tech/chip-ruler.svg"
                />
              </div>
            </AdminCard>

            <AdminCard
              title="Judul & Tagline Section Program"
              description="Atur teks di bagian atas section program pada halaman utama."
            >
              <div className="form-grid">
                <label>
                  Tagline
                  <input
                    value={content.programsSection.tagline}
                    onChange={(e) => handleProgramsSectionChange("tagline", e.target.value)}
                    placeholder="Our Programs"
                  />
                </label>
                <label>
                  Judul Besar
                  <textarea
                    value={content.programsSection.title}
                    onChange={(e) => handleProgramsSectionChange("title", e.target.value)}
                    placeholder={"We Meet Kids At Their Level\nRegardless Of Their Age"}
                    style={{ minHeight: "90px" }}
                  />
                  <span className="field-hint">
                    Gunakan baris baru untuk mengganti baris judul. Baris baru akan otomatis dikonversi ke line break.
                  </span>
                </label>
              </div>
            </AdminCard>

            <AdminCard
              title="Daftar Program"
              description="Kelola program-program yang ditawarkan sekolah"
            >
            <div className="list-header">
              <p>{content.programs.length} Program Aktif</p>
              <button className="ghost-btn small" onClick={addProgram}>
                <PiPlusBold /> Tambah Program
              </button>
            </div>
            <div className="admin-list">
              {content.programs.map((program, index) => (
                <div key={program.id} className="list-card">
                  <div className="list-card-header">
                    <strong>{program.title}</strong>
                    <button onClick={() => removeProgram(index)}>
                      <PiTrashBold />
                    </button>
                  </div>
                  <div className="form-grid">
                    <label>
                      Nama Program
                      <input
                        value={program.title}
                        onChange={(e) => updateProgram(index, "title", e.target.value)}
                        placeholder="Program Creative Play"
                      />
                    </label>
                    <label>
                      Rentang Usia
                      <input
                        value={program.ageRange}
                        onChange={(e) => updateProgram(index, "ageRange", e.target.value)}
                        placeholder="3-5 Tahun"
                      />
                    </label>
                    <label>
                      Deskripsi Program
                      <textarea
                        value={program.description}
                        onChange={(e) => updateProgram(index, "description", e.target.value)}
                        placeholder="Program dirancang untuk mengembangkan..."
                        style={{ minHeight: "100px" }}
                      />
                    </label>
                    <ImageInput
                      label="Gambar Card Level"
                      value={program.image}
                      onChange={(value) => updateProgram(index, "image", value)}
                    />
                    <p className="image-note">
                      <strong>Rekomendasi:</strong> 560 × 360 px (rasio 14:9)
                    </p>
                    <label>
                      Materi Inti
                      <textarea
                        value={(program.learningPoints ?? []).join("\n")}
                        onChange={(e) => updateProgramList(index, "learningPoints", e.target.value)}
                        placeholder={"Logika coding dasar\nAnimasi dan storytelling\nProblem solving"}
                        style={{ minHeight: "110px" }}
                      />
                      <span className="field-hint">Satu poin per baris, maksimal 6 poin.</span>
                    </label>
                    <label>
                      Contoh Project
                      <textarea
                        value={(program.projectExamples ?? []).join("\n")}
                        onChange={(e) => updateProgramList(index, "projectExamples", e.target.value)}
                        placeholder={"Maze game\nCerita interaktif\nPoster digital"}
                        style={{ minHeight: "110px" }}
                      />
                      <span className="field-hint">Satu project per baris, maksimal 6 project.</span>
                    </label>
                    <label>
                      Software & Tools
                      <textarea
                        value={(program.tools ?? []).join("\n")}
                        onChange={(e) => updateProgramList(index, "tools", e.target.value)}
                        placeholder={"Scratch\nCode.org\nCanva"}
                        style={{ minHeight: "110px" }}
                      />
                      <span className="field-hint">Satu nama software per baris, maksimal 6 tools.</span>
                    </label>
                    <ImageInput
                      label="Screenshot Showcase Project"
                      value={program.projectImage ?? program.image}
                      onChange={(value) => updateProgram(index, "projectImage", value)}
                      helperText="Rekomendasi 1200 × 800 px. Tampil saat detail Level dibuka."
                    />
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </>
        );

      case "freeTrial":
        return (
          <>
            <div className="section-context">
              <h2>Free Trial Class</h2>
              <p>Ajakan utama setelah pengunjung melihat pilihan Level. Struktur section dikunci agar tetap rapi; Anda cukup mengubah isi teks dan link pendaftaran.</p>
            </div>

            <PreviewFrame
              section="freeTrial"
              title="Free Trial Class"
              description="CTA pendaftaran yang tampil tepat setelah section Program"
              height={760}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Konten Free Trial"
              description="Gunakan copy singkat dan spesifik. Batas karakter diterapkan otomatis agar layout tetap presisi."
            >
              <div className="form-grid">
                <label>
                  Label Atas
                  <input
                    value={content.freeTrial.eyebrow}
                    onChange={(e) => handleFreeTrialChange("eyebrow", e.target.value)}
                    placeholder="Free Trial Class"
                  />
                </label>
                <label>
                  Judul Utama
                  <input
                    value={content.freeTrial.title}
                    onChange={(e) => handleFreeTrialChange("title", e.target.value)}
                    placeholder="Yuk Coba Free Trial Coding"
                  />
                </label>
                <label>
                  Teks Highlight Oranye
                  <input
                    value={content.freeTrial.highlight}
                    onChange={(e) => handleFreeTrialChange("highlight", e.target.value)}
                    placeholder="Gratis!"
                  />
                </label>
                <label>
                  Subjudul
                  <input
                    value={content.freeTrial.subtitle}
                    onChange={(e) => handleFreeTrialChange("subtitle", e.target.value)}
                    placeholder="Lihat Anak Mulai Belajar & Berkarya"
                  />
                </label>
                <label>
                  Deskripsi
                  <textarea
                    value={content.freeTrial.description}
                    onChange={(e) => handleFreeTrialChange("description", e.target.value)}
                    placeholder="Jelaskan manfaat sesi trial secara singkat."
                    style={{ minHeight: "120px" }}
                  />
                </label>
                <label>
                  Teks Tombol
                  <input
                    value={content.freeTrial.ctaLabel}
                    onChange={(e) => handleFreeTrialChange("ctaLabel", e.target.value)}
                    placeholder="Daftar Free Trial"
                  />
                </label>
                <label>
                  Link Pendaftaran
                  <input
                    value={content.freeTrial.ctaLink}
                    onChange={(e) => handleFreeTrialChange("ctaLink", e.target.value)}
                    placeholder="https://lms.clev.io/free-trial"
                  />
                  <span className="field-hint">Gunakan URL lengkap. Link akan dibuka di tab baru.</span>
                </label>
                <label>
                  Catatan di Samping Tombol
                  <input
                    value={content.freeTrial.note}
                    onChange={(e) => handleFreeTrialChange("note", e.target.value)}
                    placeholder="Pendaftaran cepat melalui LMS Clevio"
                  />
                </label>
              </div>
            </AdminCard>

            <AdminCard
              title="Visual & Informasi Kepercayaan"
              description="Gambar utama dan dua informasi singkat di bagian bawah section."
            >
              <ImageInput
                label="Gambar Free Trial"
                value={content.freeTrial.visualImage}
                onChange={(value) => handleFreeTrialChange("visualImage", value)}
                helperText="Rekomendasi 3:2. Sisi kiri gambar otomatis dicrop sekitar 5%."
              />
              <div className="form-grid">
                <label>
                  Judul Ketersediaan Slot
                  <input
                    value={content.freeTrial.availabilityTitle}
                    onChange={(e) => handleFreeTrialChange("availabilityTitle", e.target.value)}
                    placeholder="Slot Free Trial Masih Tersedia!"
                  />
                </label>
                <label>
                  Deskripsi Ketersediaan
                  <input
                    value={content.freeTrial.availabilityText}
                    onChange={(e) => handleFreeTrialChange("availabilityText", e.target.value)}
                    placeholder="Isi form singkat dan tim Clevio akan menghubungi Anda."
                  />
                </label>
                <label>
                  Label Kuota
                  <input
                    value={content.freeTrial.availabilityBadge}
                    onChange={(e) => handleFreeTrialChange("availabilityBadge", e.target.value)}
                    placeholder="Kuota Terbatas"
                  />
                </label>
                <label>
                  Judul Kepercayaan
                  <input
                    value={content.freeTrial.trustTitle}
                    onChange={(e) => handleFreeTrialChange("trustTitle", e.target.value)}
                    placeholder="Aman & Terpercaya"
                  />
                </label>
                <label>
                  Deskripsi Kepercayaan
                  <input
                    value={content.freeTrial.trustText}
                    onChange={(e) => handleFreeTrialChange("trustText", e.target.value)}
                    placeholder="Kelas trial bersama mentor berpengalaman Clevio."
                  />
                </label>
              </div>
            </AdminCard>

            <AdminCard
              title="Tiga Manfaat Utama"
              description="Jumlah manfaat dibatasi tiga agar section mudah dipindai dan tidak terlalu panjang."
            >
              <div className="form-grid">
                {content.freeTrial.benefits.slice(0, 3).map((benefit, index) => (
                  <label key={`free-trial-benefit-${index}`}>
                    Manfaat {index + 1}
                    <input
                      value={benefit}
                      onChange={(e) => updateFreeTrialBenefit(index, e.target.value)}
                      placeholder="Manfaat yang diterima peserta"
                    />
                  </label>
                ))}
              </div>
            </AdminCard>
          </>
        );

      case "activities":
        return (
          <>
            <div className="section-context">
              <h2>🎨 Aktivitas Mingguan</h2>
              <p>Aktivitas rutin ini menunjukkan jadwal kegiatan harian/mingguan di sekolah. Biasanya muncul dengan gambar dan daftar kegiatan.</p>
            </div>

            <PreviewFrame
              section="activities"
              title="Aktivitas Mingguan"
              description="Preview agenda kegiatan dengan gambar"
              height={520}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Informasi Aktivitas"
              description="Tagline, judul, deskripsi, dan gambar kegiatan"
            >
            <div className="form-grid">
              <label>
                Tagline Aktivitas
                <input
                  value={content.activities.tagline}
                  onChange={(e) => handleActivitiesFieldChange("tagline", e.target.value)}
                  placeholder="Kegiatan Seru Setiap Minggu"
                />
              </label>
              <label>
                Judul Section
                <input
                  value={content.activities.title}
                  onChange={(e) => handleActivitiesFieldChange("title", e.target.value)}
                  placeholder="Aktivitas Kami"
                />
              </label>
              <label className="full-width">
                Deskripsi Section
                <textarea
                  value={content.activities.description ?? ""}
                  onChange={(e) => handleActivitiesFieldChange("description", e.target.value)}
                  placeholder="Jelaskan cara belajar dan pendampingan Coach di Clevio."
                  maxLength={220}
                  rows={4}
                />
                <small>{(content.activities.description ?? "").length}/220 karakter</small>
              </label>
              <ImageInput
                label="Gambar Kegiatan"
                value={content.activities.image}
                onChange={(value) => handleActivitiesFieldChange("image", value)}
              />
            </div>

            <AdminCard
              title="Dekorasi Aktivitas"
              description="Atur ikon pendukung di sekitar section aktivitas"
            >
              <div className="form-grid">
                <ImageInput
                  label="Ikon Code Pencil"
                  value={content.activitiesDecorations.pencil}
                  onChange={(value) => handleActivitiesDecorationChange("pencil", value)}
                  helperText="Default: /assets/img/tech/code-pencil.svg"
                />
                <ImageInput
                  label="Ikon AI Bot"
                  value={content.activitiesDecorations.giraffe}
                  onChange={(value) => handleActivitiesDecorationChange("giraffe", value)}
                  helperText="Default: /assets/img/tech/ai-bot.svg"
                />
                <ImageInput
                  label="Ikon Neural Network"
                  value={content.activitiesDecorations.radius}
                  onChange={(value) => handleActivitiesDecorationChange("radius", value)}
                  helperText="Default: /assets/img/tech/neural-network.svg"
                />
              </div>
            </AdminCard>

            <div className="list-header" style={{ marginTop: "1.5rem" }}>
              <p>{content.activities.items.length} Aktivitas</p>
              <button className="ghost-btn small" onClick={addActivityItem}>
                <PiPlusBold /> Tambah
              </button>
            </div>
            <div className="admin-list">
              {content.activities.items.map((item, index) => (
                <div key={`activity-${index}`} className="list-card">
                  <div className="list-card-header">
                    <strong>{item.title}</strong>
                    <button onClick={() => removeActivityItem(index)}>
                      <PiTrashBold />
                    </button>
                  </div>
                  <div className="form-grid">
                    <label>
                      Judul Aktivitas
                      <input
                        value={item.title}
                        onChange={(e) => updateActivityItem(index, "title", e.target.value)}
                        placeholder="Story Telling"
                      />
                    </label>
                    <label>
                      Deskripsi Aktivitas
                      <textarea
                        value={item.description}
                        onChange={(e) => updateActivityItem(index, "description", e.target.value)}
                        placeholder="Sesi bercerita interaktif..."
                        style={{ minHeight: "80px" }}
                      />
                    </label>
                    <TechIconSelect
                      label="Ikon Aktivitas"
                      value={item.icon ?? "fa-solid fa-code"}
                      onChange={(value) => updateActivityItem(index, "icon", value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            </AdminCard>
        </>
        );

      case "workProcess":
        return (
          <>
            <div className="section-context">
              <h2>Work Process Section</h2>
              <p>Atur alur proses/layanan yang tampil di landing page agar pengunjung paham tahapan yang terjadi.</p>
            </div>

            <PreviewFrame
              section="work-process"
              title="Work Process Section"
              description="Bagian proses kegiatan pada landing page"
              height={520}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Judul & Tagline Work Process"
              description="Ubah heading utama untuk langkah-langkah proses"
            >
              <div className="form-grid">
                <label>
                  Tagline
                  <input
                    value={content.benefits.tagline}
                    onChange={(e) => handleWorkProcessFieldChange("tagline", e.target.value)}
                    placeholder="Perjalanan Belajar Anak"
                    maxLength={60}
                  />
                </label>
                <label>
                  Judul Besar
                  <textarea
                    value={content.benefits.title}
                    onChange={(e) => handleWorkProcessFieldChange("title", e.target.value)}
                    placeholder="Dari Ide hingga Produk Siap Diluncurkan"
                    style={{ minHeight: "90px" }}
                    maxLength={90}
                  />
                </label>
                <label className="field-full">
                  Deskripsi Pendukung
                  <textarea
                    value={content.benefits.description}
                    onChange={(e) => handleWorkProcessFieldChange("description", e.target.value)}
                    placeholder="Jelaskan singkat manfaat rangkaian tahap belajar."
                    style={{ minHeight: "90px" }}
                    maxLength={180}
                  />
                </label>
              </div>
            </AdminCard>

            <AdminCard
              title="Daftar Langkah Proses"
              description="Kelola urutan step proses yang tampil di halaman"
            >
              <div className="list-header">
                <p>{content.benefits.items.length} Langkah</p>
                <button className="ghost-btn small" onClick={addWorkProcessItem}>
                  <PiPlusBold /> Tambah Langkah
                </button>
              </div>
              <div className="admin-list">
                {content.benefits.items.map((item, index) => (
                  <div key={"work-process-" + index} className="list-card">
                    <div className="list-card-header">
                      <strong>{item.title || "Langkah " + (index + 1)}</strong>
                      <button onClick={() => removeWorkProcessItem(index)}>
                        <PiTrashBold />
                      </button>
                    </div>
                    <div className="form-grid">
                      <label>
                        Judul Langkah
                        <input
                          value={item.title}
                          onChange={(e) => updateWorkProcessItem(index, "title", e.target.value)}
                          placeholder="Brainstorming"
                        />
                      </label>
                      <TechIconSelect
                        label="Ikon Langkah"
                        value={item.icon || "fa-solid fa-code"}
                        onChange={(value) => updateWorkProcessItem(index, "icon", value)}
                      />
                      <label>
                        Deskripsi Langkah
                        <textarea
                          value={item.description}
                          onChange={(e) =>
                            updateWorkProcessItem(index, "description", e.target.value)
                          }
                          placeholder="Ringkasan kegiatan pada langkah ini"
                          style={{ minHeight: "90px" }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </>
        );

      case "eventLinks":
        return (
          <>
            <div className="section-context section-context-with-action">
              <div>
                <h2>Event & Link Landing Page</h2>
                <p>Atur kartu event yang tampil di website. Setiap kartu langsung membuka landing page yang sudah Anda siapkan.</p>
              </div>
              <a href="/events" target="_blank" rel="noreferrer" className="context-action-link">
                Lihat halaman event <PiArrowSquareOutBold />
              </a>
            </div>

            <AdminCard title="Judul Section Event" description="Teks ini tampil di bagian daftar event pada website.">
              <div className="form-grid">
                <label>
                  Tagline
                  <input value={content.eventsSection.tagline} onChange={(event) => updateEventsSection("tagline", event.target.value)} />
                </label>
                <label>
                  Judul Section
                  <input value={content.eventsSection.title} onChange={(event) => updateEventsSection("title", event.target.value)} />
                </label>
                <label className="full-width-field">
                  Deskripsi Section
                  <textarea value={content.eventsSection.description} onChange={(event) => updateEventsSection("description", event.target.value)} />
                </label>
              </div>
            </AdminCard>

            <AdminCard title="Daftar Event" description="Isi informasi ringkas dan tempel URL landing page event pada kolom tujuan.">
              <div className="list-header">
                <p>{content.events.length} Event</p>
                <button className="ghost-btn small" onClick={addEvent}><PiPlusBold /> Tambah Event</button>
              </div>
              <div className="admin-list admin-publish-list">
                {content.events.map((event, index) => (
                  <div key={event.id} className="list-card publish-card">
                    <div className="list-card-header publish-card-header">
                      <div>
                        <span className={`admin-content-status ${event.status}`}>{event.status === "published" ? "Tayang" : "Draft"}</span>
                        <strong>{event.title || `Event ${index + 1}`}</strong>
                      </div>
                      <div className="list-card-actions">
                        {event.landingPageUrl && event.landingPageUrl !== "https://" && (
                          <a href={publicContentHref(event.landingPageUrl)} target="_blank" rel="noreferrer" aria-label={`Buka ${event.title}`}><PiArrowSquareOutBold /></a>
                        )}
                        <button onClick={() => removeEvent(index)} aria-label={`Hapus ${event.title}`}><PiTrashBold /></button>
                      </div>
                    </div>
                    <div className="form-grid">
                      <label>
                        Status
                        <select value={event.status} onChange={(changeEvent) => updateEvent(index, "status", changeEvent.target.value)}>
                          <option value="draft">Draft</option>
                          <option value="published">Tayang</option>
                        </select>
                      </label>
                      <label>
                        Judul Event
                        <input value={event.title} onChange={(changeEvent) => updateEvent(index, "title", changeEvent.target.value)} />
                      </label>
                      <label>
                        Target Peserta
                        <input value={event.audience} onChange={(changeEvent) => updateEvent(index, "audience", changeEvent.target.value)} />
                      </label>
                      <label>
                        Tanggal
                        <input value={event.date} onChange={(changeEvent) => updateEvent(index, "date", changeEvent.target.value)} placeholder="20 Mei 2026" />
                      </label>
                      <label>
                        Waktu
                        <input value={event.time} onChange={(changeEvent) => updateEvent(index, "time", changeEvent.target.value)} placeholder="09.00 - 12.00" />
                      </label>
                      <label>
                        Lokasi
                        <input value={event.location} onChange={(changeEvent) => updateEvent(index, "location", changeEvent.target.value)} />
                      </label>
                      <label className="full-width-field">
                        Ringkasan Event
                        <textarea value={event.description} onChange={(changeEvent) => updateEvent(index, "description", changeEvent.target.value)} />
                      </label>
                      <label className="full-width-field landing-link-field">
                        URL Landing Page
                        <span className="input-with-icon"><PiLinkBold /><input value={event.landingPageUrl} onChange={(changeEvent) => updateEvent(index, "landingPageUrl", changeEvent.target.value)} placeholder="https://event.clevio.id/nama-event" /></span>
                      </label>
                      <div className="full-width-field"><ImageInput label="Gambar Kartu Event" value={event.image} onChange={(value) => updateEvent(index, "image", value)} helperText="Rasio yang disarankan 16:10." /></div>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </>
        );

      case "blog":
        return (
          <>
            <div className="section-context section-context-with-action">
              <div>
                <h2>Artikel & Berita</h2>
                <p>Kelola kartu artikel sekaligus isi halaman artikelnya. Artikel draft tidak akan terlihat oleh pengunjung.</p>
              </div>
              <a href="/articles" target="_blank" rel="noreferrer" className="context-action-link">
                Lihat semua artikel <PiArrowSquareOutBold />
              </a>
            </div>

            <PreviewFrame
              section="blog"
              title="Blog & Artikel"
              description="Layout daftar artikel di halaman utama"
              height={540}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard title="Judul Section Artikel" description="Atur tagline dan judul daftar artikel di halaman utama.">
              <div className="form-grid">
                <label>
                  Tagline
                  <input value={content.blog.tagline} onChange={(event) => setContent((prev) => ({ ...prev, blog: { ...prev.blog, tagline: event.target.value } }))} />
                </label>
                <label>
                  Judul Section
                  <input value={content.blog.title} onChange={(event) => setContent((prev) => ({ ...prev, blog: { ...prev.blog, title: event.target.value } }))} />
                </label>
              </div>
            </AdminCard>

            <AdminCard
              title="Daftar Artikel"
              description="Lengkapi ringkasan untuk kartu dan isi artikel untuk halaman detail."
            >
            <div className="list-header">
              <p>{content.blog.posts.filter((post) => post.status === "published").length} Tayang · {content.blog.posts.filter((post) => post.status === "draft").length} Draft</p>
              <button className="ghost-btn small" onClick={addBlogPost}>
                <PiPlusBold /> Tambah Artikel
              </button>
            </div>
            <div className="admin-list admin-publish-list">
              {content.blog.posts.map((post, index) => (
                <div key={post.id} className="list-card publish-card">
                  <div className="list-card-header publish-card-header">
                    <div>
                      <span className={`admin-content-status ${post.status}`}>{post.status === "published" ? "Tayang" : "Draft"}</span>
                      <strong>{post.title}</strong>
                    </div>
                    <div className="list-card-actions">
                      {post.status === "published" && <a href={`/articles/${post.slug}`} target="_blank" rel="noreferrer" aria-label={`Buka ${post.title}`}><PiArrowSquareOutBold /></a>}
                      <button onClick={() => removeBlogPost(index)} aria-label={`Hapus ${post.title}`}><PiTrashBold /></button>
                    </div>
                  </div>
                  <div className="form-grid">
                    <label>
                      Status
                      <select value={post.status} onChange={(event) => updateBlog(index, "status", event.target.value)}>
                        <option value="draft">Draft</option>
                        <option value="published">Tayang</option>
                      </select>
                    </label>
                    <label>
                      Judul Artikel
                      <input
                        value={post.title}
                        onChange={(e) => updateBlog(index, "title", e.target.value)}
                        placeholder="Judul Menarik Artikel"
                      />
                    </label>
                    <label>
                      Slug URL
                      <input value={post.slug} onChange={(event) => updateBlog(index, "slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="judul-artikel" />
                    </label>
                    <label>
                      Kategori
                      <input value={post.category} onChange={(event) => updateBlog(index, "category", event.target.value)} placeholder="Insight Clevio" />
                    </label>
                    <label>
                      Waktu Baca
                      <input value={post.readingTime} onChange={(event) => updateBlog(index, "readingTime", event.target.value)} placeholder="5 menit baca" />
                    </label>
                    <label>
                      Ringkasan
                      <textarea
                        value={post.excerpt}
                        onChange={(e) => updateBlog(index, "excerpt", e.target.value)}
                        placeholder="Ringkasan singkat artikel..."
                        style={{ minHeight: "80px" }}
                      />
                    </label>
                    <label>
                      Penulis
                      <input
                        value={post.author}
                        onChange={(e) => updateBlog(index, "author", e.target.value)}
                        placeholder="Tim Clevio"
                      />
                    </label>
                    <label>
                      Tanggal Publikasi
                      <input
                        value={post.date}
                        onChange={(e) => updateBlog(index, "date", e.target.value)}
                        placeholder="15 Jan 2024"
                      />
                    </label>
                    <ImageInput
                      label="Gambar Artikel"
                      value={post.image}
                      onChange={(value) => updateBlog(index, "image", value)}
                    />
                    <label className="full-width-field">
                      Isi Artikel Lengkap
                      <textarea className="article-body-editor" value={post.body} onChange={(event) => updateBlog(index, "body", event.target.value)} placeholder="Tulis isi artikel. Pisahkan paragraf dengan satu baris kosong." />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </>
        );

      case "newsletter":
        return (
          <>
            <div className="section-context">
              <h2>📧 Newsletter Berlangganan</h2>
              <p>Form berlangganan ini untuk mengumpulkan email pengunjung yang tertarik dengan update sekolah. Muncul biasanya di footer atau bagian bawah halaman.</p>
            </div>

            <PreviewFrame
              section="newsletter"
              title="Newsletter"
              description="Bagian form berlangganan di bawah halaman"
              height={420}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Form Berlangganan"
              description="Eyebrow, judul, dan teks tombol newsletter"
            >
            <div className="form-grid">
              <label>
                Label Atas (Eyebrow)
                <input
                  value={content.newsletter.eyebrow}
                  onChange={(e) => handleNewsletterChange("eyebrow", e.target.value)}
                  maxLength={32}
                  placeholder="Stay Updated"
                />
              </label>
              <label>
                Judul Newsletter
                <textarea
                  value={content.newsletter.title}
                  onChange={(e) => handleNewsletterChange("title", e.target.value)}
                  maxLength={100}
                  placeholder="Dapatkan informasi terbaru tentang kegiatan kami"
                  style={{ minHeight: "80px" }}
                />
              </label>
              <label>
                Deskripsi Singkat
                <textarea
                  value={content.newsletter.description ?? ""}
                  onChange={(e) => handleNewsletterChange("description", e.target.value)}
                  maxLength={150}
                  placeholder="Info event, kelas baru, dan promo pilihan untuk keluarga Clevio."
                  style={{ minHeight: "80px" }}
                />
              </label>
              <label>
                Teks Tombol Berlangganan
                <input
                  value={content.newsletter.buttonLabel}
                  onChange={(e) => handleNewsletterChange("buttonLabel", e.target.value)}
                  maxLength={28}
                  placeholder="Berlangganan"
                />
              </label>
            </div>
          </AdminCard>
        </>
        );

      case "instagram":
        return (
          <>
            <div className="section-context">
              <h2>📷 Instagram Feed</h2>
              <p>Slider ini menampilkan foto-foto dari Instagram akun sekolah. Setiap foto bisa diklik untuk menuju ke postingan Instagram asli.</p>
            </div>

            <PreviewFrame
              section="instagram"
              title="Slider Instagram"
              description="Preview carousel feed Instagram"
              height={420}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Daftar Foto Instagram"
              description="Kelola foto-foto yang tampil di slider Instagram"
            >
            <div className="list-header">
              <p>{content.instagram.length} Foto Instagram</p>
              <button className="ghost-btn small" onClick={addInstagramItem}>
                <PiPlusBold /> Tambah Foto
              </button>
            </div>
            <div className="admin-list">
              {content.instagram.map((item, index) => (
                <div key={item.id} className="list-card">
                  <div className="list-card-header">
                    <strong>Foto {index + 1}</strong>
                    <button onClick={() => removeInstagramItem(index)}>
                      <PiTrashBold />
                    </button>
                  </div>
                  <div className="form-grid">
                    <ImageInput
                      label="Gambar Instagram"
                      value={item.image}
                      onChange={(value) => updateInstagramItem(index, "image", value)}
                    />
                    <label>
                      Link ke Instagram Post
                      <input
                        value={item.link}
                        onChange={(e) => updateInstagramItem(index, "link", e.target.value)}
                        placeholder="https://instagram.com/p/..."
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </>
        );

      case "testimonials":
        return (
          <>
            <div className="section-context">
              <h2>Testimonial</h2>
              <p>Atur judul, pengantar, dan testimoni orang tua yang tampil di halaman utama.</p>
            </div>

            <PreviewFrame
              section="testimonials"
              title="Testimoni Orang Tua"
              description="Bagian ulasan orang tua"
              height={480}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Pengantar Testimonial"
              description="Teks dibatasi agar komposisi section tetap presisi pada desktop dan mobile."
            >
              <div className="form-grid">
                <label>
                  Tagline
                  <input
                    value={content.testimonialsSection.tagline}
                    onChange={(e) => handleTestimonialsSectionChange("tagline", e.target.value)}
                    placeholder="Testimoni Orang Tua"
                    maxLength={40}
                  />
                </label>
                <label>
                  Judul Besar
                  <textarea
                    value={content.testimonialsSection.title}
                    onChange={(e) => handleTestimonialsSectionChange("title", e.target.value)}
                    placeholder="Apa Kata Orang Tua Tentang Clevio"
                    maxLength={72}
                    style={{ minHeight: "90px" }}
                  />
                  <span className="field-hint">
                    Gunakan baris baru untuk line break pada judul.
                  </span>
                </label>
                <label className="full-width">
                  Deskripsi
                  <textarea
                    value={content.testimonialsSection.description}
                    onChange={(e) => handleTestimonialsSectionChange("description", e.target.value)}
                    placeholder="Cerita nyata tentang pengalaman belajar anak bersama Clevio."
                    maxLength={150}
                    style={{ minHeight: "86px" }}
                  />
                  <span className="field-hint">Maksimal 150 karakter agar tetap satu sampai dua baris.</span>
                </label>
              </div>
            </AdminCard>

            <AdminCard
              title="Daftar Testimoni"
              description="Kelola pesan, nama, dan peran orang tua di carousel testimonial."
            >
              <div className="list-header">
                <p>{content.testimonials.length} Testimoni</p>
                <button className="ghost-btn small" onClick={addTestimonial}>
                  <PiPlusBold /> Tambah Testimoni
                </button>
              </div>
              <div className="admin-list">
                {content.testimonials.map((testi, index) => (
                  <div key={testi.id} className="list-card">
                    <div className="list-card-header">
                      <strong>{testi.name}</strong>
                      <button onClick={() => removeTestimonial(index)}>
                        <PiTrashBold />
                      </button>
                    </div>
                    <div className="form-grid">
                      <label>
                        Pesan
                        <textarea
                          value={testi.message}
                          onChange={(e) => updateTestimonial(index, "message", e.target.value)}
                          placeholder="Tuliskan pesan testimoni"
                          maxLength={210}
                          style={{ minHeight: "90px" }}
                        />
                      </label>
                      <label>
                        Nama
                        <input
                          value={testi.name}
                          onChange={(e) => updateTestimonial(index, "name", e.target.value)}
                          placeholder="Nama Orang Tua"
                          maxLength={36}
                        />
                      </label>
                      <label>
                        Peran
                        <input
                          value={testi.role}
                          onChange={(e) => updateTestimonial(index, "role", e.target.value)}
                          placeholder="Orang Tua Murid"
                          maxLength={42}
                        />
                      </label>
                      <label>
                        Rating (1-5)
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={testi.rating}
                          onChange={(e) =>
                            updateTestimonial(index, "rating", Number(e.target.value) || 0)
                          }
                        />
                      </label>
                      <ImageInput
                        label="Avatar (opsional)"
                        value={testi.avatar}
                        onChange={(value) => updateTestimonial(index, "avatar", value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </>
        );

      case "advanced":
        return (
          <>
            <div className="section-context">
              <h2>Semua Konten Website</h2>
              <p>Editor lanjutan untuk data yang belum tersedia pada formulir terstruktur.</p>
            </div>
            <AdminCard
              title="Editor JSON Lengkap"
              description="Gunakan dengan hati-hati. Klik Terapkan JSON sebelum menyimpan perubahan."
            >
              <label>
                Data Konten
                <textarea
                  className="advanced-json-editor"
                  data-no-limit
                  spellCheck={false}
                  value={advancedJson}
                  onChange={(event) => setAdvancedJson(event.target.value)}
                />
              </label>
              {advancedError && <p className="field-error">JSON tidak valid: {advancedError}</p>}
              <div className="admin-actions-inline">
                <button className="primary-btn" onClick={applyAdvancedContent}>
                  <PiCheckCircleBold /> Terapkan JSON
                </button>
              </div>
            </AdminCard>
          </>
        );

      case "contact":
        return (
          <>
            <div className="section-context">
              <h2>📞 Informasi Kontak</h2>
              <p>Informasi kontak ini muncul di footer website dan halaman kontak. Ini adalah cara utama orang tua menghubungi sekolah.</p>
            </div>

            <PreviewFrame
              section="contact"
              title="Footer & Kontak"
              description="Bagian footer beserta informasi kontak"
              height={480}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Data Kontak Utama"
              description="WhatsApp, email, dan alamat yang ditampilkan di footer"
            >
              <div className="form-grid">
                <label>
                  Nomor WhatsApp
                  <input
                    value={content.contact.whatsapp}
                    onChange={(e) => handleContactChange("whatsapp", e.target.value)}
                    placeholder="+62 812-3456-7890"
                  />
                </label>
                <label>
                  Email Kontak
                  <input
                    value={content.contact.email}
                    onChange={(e) => handleContactChange("email", e.target.value)}
                    placeholder="info@clevio.id"
                  />
                </label>
                <label>
                  Alamat Lengkap
                  <textarea
                    value={content.contact.address}
                    onChange={(e) => handleContactChange("address", e.target.value)}
                    placeholder="Jl. Contoh No. 123, Jakarta 12345"
                    style={{ minHeight: "100px" }}
                  />
                </label>
              </div>
            </AdminCard>

            <AdminCard
              title="Kontak Footer"
              description="Tiga kolom kontak di footer (telepon, email, lokasi)"
            >
              <div className="admin-list">
                {(content.footer.contacts || []).map((item, index) => (
                  <div key={`footer-contact-${index}`} className="list-card">
                    <div className="list-card-header">
                      <strong>Kontak {index + 1}</strong>
                    </div>
                    <div className="form-grid">
                      <label>
                        Label
                        <input
                          value={item.label}
                          onChange={(e) => updateFooterContact(index, "label", e.target.value)}
                          placeholder="Call Us 7/24"
                        />
                      </label>
                      <label>
                        Nilai
                        <input
                          value={item.value}
                          onChange={(e) => updateFooterContact(index, "value", e.target.value)}
                          placeholder="+208-555-0112"
                        />
                      </label>
                      <label>
                        Link (opsional)
                        <input
                          value={item.href ?? ""}
                          onChange={(e) => updateFooterContact(index, "href", e.target.value)}
                          placeholder="tel:+2085550112 atau mailto:care@clevio.id"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>

            <AdminCard
              title="Konten Footer"
              description="Deskripsi singkat dan tautan navigasi di footer"
            >
              <div className="form-grid">
                <label style={{ gridColumn: "1 / -1" }}>
                  Deskripsi Brand Footer
                  <textarea
                    value={content.footer.blurb ?? ""}
                    onChange={(e) => handleFooterFieldChange("blurb", e.target.value)}
                    placeholder="Phasellus ultricies aliquam volutpat ullamcorper..."
                    style={{ minHeight: "100px" }}
                  />
                </label>
              </div>

              <div className="list-header">
                <p>{content.footer.quickLinks.length} Quick Links</p>
                <button className="ghost-btn small" onClick={() => addFooterNavItem("quickLinks")}>
                  <PiPlusBold /> Tambah
                </button>
              </div>
              <div className="admin-list">
                {content.footer.quickLinks.map((item, index) => (
                  <div key={`footer-ql-${index}`} className="list-card">
                    <div className="list-card-header">
                      <strong>Link {index + 1}</strong>
                      <button onClick={() => removeFooterNavItem("quickLinks", index)}>
                        <PiTrashBold />
                      </button>
                    </div>
                    <div className="form-grid">
                      <label>
                        Label
                        <input
                          value={item.label}
                          onChange={(e) => updateFooterNavItem("quickLinks", index, "label", e.target.value)}
                          placeholder="Our Services"
                        />
                      </label>
                      <label>
                        URL
                        <input
                          value={item.href}
                          onChange={(e) => updateFooterNavItem("quickLinks", index, "href", e.target.value)}
                          placeholder="#services"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="list-header" style={{ marginTop: "1rem" }}>
                <p>{(content.footer.categories || []).length} Kategori</p>
                <button className="ghost-btn small" onClick={() => addFooterNavItem("categories")}>
                  <PiPlusBold /> Tambah
                </button>
              </div>
              <div className="admin-list">
                {(content.footer.categories || []).map((item, index) => (
                  <div key={`footer-cat-${index}`} className="list-card">
                    <div className="list-card-header">
                      <strong>Kategori {index + 1}</strong>
                      <button onClick={() => removeFooterNavItem("categories", index)}>
                        <PiTrashBold />
                      </button>
                    </div>
                    <div className="form-grid">
                      <label>
                        Label
                        <input
                          value={item.label}
                          onChange={(e) => updateFooterNavItem("categories", index, "label", e.target.value)}
                          placeholder="Music Learning"
                        />
                      </label>
                      <label>
                        URL
                        <input
                          value={item.href}
                          onChange={(e) => updateFooterNavItem("categories", index, "href", e.target.value)}
                          placeholder="#category"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </>
        );

      default:
        return <div>Pilih menu di sidebar untuk mulai mengedit konten.</div>;
    }
  };

  if (embedded) {
    const activeNavigationItem = navigationItems.find((item) => item.id === activeSection);
    const ActiveNavigationIcon = activeNavigationItem?.icon ?? PiImageBold;

    return (
      <div className="production-content-editor" ref={adminShellRef}>
        <header className="production-admin-page-header production-content-header">
          <div>
            <span>Konten website</span>
            <h1>Atur tampilan website</h1>
            <p>Pilih bagian di sebelah kiri, periksa preview, lalu simpan saat kontennya sudah sesuai.</p>
          </div>
          <a href="/" target="_blank" rel="noreferrer" className="production-secondary-button">Lihat website <PiArrowSquareOutBold /></a>
        </header>

        <div className="production-content-guidance">
          <div>
            <PiCheckCircleBold />
            <span><strong>Bisa diubah</strong><small>Teks, gambar, logo, ikon, dan link.</small></span>
          </div>
          <div>
            <PiLockKeyBold />
            <span><strong>Tetap dikunci</strong><small>Layout, kode, database, artikel, dan event.</small></span>
          </div>
        </div>

        <div className="production-content-layout">
          <aside className="production-content-nav">
            <label>
              <PiMagnifyingGlassBold />
              <input value={navigationSearch} onChange={(event) => setNavigationSearch(event.target.value)} placeholder="Cari bagian..." />
            </label>
            {safeNavigationGroups.map((section) => (
              <div key={section.group}>
                <span>{section.group}</span>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} className={activeSection === item.id ? "is-active" : ""} onClick={() => setActiveSection(item.id)}>
                      <Icon />
                      <span><strong>{item.label}</strong><small>{item.description}</small></span>
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>
          <section className="production-content-panel">
            <div className="production-content-panel-heading">
              <div className="production-content-panel-icon"><ActiveNavigationIcon /></div>
              <div>
                <span>Bagian yang sedang diedit</span>
                <h2>{activeNavigationItem?.label}</h2>
                <p>{activeNavigationItem?.description}. Perubahan tampil pada preview sebelum disimpan.</p>
              </div>
            </div>
            {renderMainContent()}
          </section>
        </div>

        <div className="production-content-savebar">
          <div className={status === "error" ? "is-error" : isDirty ? "is-dirty" : "is-saved"}>
            {status === "saving" ? <PiCircleNotchBold className="spin" /> : <PiCheckCircleBold />}
            <span>{status === "saving" ? "Sedang menyimpan..." : status === "error" ? saveError || "Gagal menyimpan." : isDirty ? "Ada perubahan yang belum disimpan" : "Semua perubahan tersimpan"}</span>
          </div>
          <span className="production-content-save-actions">
            <button className="production-secondary-button" onClick={resetContent} disabled={status === "saving" || !isDirty}>Batalkan</button>
            <button className="production-primary-button" onClick={saveChanges} disabled={status === "saving" || !isDirty}>{status === "saving" ? "Menyimpan..." : "Simpan perubahan"}</button>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell" ref={adminShellRef}>
      <div className="admin-layout">
        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Tutup menu admin" : "Buka menu admin"}
          type="button"
        >
          <PiListBold size={20} />
        </button>

        <aside className={`admin-sidebar ${sidebarOpen ? "open" : "collapsed"} ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {/* Header Section in Sidebar */}
          <div className="sidebar-header">
            {sidebarOpen && (
              <div className="admin-heading">
                <p className="eyebrow"><PiCodeBold /> Clevio CMS</p>
                <h1>Kelola Website</h1>
              </div>
            )}
            <button className="sidebar-toggle" onClick={() => setSidebarOpen((prev) => !prev)} aria-label={sidebarOpen ? "Ciutkan sidebar" : "Lebarkan sidebar"} type="button">
              {sidebarOpen ? "❮" : "❯"}
            </button>
          </div>

          {sidebarOpen && (
            <label className="sidebar-search">
              <PiMagnifyingGlassBold />
              <input value={navigationSearch} onChange={(event) => setNavigationSearch(event.target.value)} placeholder="Cari pengaturan..." />
            </label>
          )}

          <nav className="sidebar-nav">
            {navigationGroups.map((section) => (
              <div className="sidebar-nav-group" key={section.group}>
                {sidebarOpen && <span className="sidebar-group-label">{section.group}</span>}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      className={`sidebar-item ${activeSection === item.id ? "active" : ""}`}
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <Icon size={18} />
                      {sidebarOpen && (
                        <div className="sidebar-content">
                          <span className="sidebar-label">{item.label}</span>
                          <span className="sidebar-description">{item.description}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer Section with Status and Actions */}
          <div className="sidebar-footer">
            {/* Status Messages */}
            <div className="action-bar-status" style={{ display: "none" }}>
              {status === "saving" && (
                <p className="status info">
                  <PiCircleNotchBold className="spin" /> Sedang menyimpan perubahan...
                </p>
              )}
              {status === "saved" && (
                <p className="status success">
                  <PiCheckCircleBold /> Perubahan berhasil disimpan
                </p>
              )}
              {status === "error" && (
                <p className="status error">
                  ❌ {saveError || "Gagal menyimpan. Coba beberapa detik lagi."}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {false && sidebarOpen && (
              <div className="action-buttons" style={{ display: "none" }}>
                <button className="ghost-btn" onClick={resetContent} disabled={status === "saving"}>
                  Reset
                </button>
                <button className="theme-btn" onClick={saveChanges} disabled={status === "saving"}>
                  {status === "saving" ? (
                    <>
                      <PiCircleNotchBold className="spin" /> Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            )}

            {/* Logout Button */}
            <button className="logout-btn" onClick={handleLogout} disabled={status === "saving"}>
              <PiUserBold size={18} />
              {sidebarOpen && "Logout"}
            </button>
          </div>
        </aside>

        <main className={`admin-main ${sidebarOpen ? "" : "expanded"}`}>
          <div className="admin-main-header">
            <div className="admin-heading">
              <p className="eyebrow">Dashboard Konten</p>
              <h1>{navigationItems.find((item) => item.id === activeSection)?.label ?? "Dashboard"}</h1>
              <p className="admin-subtitle">{navigationItems.find((item) => item.id === activeSection)?.description ?? "Kelola konten website."}</p>
            </div>
            <a href="/" target="_blank" rel="noreferrer" className="admin-open-site">Buka Website <PiArrowSquareOutBold /></a>
          </div>
          {renderMainContent()}
        </main>
      </div>

      {/* Floating action buttons */}
      <div className="admin-action-bar floating">
        <div className={`admin-action-status ${status === "error" ? "error" : isDirty ? "dirty" : "saved"}`}>
          {status === "saving" ? <PiCircleNotchBold className="spin" /> : <PiCheckCircleBold />}
          <span>
            {status === "saving"
              ? "Sedang menyimpan..."
              : status === "error"
                ? saveError || "Gagal menyimpan perubahan."
                : isDirty
                  ? "Perubahan belum disimpan"
                  : "Semua perubahan tersimpan"}
          </span>
        </div>
        <div className="action-bar-buttons">
          <button className="ghost-btn" onClick={resetContent} disabled={status === "saving" || !isDirty}>
            Batalkan
          </button>
          <button className="theme-btn" onClick={saveChanges} disabled={status === "saving" || !isDirty}>
            {status === "saving" ? (
              <>
                <PiCircleNotchBold className="spin" /> Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
  
interface CardProps {
  title: string;
  description: string;
  children: ReactNode;
}

function AdminCard({ title, description, children }: CardProps) {
  return (
    <section className="admin-card">
      <header>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="admin-card-body">{children}</div>
    </section>
  );
}

interface PreviewFrameProps {
  section: string;
  title: string;
  description?: string;
  height?: number;
  content: SiteContent;
  templateMarkup: string;
}

function PreviewFrame({
  section,
  title,
  description,
  height,
  content,
  templateMarkup,
}: PreviewFrameProps) {
  const frameHeight = height;
  const allowedKeys = useMemo(() => getPreviewKeys(section), [section]);

  return (
    <div className="section-preview">
      <div className="preview-header">
        <div>
          <span>Preview: {title}</span>
          {description && <p className="preview-description">{description}</p>}
        </div>
      </div>
      <div className="preview-frame">
        <SectionPreviewCanvas
          key={section}
          markup={templateMarkup}
          content={content}
          allowedKeys={allowedKeys}
          initialHeight={frameHeight}
        />
      </div>
    </div>
  );
}

interface SectionPreviewCanvasProps {
  markup: string;
  content: SiteContent;
  allowedKeys: string[];
  initialHeight?: number;
}

const PREVIEW_CANVAS_WIDTH = 1440;

function SectionPreviewCanvas({
  markup,
  content,
  allowedKeys,
  initialHeight = 180,
}: SectionPreviewCanvasProps) {
  const uniqueId = useId().replace(/:/g, "");
  const previewRootId = `preview-source-${uniqueId}`;
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const previewStageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sourceRoot = document.getElementById(previewRootId);
    const previewFrame = previewFrameRef.current;
    const previewStage = previewStageRef.current;
    if (!sourceRoot || !previewFrame || !previewStage) return;

    const allowed = new Set(allowedKeys);
    let renderedHeight = initialHeight;
    let syncRaf = 0;

    const updateScale = () => {
      const availableWidth = Math.max(previewStage.clientWidth, 1);
      const scale = Math.min(1, availableWidth / PREVIEW_CANVAS_WIDTH);
      previewFrame.style.setProperty("--preview-scale", String(scale));
      previewStage.style.height = `${Math.ceil(renderedHeight * scale)}px`;
    };

    const measureFrame = () => {
      const frameDocument = previewFrame.contentDocument;
      if (!frameDocument) return;

      const nextHeight = Math.max(
        frameDocument.documentElement.scrollHeight,
        frameDocument.body?.scrollHeight ?? 0,
        initialHeight,
      );
      renderedHeight = nextHeight;
      previewFrame.style.height = `${nextHeight}px`;
      previewStage.style.minHeight = "0px";
      updateScale();
      previewFrame.style.visibility = "visible";
      previewStage.dataset.previewReady = "true";

      frameDocument.querySelectorAll("img").forEach((image) => {
        if (!image.complete) image.addEventListener("load", measureFrame, { once: true });
      });
    };

    const sync = () => {
      const nodes = Array.from(
        sourceRoot.querySelectorAll<HTMLElement>("[data-preview]"),
      ).filter((node) => allowed.has(node.dataset.preview ?? ""));

      const previewContainer = document.createElement("div");
      previewContainer.className = "preview-iframe-root preview-scoped";
      nodes.forEach((node) => previewContainer.appendChild(node.cloneNode(true)));
      fixAssetPaths(previewContainer);

      const stylesheetLinks = Array.from(
        document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
      )
        .map((link) => `<link rel="stylesheet" href="${link.href}">`)
        .join("");

      previewStage.dataset.previewReady = "false";
      previewFrame.style.visibility = "hidden";
      previewFrame.srcdoc = `<!doctype html>
        <html lang="id">
          <head>
            <base href="${window.location.origin}/">
            <meta name="viewport" content="width=${PREVIEW_CANVAS_WIDTH}">
            ${stylesheetLinks}
            <style>
              html, body {
                width: ${PREVIEW_CANVAS_WIDTH}px !important;
                min-width: ${PREVIEW_CANVAS_WIDTH}px !important;
                margin: 0 !important;
                overflow: hidden !important;
                background: transparent !important;
              }
              *, *::before, *::after { box-sizing: border-box; }
              .preview-iframe-root {
                display: flex;
                width: ${PREVIEW_CANVAS_WIDTH}px;
                flex-direction: column;
                gap: 32px;
              }
              .preview-iframe-root > * { width: 100% !important; }
              #header-sticky { display: none !important; }
              .wow { visibility: visible !important; animation: none !important; }
            </style>
          </head>
          <body>${previewContainer.outerHTML}</body>
        </html>`;
    };

    const scheduleSync = () => {
      cancelAnimationFrame(syncRaf);
      syncRaf = requestAnimationFrame(sync);
    };

    previewFrame.addEventListener("load", measureFrame);
    const syncTimer = window.setTimeout(scheduleSync, 100);
    const observer = new MutationObserver(scheduleSync);
    observer.observe(sourceRoot, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(previewStage);
    scheduleSync();

    return () => {
      cancelAnimationFrame(syncRaf);
      clearTimeout(syncTimer);
      observer.disconnect();
      resizeObserver.disconnect();
      previewFrame.removeEventListener("load", measureFrame);
    };
  }, [allowedKeys, initialHeight, markup, previewRootId]);

  return (
    <div
      ref={previewStageRef}
      className="preview-stage"
      data-preview-ready="false"
      style={{ minHeight: Math.min(initialHeight, 220) }}
    >
      <div
        id={previewRootId}
        className="preview-template-root"
        dangerouslySetInnerHTML={{ __html: markup }}
        suppressHydrationWarning
        aria-hidden
      />
      <ThemeBinder content={content} rootId={previewRootId} />
      <PreviewAssets rootId={previewRootId} />
      <iframe
        ref={previewFrameRef}
        className="preview-output"
        title="Preview tampilan website"
        sandbox="allow-same-origin"
      />
    </div>
  );
}
