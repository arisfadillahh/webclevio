import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PiArrowLeftBold, PiArrowRightBold, PiClockBold } from "react-icons/pi";

import ContentSiteShell from "@/components/content/ContentSiteShell";
import ArticleMediaGallery from "@/components/content/ArticleMediaGallery";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const [{ slug }, content] = await Promise.all([params, getSiteContent()]);
  const post = content.blog.posts.find((item) => item.slug === slug && item.status === "published");
  return post ? { title: `${post.title} | Clevio`, description: post.excerpt } : { title: "Artikel tidak ditemukan | Clevio" };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const [{ slug }, content] = await Promise.all([params, getSiteContent()]);
  const post = content.blog.posts.find((item) => item.slug === slug && item.status === "published");
  if (!post) notFound();

  const related = content.blog.posts
    .filter((item) => item.status === "published" && item.id !== post.id)
    .slice(0, 2);

  return (
    <ContentSiteShell content={content}>
      <article className="article-detail">
        <header className="article-detail-header">
          <div className="content-site-container article-detail-heading">
            <Link href="/articles" className="content-back-link"><PiArrowLeftBold /> Semua artikel</Link>
            <span className="content-status-badge">{post.category}</span>
            <h1>{post.title}</h1>
            <p className="article-detail-lead">{post.excerpt}</p>
            <p className="content-meta article-detail-meta"><span>{post.author}</span><span>{post.date}</span><span><PiClockBold /> {post.readingTime}</span></p>
          </div>
        </header>

        <div className="content-site-container article-detail-layout">
          <div className="article-detail-main">
            <div className="article-detail-cover">
              <Image src={post.image} alt={post.title} fill sizes="(max-width: 900px) 100vw, 820px" priority unoptimized />
            </div>
            <div className="article-prose">
              {post.body.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={`${post.id}-${index}`}>{paragraph}</p>)}
            </div>
            <ArticleMediaGallery title={post.title} images={post.gallery} mode={post.galleryMode} />
          </div>
          <aside className="article-detail-aside">
            <span>Ditulis oleh</span>
            <strong>{post.author}</strong>
            <p>Dapatkan insight dan informasi kegiatan terbaru dari Clevio Innovator Camp.</p>
            <Link href="/events" className="content-primary-button">Lihat event Clevio <PiArrowRightBold /></Link>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="related-content-section">
            <div className="content-site-container">
              <div className="content-section-heading"><div><span>Artikel lainnya</span><h2>Lanjutkan membaca</h2></div><Link href="/articles">Lihat semua <PiArrowRightBold /></Link></div>
              <div className="related-content-grid">
                {related.map((item) => (
                  <Link key={item.id} href={`/articles/${item.slug}`} className="related-content-card">
                    <span>{item.category}</span><h3>{item.title}</h3><p>{item.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </ContentSiteShell>
  );
}
