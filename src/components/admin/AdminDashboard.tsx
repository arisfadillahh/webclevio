"use client";

import { useMemo, useState, ChangeEvent, useId, useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent } from "@/types/content";
import ThemeBinder from "@/components/home/ThemeBinder";
import PreviewAssets, { fixAssetPaths } from "@/components/admin/PreviewAssets";
import { getPreviewKeys } from "@/lib/preview";
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
} from "react-icons/pi";

interface Props {
  initialContent: SiteContent;
  templateMarkup: string;
}

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
}

function ImageInput({ label, value, onChange, helperText }: ImageInputProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="image-input">
      <label>
        {label}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL atau /uploads/..."
        />
      </label>
      <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
      {uploading && <small style={{ color: "#555" }}>Mengunggah...</small>}
      {error && <small style={{ color: "#d33" }}>{error}</small>}
      {helperText && <small style={{ color: "#666" }}>{helperText}</small>}
    </div>
  );
}

type Status = "idle" | "saving" | "saved" | "error";

const SOCIAL_FIELDS = [
  { icon: "facebook-f", label: "Facebook" },
  { icon: "instagram", label: "Instagram" },
  { icon: "linkedin-in", label: "LinkedIn" },
];

type ActiveSection =
  | "overview"
  | "branding"
  | "hero"
  | "partners"
  | "about"
  | "programs"
  | "activities"
  | "instructors"
  | "events"
  | "blog"
  | "cta"
  | "newsletter"
  | "instagram"
  | "testimonials"
  | "contact";

