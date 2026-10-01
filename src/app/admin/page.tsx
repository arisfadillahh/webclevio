import Link from "next/link";
import {
  PiArticleBold,
  PiCalendarBold,
  PiCheckCircleBold,
  PiDatabaseBold,
  PiLockKeyBold,
  PiPencilSimpleBold,
} from "react-icons/pi";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdminSession } from "@/lib/admin-session";
import { withBase } from "@/lib/camp-path";
import { getSiteContent } from "@/lib/content";
import { getContentStorageMode } from "@/lib/db";
import { getRequestBasePath } from "@/lib/request-base";

export const metadata = { title: "Dashboard | Clevio CMS" };

export default async function AdminPage() {
  await requireAdminSession("/admin");
  const base = await getRequestBasePath();
  const href = (path: string) => withBase(base, path);
  const [content, storageMode] = await Promise.all([
    getSiteContent(),
    Promise.resolve(getContentStorageMode()),
  ]);
  const publishedArticles = content.blog.posts.filter((item) => item.status === "published").length;
  const publishedEvents = content.events.filter((item) => item.status === "published").length;

  return (
    <AdminShell storageMode={storageMode}>
      <div className="production-admin-page">
        <AdminPageHeader
          eyebrow="Workspace"
          title="Ringkasan website"
          description="Kelola konten yang boleh berubah tanpa menyentuh kode, layout, atau konfigurasi internal website."
          actions={<Link className="production-secondary-button" href={href("/")} target="_blank">Lihat website</Link>}
        />

        {storageMode === "json-development" ? (
          <section className="production-database-warning">
            <PiDatabaseBold />
            <div>
              <strong>Database production belum dihubungkan</strong>
              <p>Dashboard tetap berjalan dengan data lokal untuk development. Isi <code>DATABASE_URL</code>, lalu jalankan <code>npm run db:migrate</code> sebelum deployment.</p>
            </div>
          </section>
        ) : null}

        <section className="production-stat-grid">
          <article><span><PiArticleBold /></span><div><small>Artikel tayang</small><strong>{publishedArticles}</strong><p>{content.blog.posts.length - publishedArticles} draft</p></div></article>
          <article><span><PiCalendarBold /></span><div><small>Event tayang</small><strong>{publishedEvents}</strong><p>{content.events.length - publishedEvents} draft</p></div></article>
          <article><span><PiCheckCircleBold /></span><div><small>Level</small><strong>{content.programs.length}</strong><p>Software dan logo diatur di konten website</p></div></article>
        </section>

        <section className="production-dashboard-grid">
          <div className="production-dashboard-panel">
            <div className="production-panel-heading"><div><span>Akses cepat</span><h2>Pilih area kerja</h2></div></div>
            <div className="production-quick-links">
              <Link href={href("/admin/content")}><PiPencilSimpleBold /><span><strong>Konten website</strong><small>Bagian atas, level, dan footer</small></span></Link>
              <Link href={href("/admin/articles")}><PiArticleBold /><span><strong>Artikel</strong><small>Tulis, simpan draft, lalu publikasikan</small></span></Link>
              <Link href={href("/admin/events")}><PiCalendarBold /><span><strong>Event</strong><small>Atur kartu dan link landing page</small></span></Link>
            </div>
          </div>

          <div className="production-dashboard-panel">
            <div className="production-panel-heading"><div><span>Batas akses</span><h2>Aman untuk tim konten</h2></div><PiLockKeyBold /></div>
            <ul className="production-permission-list">
              <li><PiCheckCircleBold /><span><strong>Bisa diubah</strong>Teks, gambar, link, data artikel/event, dan status publikasi.</span></li>
              <li><PiLockKeyBold /><span><strong>Dikunci</strong>Layout, komponen, ID database, kredensial, dan konfigurasi sistem.</span></li>
              <li><PiDatabaseBold /><span><strong>Tersimpan terpisah</strong>Artikel dan Event tidak menimpa konten landing page.</span></li>
            </ul>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
