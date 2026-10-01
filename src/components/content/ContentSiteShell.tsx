import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { PiArrowUpRightBold, PiCodeBold } from "react-icons/pi";

import { withBase } from "@/lib/camp-path";
import { getRequestBasePath } from "@/lib/request-base";
import type { SiteContent } from "@/types/content";

interface ContentSiteShellProps {
  content: SiteContent;
  children: ReactNode;
}

function publicHref(href: string) {
  return href.startsWith("#") ? `/${href}` : href;
}

export default async function ContentSiteShell({ content, children }: ContentSiteShellProps) {
  const base = await getRequestBasePath();
  const href = (path: string) => withBase(base, path);
  return (
    <div className="content-site-shell">
      <header className="content-site-header">
        <div className="content-site-container content-site-header-inner">
          <Link href={href("/")} className="content-site-logo" aria-label="Kembali ke beranda Clevio">
            <Image
              src={withBase(base, content.branding.logo)}
              alt={content.branding.name}
              width={190}
              height={64}
              priority
              unoptimized
            />
          </Link>
          <nav className="content-site-nav" aria-label="Navigasi halaman konten">
            <Link href={href("/")}>Beranda</Link>
            <Link href={href("/events")}>Event</Link>
            <Link href={href("/articles")}>Artikel</Link>
            <Link href={href("/#about")}>Tentang Kami</Link>
          </nav>
          <a className="content-site-header-cta" href={href(publicHref(content.branding.ctaLink))}>
            {content.branding.ctaLabel}
            <PiArrowUpRightBold aria-hidden="true" />
          </a>
        </div>
      </header>
      <main>{children}</main>
      <footer className="content-site-footer">
        <div className="content-site-container content-site-footer-inner">
          <div>
            <span className="content-site-footer-brand"><PiCodeBold /> {content.branding.name}</span>
            <p>{content.footer.blurb}</p>
          </div>
          <div className="content-site-footer-links">
            <Link href={href("/events")}>Event</Link>
            <Link href={href("/articles")}>Artikel</Link>
            <a href={`mailto:${content.branding.email}`}>{content.branding.email}</a>
          </div>
          <p className="content-site-copyright">{content.footer.text}</p>
        </div>
      </footer>
    </div>
  );
}
