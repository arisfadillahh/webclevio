"use client";

import { useMemo, useState, type ReactNode } from "react";
import { PiArticleBold, PiCheckBold, PiMagnifyingGlassBold, PiPlusBold, PiTrashBold } from "react-icons/pi";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ArticleGalleryEditor from "@/components/admin/ArticleGalleryEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { BlogPost } from "@/types/content";

type Props = { initialItems: BlogPost[] };
type RequestState = "idle" | "saving" | "deleting";
type Issue = { field: string; message: string };

const emptyArticle: BlogPost = {
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  image: "",
  date: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()),
  author: "Tim Clevio",
  category: "Insight Clevio",
  readingTime: "5 menit baca",
  status: "draft",
  body: "",
  gallery: [],
  galleryMode: "carousel",
};

export default function ArticleManager({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState<BlogPost | null>(initialItems[0] ?? null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BlogPost["status"]>("all");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesQuery = !normalized || `${item.title} ${item.category} ${item.author}`.toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  const update = <K extends keyof BlogPost>(field: K, value: BlogPost[K]) => {
    setDraft((current) => current ? { ...current, [field]: value } : current);
    setMessage(null);
    setIssues([]);
  };

  const save = async () => {
    if (!draft) return;
    setRequestState("saving");
    setMessage(null);
    setIssues([]);
    const isNew = !draft.id;
    const response = await fetch(isNew ? "/api/admin/articles" : `/api/admin/articles/${encodeURIComponent(draft.id)}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const result = await response.json() as { ok: boolean; item?: BlogPost; message?: string; issues?: Issue[] };
    setRequestState("idle");
    if (!response.ok || !result.item) {
      setMessage(result.message ?? "Artikel gagal disimpan.");
      setIssues(result.issues ?? []);
      return;
    }
    setItems((current) => isNew ? [result.item!, ...current] : current.map((item) => item.id === result.item!.id ? result.item! : item));
    setDraft(result.item);
    setMessage("Artikel sudah disimpan.");
  };

  const remove = async () => {
    if (!draft?.id) return;
    setRequestState("deleting");
    const response = await fetch(`/api/admin/articles/${encodeURIComponent(draft.id)}`, { method: "DELETE" });
    const result = await response.json() as { ok: boolean; message?: string };
    setRequestState("idle");
    if (!response.ok) {
      setMessage(result.message ?? "Artikel gagal dihapus.");
      return;
    }
    const nextItems = items.filter((item) => item.id !== draft.id);
    setItems(nextItems);
    setDraft(nextItems[0] ?? null);
    setConfirmDelete(false);
    setMessage("Artikel sudah dihapus.");
  };

  return (
    <div className="production-admin-page">
      <AdminPageHeader
        eyebrow="Publikasi"
        title="Artikel"
        description="Kelola artikel secara terpisah dari konten landing page. Simpan sebagai draft sampai siap ditayangkan."
        actions={<button className="production-primary-button" onClick={() => { setDraft({ ...emptyArticle }); setConfirmDelete(false); setMessage(null); }}><PiPlusBold /> Artikel baru</button>}
      />

      <section className="production-manager-layout">
        <aside className="production-manager-list">
          <div className="production-manager-tools">
            <label><PiMagnifyingGlassBold /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari artikel..." /></label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} aria-label="Filter status artikel">
              <option value="all">Semua status</option>
              <option value="published">Tayang</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="production-manager-count">{filteredItems.length} artikel</div>
          <div className="production-manager-scroll">
            {filteredItems.map((item) => (
              <button key={item.id} className={draft?.id === item.id ? "is-selected" : ""} onClick={() => { setDraft({ ...item }); setConfirmDelete(false); setMessage(null); }}>
                <span className={`production-status-dot ${item.status}`} />
                <span><strong>{item.title}</strong><small>{item.category} · {item.date}</small></span>
              </button>
            ))}
            {filteredItems.length === 0 ? <div className="production-empty-state"><PiArticleBold /><strong>Belum ada artikel</strong><span>Buat artikel baru atau ubah filter pencarian.</span></div> : null}
          </div>
        </aside>

        <div className="production-manager-editor">
          {draft ? (
            <>
              <div className="production-editor-toolbar">
                <div><strong>{draft.id ? "Edit artikel" : "Artikel baru"}</strong><span>ID dan struktur halaman dikunci oleh sistem.</span></div>
                <label className="production-status-select">Status<select value={draft.status} onChange={(event) => update("status", event.target.value as BlogPost["status"])}><option value="draft">Draft</option><option value="published">Tayang</option></select></label>
              </div>
              {message ? <div className={`production-form-message ${issues.length ? "is-error" : ""}`}>{message}</div> : null}
              {issues.length ? <ul className="production-form-issues">{issues.map((issue) => <li key={`${issue.field}-${issue.message}`}>{issue.field}: {issue.message}</li>)}</ul> : null}
              <div className="production-form-grid">
                <Field label="Judul" limit={100} value={draft.title}><input value={draft.title} maxLength={100} onChange={(event) => update("title", event.target.value)} /></Field>
                <Field label="Slug URL" limit={120} value={draft.slug}><input value={draft.slug} maxLength={120} onChange={(event) => update("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="otomatis-dari-judul" /></Field>
                <Field label="Ringkasan" limit={220} value={draft.excerpt} wide><textarea value={draft.excerpt} maxLength={220} rows={3} onChange={(event) => update("excerpt", event.target.value)} /></Field>
                <Field label="Isi artikel" limit={20000} value={draft.body} wide><textarea value={draft.body} maxLength={20000} rows={16} onChange={(event) => update("body", event.target.value)} /></Field>
                <ImageUploadField label="Gambar utama artikel" value={draft.image} onChange={(value) => update("image", value)} />
                <ArticleGalleryEditor images={draft.gallery} mode={draft.galleryMode} onImagesChange={(images) => update("gallery", images)} onModeChange={(mode) => update("galleryMode", mode)} />
                <Field label="Penulis" limit={80} value={draft.author}><input value={draft.author} maxLength={80} onChange={(event) => update("author", event.target.value)} /></Field>
                <Field label="Kategori" limit={60} value={draft.category}><input value={draft.category} maxLength={60} onChange={(event) => update("category", event.target.value)} /></Field>
                <Field label="Tanggal tampil" limit={40} value={draft.date}><input value={draft.date} maxLength={40} onChange={(event) => update("date", event.target.value)} /></Field>
                <Field label="Durasi baca" limit={32} value={draft.readingTime}><input value={draft.readingTime} maxLength={32} onChange={(event) => update("readingTime", event.target.value)} /></Field>
              </div>
              <div className="production-editor-actions">
                {draft.id ? (confirmDelete ? <div className="production-delete-confirm"><span>Hapus artikel ini?</span><button onClick={() => setConfirmDelete(false)}>Batal</button><button className="is-danger" onClick={remove} disabled={requestState !== "idle"}>Ya, hapus</button></div> : <button className="production-danger-button" onClick={() => setConfirmDelete(true)}><PiTrashBold /> Hapus</button>) : <span />}
                <button className="production-primary-button" onClick={save} disabled={requestState !== "idle"}><PiCheckBold /> {requestState === "saving" ? "Menyimpan..." : "Simpan artikel"}</button>
              </div>
            </>
          ) : <div className="production-empty-state is-large"><PiArticleBold /><strong>Pilih artikel untuk diedit</strong><span>Atau buat artikel baru dari tombol di kanan atas.</span></div>}
        </div>
      </section>
    </div>
  );
}

function Field({ label, limit, value, wide, children }: { label: string; limit: number; value: string; wide?: boolean; children: ReactNode }) {
  return <label className={wide ? "is-wide" : ""}><span>{label}<small>{value.length}/{limit}</small></span>{children}</label>;
}
