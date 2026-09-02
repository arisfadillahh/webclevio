"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  PiArticleBold,
  PiArrowSquareOutBold,
  PiCalendarBold,
  PiDatabaseBold,
  PiHouseBold,
  PiListBold,
  PiSignOutBold,
  PiSlidersHorizontalBold,
  PiXBold,
} from "react-icons/pi";

type Props = {
  children: ReactNode;
  storageMode: "postgres" | "json-development";
};

const navigation = [
  { href: "/admin", label: "Ringkasan", description: "Status website", icon: PiHouseBold },
  { href: "/admin/content", label: "Konten website", description: "Teks dan gambar", icon: PiSlidersHorizontalBold },
  { href: "/admin/articles", label: "Artikel", description: "Artikel & berita", icon: PiArticleBold },
  { href: "/admin/events", label: "Event", description: "Event & landing page", icon: PiCalendarBold },
];

export default function AdminShell({ children, storageMode }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="production-admin-shell">
      <button
        type="button"
        className="production-admin-menu-button"
        onClick={() => setMobileOpen((value) => !value)}
        aria-label={mobileOpen ? "Tutup menu admin" : "Buka menu admin"}
      >
        {mobileOpen ? <PiXBold /> : <PiListBold />}
      </button>

      <aside className={`production-admin-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="production-admin-brand">
          <span className="production-admin-brandmark">C</span>
          <div>
            <strong>Clevio CMS</strong>
            <span>Content operations</span>
          </div>
        </div>

        <div className={`production-storage-state ${storageMode === "postgres" ? "is-ready" : "is-warning"}`}>
          <PiDatabaseBold />
          <div>
            <strong>{storageMode === "postgres" ? "PostgreSQL aktif" : "Mode development"}</strong>
            <span>{storageMode === "postgres" ? "Data tersimpan di database" : "DATABASE_URL belum terhubung"}</span>
          </div>
        </div>

        <nav className="production-admin-nav" aria-label="Navigasi dashboard">
          <span className="production-admin-nav-label">Workspace</span>
          {navigation.map((item) => {
            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "is-active" : ""}
                onClick={() => setMobileOpen(false)}
              >
                <Icon />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="production-admin-sidebar-footer">
          <Link href="/" target="_blank">
            <PiArrowSquareOutBold /> Lihat website
          </Link>
          <button type="button" onClick={logout} disabled={loggingOut}>
            <PiSignOutBold /> {loggingOut ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </aside>

      {mobileOpen ? <button className="production-admin-backdrop" onClick={() => setMobileOpen(false)} aria-label="Tutup menu" /> : null}
      <main className="production-admin-main">{children}</main>
    </div>
  );
}
