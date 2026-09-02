"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { PiCalendarBold, PiCheckBold, PiLinkBold, PiMagnifyingGlassBold, PiPlusBold, PiTrashBold } from "react-icons/pi";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { EventItem } from "@/types/content";

type Props = { initialItems: EventItem[] };
type RequestState = "idle" | "saving" | "deleting";
type Issue = { field: string; message: string };

const emptyEvent: EventItem = {
  id: "",
  date: "",
  time: "Sesuai rangkaian acara",
  title: "",
  location: "Online & Offline",
  description: "",
  image: "",
  status: "draft",
  audience: "",
  landingPageUrl: "https://",
};

export default function EventManager({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState<EventItem | null>(initialItems[0] ?? null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EventItem["status"]>("all");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesQuery = !normalized || `${item.title} ${item.audience} ${item.location}`.toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  const update = <K extends keyof EventItem>(field: K, value: EventItem[K]) => {
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
    const response = await fetch(isNew ? "/api/admin/events" : `/api/admin/events/${encodeURIComponent(draft.id)}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const result = await response.json() as { ok: boolean; item?: EventItem; message?: string; issues?: Issue[] };
    setRequestState("idle");
    if (!response.ok || !result.item) {
      setMessage(result.message ?? "Event gagal disimpan.");
      setIssues(result.issues ?? []);
      return;
    }
    setItems((current) => isNew ? [...current, result.item!] : current.map((item) => item.id === result.item!.id ? result.item! : item));
    setDraft(result.item);
    setMessage("Event sudah disimpan.");
  };

  const remove = async () => {
    if (!draft?.id) return;
    setRequestState("deleting");
    const response = await fetch(`/api/admin/events/${encodeURIComponent(draft.id)}`, { method: "DELETE" });
    const result = await response.json() as { ok: boolean; message?: string };
    setRequestState("idle");
    if (!response.ok) {
      setMessage(result.message ?? "Event gagal dihapus.");
      return;
    }
    const nextItems = items.filter((item) => item.id !== draft.id);
    setItems(nextItems);
    setDraft(nextItems[0] ?? null);
    setConfirmDelete(false);
    setMessage("Event sudah dihapus.");
  };

  return (
    <div className="production-admin-page">
      <AdminPageHeader
        eyebrow="Publikasi"
        title="Event"
        description="Kelola kartu event dan arahkan pengunjung ke landing page yang sudah jadi. Dashboard tidak membuat landing page baru."
        actions={<button className="production-primary-button" onClick={() => { setDraft({ ...emptyEvent }); setConfirmDelete(false); setMessage(null); }}><PiPlusBold /> Event baru</button>}
      />

      <section className="production-manager-layout">
        <aside className="production-manager-list">
          <div className="production-manager-tools">
            <label><PiMagnifyingGlassBold /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari event..." /></label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} aria-label="Filter status event">
              <option value="all">Semua status</option>
              <option value="published">Tayang</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="production-manager-count">{filteredItems.length} event</div>
          <div className="production-manager-scroll">
            {filteredItems.map((item) => (
              <button key={item.id} className={draft?.id === item.id ? "is-selected" : ""} onClick={() => { setDraft({ ...item }); setConfirmDelete(false); setMessage(null); }}>
                <span className={`production-status-dot ${item.status}`} />
                <span><strong>{item.title}</strong><small>{item.date} · {item.location}</small></span>
              </button>
            ))}
            {filteredItems.length === 0 ? <div className="production-empty-state"><PiCalendarBold /><strong>Belum ada event</strong><span>Buat event baru atau ubah filter pencarian.</span></div> : null}
          </div>
        </aside>

        <div className="production-manager-editor">
          {draft ? (
            <>
              <div className="production-editor-toolbar">
                <div><strong>{draft.id ? "Edit event" : "Event baru"}</strong><span>Hanya kartu event dan link tujuan yang dikelola di sini.</span></div>
                <label className="production-status-select">Status<select value={draft.status} onChange={(event) => update("status", event.target.value as EventItem["status"])}><option value="draft">Draft</option><option value="published">Tayang</option></select></label>
              </div>
              {message ? <div className={`production-form-message ${issues.length ? "is-error" : ""}`}>{message}</div> : null}
              {issues.length ? <ul className="production-form-issues">{issues.map((issue) => <li key={`${issue.field}-${issue.message}`}>{issue.field}: {issue.message}</li>)}</ul> : null}
              <div className="production-form-grid">
                <Field label="Nama event" limit={100} value={draft.title} wide><input value={draft.title} maxLength={100} onChange={(event) => update("title", event.target.value)} /></Field>
                <Field label="Deskripsi kartu" limit={260} value={draft.description} wide><textarea value={draft.description} maxLength={260} rows={4} onChange={(event) => update("description", event.target.value)} /></Field>
                <Field label="Tanggal/rentang" limit={48} value={draft.date}><input value={draft.date} maxLength={48} onChange={(event) => update("date", event.target.value)} placeholder="25 Apr - 17 Mei 2026" /></Field>
                <Field label="Waktu" limit={48} value={draft.time}><input value={draft.time} maxLength={48} onChange={(event) => update("time", event.target.value)} /></Field>
                <Field label="Lokasi" limit={120} value={draft.location}><input value={draft.location} maxLength={120} onChange={(event) => update("location", event.target.value)} /></Field>
                <Field label="Target peserta" limit={100} value={draft.audience}><input value={draft.audience} maxLength={100} onChange={(event) => update("audience", event.target.value)} /></Field>
                <ImageUploadField label="Gambar kartu event" value={draft.image} onChange={(value) => update("image", value)} description="Gunakan foto landscape agar kartu event tetap rapi. JPG, PNG, atau WebP; maksimum 8MB." />
                <Field label="Link landing page" limit={800} value={draft.landingPageUrl} wide><div className="production-input-with-icon"><PiLinkBold /><input type="url" value={draft.landingPageUrl} maxLength={800} onChange={(event) => update("landingPageUrl", event.target.value)} /></div></Field>
              </div>
              {draft.image ? <div className="production-event-preview"><Image src={draft.image} alt="Preview event" width={360} height={224} unoptimized /><div><span>Preview kartu</span><strong>{draft.title || "Judul event"}</strong><p>{draft.description || "Deskripsi event akan tampil di sini."}</p></div></div> : null}
              <div className="production-editor-actions">
                {draft.id ? (confirmDelete ? <div className="production-delete-confirm"><span>Hapus event ini?</span><button onClick={() => setConfirmDelete(false)}>Batal</button><button className="is-danger" onClick={remove} disabled={requestState !== "idle"}>Ya, hapus</button></div> : <button className="production-danger-button" onClick={() => setConfirmDelete(true)}><PiTrashBold /> Hapus</button>) : <span />}
                <button className="production-primary-button" onClick={save} disabled={requestState !== "idle"}><PiCheckBold /> {requestState === "saving" ? "Menyimpan..." : "Simpan event"}</button>
              </div>
            </>
          ) : <div className="production-empty-state is-large"><PiCalendarBold /><strong>Pilih event untuk diedit</strong><span>Atau buat event baru dari tombol di kanan atas.</span></div>}
        </div>
      </section>
    </div>
  );
}

function Field({ label, limit, value, wide, children }: { label: string; limit: number; value: string; wide?: boolean; children: ReactNode }) {
  return <label className={wide ? "is-wide" : ""}><span>{label}<small>{value.length}/{limit}</small></span>{children}</label>;
}