export default function AdminDashboard({ initialContent, templateMarkup }: Props) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>({
    ...initialContent,
    about: {
      ...initialContent.about,
      ctaLabel: initialContent.about?.ctaLabel ?? initialContent.branding.ctaLabel,
      ctaLink: initialContent.about?.ctaLink ?? initialContent.branding.ctaLink,
      phone: initialContent.about?.phone ?? initialContent.contact.whatsapp,
    },
    programsSection: initialContent.programsSection ?? {
      tagline: "Our Programs",
      title: "We Meet Kids At Their Level<br>Regardless Of Their Age",
    },
    instructorsDecorations: initialContent.instructorsDecorations ?? {
      loveShape: "/assets/img/team/love.png",
      frameShape: "/assets/img/team/frame.png",
    },
    testimonialsSection: initialContent.testimonialsSection ?? {
      tagline: "Testimonials",
      title: "Parents' Words Are The Key<br>To Happy Kids",
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
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const statCards = useMemo(
    () => [
      { label: "Program Aktif", value: content.programs.length },
      { label: "Event Terjadwal", value: content.events.length },
      { label: "Artikel", value: content.blog.posts.length },
    ],
    [content],
  );

  const navigationItems = useMemo(() => [
    { id: "overview" as ActiveSection, label: "Dashboard", icon: PiHouseBold, description: "Ringkasan konten" },
    { id: "branding" as ActiveSection, label: "Branding", icon: PiPaletteBold, description: "Logo & identitas" },
    { id: "hero" as ActiveSection, label: "Hero Section", icon: PiImageBold, description: "Halaman depan" },
    { id: "partners" as ActiveSection, label: "Partner", icon: PiImageBold, description: "Logo partner" },
    { id: "about" as ActiveSection, label: "Tentang Kami", icon: PiInfoBold, description: "Informasi sekolah" },
    { id: "programs" as ActiveSection, label: "Program", icon: PiChalkboardTeacherBold, description: "Program pembelajaran" },
    { id: "activities" as ActiveSection, label: "Aktivitas", icon: PiArticleBold, description: "Kegiatan mingguan" },
    { id: "instructors" as ActiveSection, label: "Pengajar", icon: PiUserBold, description: "Tim pengajar" },
    { id: "events" as ActiveSection, label: "Work Process", icon: PiListBold, description: "Langkah proses" },
    { id: "blog" as ActiveSection, label: "Artikel", icon: PiArticleBold, description: "Berita & artikel" },
    { id: "cta" as ActiveSection, label: "Call to Action", icon: PiBellBold, description: "Ajakan interaksi" },
    { id: "newsletter" as ActiveSection, label: "Newsletter", icon: PiBellBold, description: "Berlangganan" },
    { id: "instagram" as ActiveSection, label: "Instagram", icon: PiInstagramLogoBold, description: "Feed Instagram" },
    { id: "testimonials" as ActiveSection, label: "Testimonial", icon: PiArticleBold, description: "Kata orang tua" },
    { id: "contact" as ActiveSection, label: "Kontak", icon: PiPhoneBold, description: "Informasi kontak" },
  ], []);

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

  const handleCalloutChange = (
    field: keyof typeof content.callToAction,
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      callToAction: { ...prev.callToAction, [field]: value },
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
    field: keyof (typeof content.programs)[number],
    value: string,
  ) => {
    setContent((prev) => {
      const programs = [...prev.programs];
      programs[index] = { ...programs[index], [field]: value };
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
            title: "Judul Artikel",
            excerpt: "Ringkasan singkat artikel baru.",
            image: prev.blog.posts[0]?.image ?? "",
            date: "01 Jan 2025",
            author: "Clevio Team",
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
    field: "tagline" | "title" | "image",
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
          { title: "Aktivitas baru", description: "Deskripsi singkat" },
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

  const addInstructor = () => {
    setContent((prev) => ({
      ...prev,
      instructors: [
        ...prev.instructors,
        {
          id: crypto.randomUUID(),
          name: "Nama Mentor",
          role: "Peran",
          avatar: "/assets/img/team/01.jpg",
          socials: [],
        },
      ],
    }));
  };

  const removeInstructor = (index: number) => {
    setContent((prev) => ({
      ...prev,
      instructors: prev.instructors.filter((_, idx) => idx !== index),
    }));
  };

  const updateInstructorField = (
    index: number,
    field: keyof (typeof content.instructors)[number],
    value: string,
  ) => {
    setContent((prev) => {
      const instructors = [...prev.instructors];
      instructors[index] = { ...instructors[index], [field]: value };
      return { ...prev, instructors };
    });
  };

  const updateInstructorSocial = (
    index: number,
    icon: string,
    value: string,
  ) => {
    setContent((prev) => {
      const instructors = [...prev.instructors];
      const current = instructors[index];
      const socialMap = new Map(
        current.socials.map((item) => [item.icon, item.href]),
      );
      if (value.trim()) {
        socialMap.set(icon, value);
      } else {
        socialMap.delete(icon);
      }
      const socials = Array.from(socialMap.entries()).map(([key, href]) => ({
        label: key,
        icon,
        href,
      }));
      instructors[index] = { ...current, socials };
      return { ...prev, instructors };
    });
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

  const handleWorkProcessFieldChange = (field: "tagline" | "title", value: string) => {
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
            icon: "/assets/img/icon/new.svg"
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

  const handleInstructorsDecorationChange = (
    field: keyof SiteContent["instructorsDecorations"],
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      instructorsDecorations: { ...prev.instructorsDecorations, [field]: value },
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
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan");
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const resetContent = () => {
    setContent(initialContent);
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
            <div className="admin-stats">
              {statCards.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="overview-cards">
              <div className="overview-card">
                <h3>🎉 Selamat datang di Dashboard Clevio!</h3>
                <p>Gunakan menu di kiri untuk mengelola konten website. Semua perubahan akan langsung tersimpan setelah menekan tombol &quot;Simpan Perubahan&quot;.</p>
              </div>

              <div className="overview-card">
                <h3>📝 Cara Penggunaan:</h3>
                <ol>
                  <li>Pilih menu di sidebar kiri sesuai konten yang ingin diubah</li>
                  <li>Edit konten sesuai kebutuhan</li>
                  <li>Klik &quot;Simpan Perubahan&quot; untuk menyimpan</li>
                  <li>Perubahan akan langsung terlihat di website</li>
                </ol>
              </div>
            </div>
          </div>
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
                  placeholder="Clevio Kindergarten"
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
              <h2>dY^ Partner Clevio</h2>
              <p>Logo partner ditampilkan sebagai marquee di bawah hero. Atur urutan dan logo di sini.</p>
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
              description="Tambahkan atau ubah logo partner yang tampil di marquee"
            >
              <div className="list-header">
                <p>{content.partners.length} Logo Partner</p>
                <button className="ghost-btn small" onClick={addPartner}>
                  <PiPlusBold /> Tambah Logo
                </button>
              </div>
              <div className="admin-list">
                {content.partners.map((partner, index) => (
                  <div key={partner.id} className="list-card">
                    <div className="list-card-header">
                      <strong>Logo {index + 1}</strong>
                      <button onClick={() => removePartner(index)}>
                        <PiTrashBold />
                      </button>
                    </div>
                    <ImageInput
                      label="URL atau upload logo"
                      value={partner.logo}
                      onChange={(value) => updatePartner(index, value)}
                    />
                  </div>
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
              height={520}
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
                    placeholder="Tentang Clevio Kindergarten"
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
                      label="Gambar Program"
                      value={program.image}
                      onChange={(value) => updateProgram(index, "image", value)}
                    />
                    <p className="image-note">
                      <strong>Rekomendasi:</strong> 560 × 360 px (rasio 14:9)
                    </p>
                  </div>
                </div>
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
              description="Tagline, judul section, dan gambar kegiatan"
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
              <ImageInput
                label="Gambar Kegiatan"
                value={content.activities.image}
                onChange={(value) => handleActivitiesFieldChange("image", value)}
              />
            </div>

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
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </>
        );

      case "instructors":
        return (
          <>
            <div className="section-context">
              <h2>👩‍🏫 Tim Pengajar</h2>
              <p>Informasi tim pengajar akan ditampilkan di carousel/slider. Setiap pengajar memiliki foto, nama, peran, dan link media sosial.</p>
            </div>

            <PreviewFrame
              section="instructors"
              title="Slider Pengajar"
              description="Carousel mentor/pengajar sesuai tampilan situs"
              height={520}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Icon/Shape Dekorasi"
              description="Atur dua ikon bergerak pada section pengajar."
            >
              <div className="form-grid">
                <ImageInput
                  label="Ikon Love (kiri)"
                  value={content.instructorsDecorations.loveShape}
                  onChange={(value) => handleInstructorsDecorationChange("loveShape", value)}
                />
                <ImageInput
                  label="Icon Frame (kanan)"
                  value={content.instructorsDecorations.frameShape}
                  onChange={(value) => handleInstructorsDecorationChange("frameShape", value)}
                />
              </div>
            </AdminCard>

            <AdminCard
              title="Daftar Pengajar"
              description="Kelola informasi mentor dan pengajar sekolah"
            >
            <div className="list-header">
              <p>{content.instructors.length} Pengajar</p>
              <button className="ghost-btn small" onClick={addInstructor}>
                <PiPlusBold /> Tambah
              </button>
            </div>
            <div className="admin-list">
              {content.instructors.map((instructor, index) => (
                <div key={instructor.id} className="list-card">
                  <div className="list-card-header">
                    <strong>{instructor.name}</strong>
                    <button onClick={() => removeInstructor(index)}>
                      <PiTrashBold />
                    </button>
                  </div>
                  <div className="form-grid">
                    <label>
                      Nama Lengkap
                      <input
                        value={instructor.name}
                        onChange={(e) => updateInstructorField(index, "name", e.target.value)}
                        placeholder="Nama Pengajar"
                      />
                    </label>
                    <label>
                      Jabatan/Peran
                      <input
                        value={instructor.role}
                        onChange={(e) => updateInstructorField(index, "role", e.target.value)}
                        placeholder="Head Teacher"
                      />
                    </label>
                    <ImageInput
                      label="Foto Pengajar"
                      value={instructor.avatar}
                      onChange={(value) => updateInstructorField(index, "avatar", value)}
                    />
                  </div>

                  <div className="social-inputs" style={{ marginTop: "1rem" }}>
                    <p style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Media Sosial:</p>
                    {SOCIAL_FIELDS.map((social) => (
                      <label key={`${instructor.id}-${social.icon}`}>
                        {social.label}
                        <input
                          value={
                            instructor.socials.find((item) => item.icon === social.icon)?.href ?? ""
                          }
                          onChange={(e) =>
                            updateInstructorSocial(index, social.icon, e.target.value)
                          }
                          placeholder={`https://${social.label.toLowerCase()}.com/username`}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </>
        );

      case "events":
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
                    placeholder="Bagaimana proses kami berjalan"
                  />
                </label>
                <label>
                  Judul Besar
                  <textarea
                    value={content.benefits.title}
                    onChange={(e) => handleWorkProcessFieldChange("title", e.target.value)}
                    placeholder="Langkah kerja utama di Clevio"
                    style={{ minHeight: "90px" }}
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
                      <ImageInput
                        label="Icon Langkah"
                        value={item.icon || ""}
                        onChange={(value) => updateWorkProcessItem(index, "icon", value)}
                        helperText="Upload icon khusus untuk langkah ini (PNG/SVG)."
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

      case "blog":
        return (
          <>
            <div className="section-context">
              <h2>📰 Artikel & Berita</h2>
              <p>Artikel-artikel ini akan ditampilkan di blog/berita website. Setiap artikel memiliki gambar, judul, ringkasan, penulis, dan tanggal publikasi.</p>
            </div>

            <PreviewFrame
              section="blog"
              title="Blog & Artikel"
              description="Layout daftar artikel di halaman utama"
              height={540}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Daftar Artikel"
              description="Kelola konten blog dan berita sekolah"
            >
            <div className="list-header">
              <p>{content.blog.posts.length} Artikel Dipublikasi</p>
              <button className="ghost-btn small" onClick={addBlogPost}>
                <PiPlusBold /> Tambah Artikel
              </button>
            </div>
            <div className="admin-list">
              {content.blog.posts.map((post, index) => (
                <div key={post.id} className="list-card">
                  <div className="list-card-header">
                    <strong>{post.title}</strong>
                    <button onClick={() => removeBlogPost(index)}>
                      <PiTrashBold />
                    </button>
                  </div>
                  <div className="form-grid">
                    <label>
                      Judul Artikel
                      <input
                        value={post.title}
                        onChange={(e) => updateBlog(index, "title", e.target.value)}
                        placeholder="Judul Menarik Artikel"
                      />
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
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </>
        );

      case "cta":
        return (
          <>
            <div className="section-context">
              <h2>🎯 Call to Action (Ajakan Bertindak)</h2>
              <p>Section ini untuk mendorong pengunjung melakukan aksi (daftar, hubungi, dll). Biasanya muncul di tengah halaman dengan gambar dan tombol yang menonjol.</p>
            </div>

            <PreviewFrame
              section="cta"
              title="Call to Action"
              description="Banner ajakan bertindak dengan gambar"
              height={460}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Konten Call to Action"
              description="Eyebrow, judul, deskripsi, dan tombol ajakan"
            >
            <div className="form-grid">
              <label>
                Label Atas (Eyebrow)
                <input
                  value={content.callToAction.eyebrow}
                  onChange={(e) => handleCalloutChange("eyebrow", e.target.value)}
                  placeholder="Limited Seats"
                />
              </label>
              <label>
                Judul Utama
                <input
                  value={content.callToAction.title}
                  onChange={(e) => handleCalloutChange("title", e.target.value)}
                  placeholder="Daftar Sekarang Juga!"
                />
              </label>
              <label>
                Deskripsi
                <textarea
                  value={content.callToAction.text}
                  onChange={(e) => handleCalloutChange("text", e.target.value)}
                  placeholder="Jangan lewatkan kesempatan terbaik untuk..."
                  style={{ minHeight: "100px" }}
                />
              </label>
              <ImageInput
                label="Gambar Pendukung"
                value={content.callToAction.image}
                onChange={(value) => handleCalloutChange("image", value)}
              />
              <label>
                Teks Tombol
                <input
                  value={content.callToAction.button.label}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      callToAction: {
                        ...prev.callToAction,
                        button: { ...prev.callToAction.button, label: e.target.value },
                      },
                    }))
                  }
                  placeholder="Hubungi Kami"
                />
              </label>
              <label>
                Link Tombol
                <input
                  value={content.callToAction.button.href}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      callToAction: {
                        ...prev.callToAction,
                        button: { ...prev.callToAction.button, href: e.target.value },
                      },
                    }))
                  }
                  placeholder="/contact"
                />
              </label>
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
                  placeholder="Stay Updated"
                />
              </label>
              <label>
                Judul Newsletter
                <textarea
                  value={content.newsletter.title}
                  onChange={(e) => handleNewsletterChange("title", e.target.value)}
                  placeholder="Dapatkan informasi terbaru tentang kegiatan kami"
                  style={{ minHeight: "80px" }}
                />
              </label>
              <label>
                Teks Tombol Berlangganan
                <input
                  value={content.newsletter.buttonLabel}
                  onChange={(e) => handleNewsletterChange("buttonLabel", e.target.value)}
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
              <h2>dY'? Testimonial</h2>
              <p>Atur judul dan tagline pada bagian testimonial agar sesuai dengan konten yang ingin ditampilkan.</p>
            </div>

            <PreviewFrame
              section="testimonials"
              title="Testimonials"
              description="Bagian ulasan orang tua"
              height={480}
              content={content}
              templateMarkup={templateMarkup}
            />

            <AdminCard
              title="Judul & Tagline Testimonial"
              description="Ubah teks atas dan judul besar di section testimonial."
            >
              <div className="form-grid">
                <label>
                  Tagline
                  <input
                    value={content.testimonialsSection.tagline}
                    onChange={(e) => handleTestimonialsSectionChange("tagline", e.target.value)}
                    placeholder="Testimonials"
                  />
                </label>
                <label>
                  Judul Besar
                  <textarea
                    value={content.testimonialsSection.title}
                    onChange={(e) => handleTestimonialsSectionChange("title", e.target.value)}
                    placeholder={"Parents' Words Are The Key\nTo Happy Kids"}
                    style={{ minHeight: "90px" }}
                  />
                  <span className="field-hint">
                    Gunakan baris baru untuk line break pada judul.
                  </span>
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
                          style={{ minHeight: "90px" }}
                        />
                      </label>
                      <label>
                        Nama
                        <input
                          value={testi.name}
                          onChange={(e) => updateTestimonial(index, "name", e.target.value)}
                          placeholder="Nama Orang Tua"
                        />
                      </label>
                      <label>
                        Peran
                        <input
                          value={testi.role}
                          onChange={(e) => updateTestimonial(index, "role", e.target.value)}
                          placeholder="Orang Tua Murid"
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
        </>
        );

      default:
        return <div>Pilih menu di sidebar untuk mulai mengedit konten.</div>;
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-layout">
        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <PiListBold size={20} />
        </button>

        <aside className={`admin-sidebar ${sidebarOpen ? "open" : "collapsed"} ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {/* Header Section in Sidebar */}
          <div className="sidebar-header">
            {sidebarOpen && (
              <div className="admin-heading">
                <p className="eyebrow">Clevio Admin Panel</p>
                <h1>Dashboard Konten Website</h1>
                <div className="active-section-pill">
                  <span>Sedang mengedit</span>
                  <strong>{navigationItems.find((item) => item.id === activeSection)?.label ?? "Dashboard"}</strong>
                </div>
              </div>
            )}
            <button className="sidebar-toggle" onClick={() => setSidebarOpen((prev) => !prev)}>
              {sidebarOpen ? "❮" : "❯"}
            </button>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`sidebar-item ${activeSection === item.id ? "active" : ""}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon size={18} />
                  {sidebarOpen && (
                    <div className="sidebar-content">
                      <span className="sidebar-label">{item.label}</span>
                    </div>
                  )}
                </button>
              );
            })}
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
                  ❌ Gagal menyimpan. Coba beberapa detik lagi.
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
              <p className="eyebrow">Clevio Admin Panel</p>
              <h1>Dashboard Konten Website</h1>
              <div className="active-section-pill">
                <span>Sedang mengedit</span>
                <strong>{navigationItems.find((item) => item.id === activeSection)?.label ?? "Dashboard"}</strong>
              </div>
            </div>
            <p className="admin-subtitle">
              Kelola konten secara real-time. Pilih menu di kiri, lihat pratinjau, lalu sesuaikan teks, gambar, dan CTA.
            </p>
          </div>
          {renderMainContent()}
        </main>
      </div>

      {/* Floating action buttons */}
      <div className="admin-action-bar floating">
        <div className="action-bar-buttons">
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
      <div className="preview-frame" style={frameHeight ? { minHeight: frameHeight } : undefined}>
        <SectionPreviewCanvas
          key={section}
          markup={templateMarkup}
          content={content}
          allowedKeys={allowedKeys}
        />
      </div>
    </div>
  );
}

interface SectionPreviewCanvasProps {
  markup: string;
  content: SiteContent;
  allowedKeys: string[];
}

function SectionPreviewCanvas({ markup, content, allowedKeys }: SectionPreviewCanvasProps) {
  const uniqueId = useId().replace(/:/g, "");
  const previewRootId = `preview-source-${uniqueId}`;
  const previewTargetId = `preview-output-${uniqueId}`;

  useEffect(() => {
    const sourceRoot = document.getElementById(previewRootId);
    const target = document.getElementById(previewTargetId);
    if (!sourceRoot || !target) return;

    const allowed = new Set(allowedKeys);

    const sync = () => {
      const nodes = Array.from(
        sourceRoot.querySelectorAll<HTMLElement>("[data-preview]"),
      ).filter((node) => allowed.has(node.dataset.preview ?? ""));

      const fragment = document.createDocumentFragment();
      nodes.forEach((node) => fragment.appendChild(node.cloneNode(true)));

      target.innerHTML = "";
      target.appendChild(fragment);
      fixAssetPaths(target);
    };

    const raf = requestAnimationFrame(sync);
    const syncTimer = window.setTimeout(sync, 200);
    const observer = new MutationObserver(sync);
    observer.observe(sourceRoot, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(syncTimer);
      observer.disconnect();
    };
  }, [allowedKeys, content, markup, previewRootId, previewTargetId]);

  return (
    <div className="preview-stage preview-scoped">
      <div
        id={previewRootId}
        className="preview-template-root"
        dangerouslySetInnerHTML={{ __html: markup }}
        suppressHydrationWarning
        aria-hidden
      />
      <ThemeBinder content={content} rootId={previewRootId} />
      <PreviewAssets rootId={previewRootId} />
      <div id={previewTargetId} className="preview-output" />
    </div>
  );
}
