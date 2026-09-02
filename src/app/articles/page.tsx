import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PiArrowRightBold, PiClockBold, PiCodeBold } from "react-icons/pi";

import ContentSiteShell from "@/components/content/ContentSiteShell";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artikel Clevio Innovator Camp",
  description: "Insight belajar, teknologi, dan perkembangan anak dari tim Clevio.",
};

export default async function ArticlesPage() {
  const content = await getSiteContent();
  const posts = content.blog.posts.filter((post) => post.status === "published");
  const [featured, ...otherPosts] = posts;

  return (
    <ContentSiteShell content={content}>
      <section className="content-index-hero">
        <div className="content-site-container content-index-hero-inner">
          <span className="content-kicker"><PiCodeBold /> {content.blog.tagline}</span>
          <h1>{content.blog.title}</h1>
          <p>Insight praktis untuk membantu anak belajar, berkarya, dan tumbuh percaya diri di era teknologi.</p>
        </div>
      </section>

      <section className="content-index-section">
        <div className="content-site-container">
          {featured ? (
            <article className="article-featured-card">
              <Link href={`/articles/${featured.slug}`} className="article-featured-media">
                <Image src={featured.image} alt={featured.title} fill sizes="(max-width: 900px) 100vw, 52vw" unoptimized />
              </Link>
              <div className="article-featured-content">
                <span className="content-status-badge">Pilihan Editor</span>
                <p className="content-meta"><span>{featured.category}</span><span>{featured.date}</span><span><PiClockBold /> {featured.readingTime}</span></p>
                <h2><Link href={`/articles/${featured.slug}`}>{featured.title}</Link></h2>
                <p>{featured.excerpt}</p>
                <Link href={`/articles/${featured.slug}`} className="content-text-link">Baca artikel <PiArrowRightBold /></Link>
              </div>
            </article>
          ) : (
            <div className="content-empty-state"><h2>Belum ada artikel terbit</h2><p>Artikel yang dipublikasikan dari dashboard akan muncul di halaman ini.</p></div>
          )}

          {otherPosts.length > 0 && (
            <div className="article-grid">
              {otherPosts.map((post) => (
                <article key={post.id} className="article-card">
                  <Link href={`/articles/${post.slug}`} className="article-card-media">
                    <Image src={post.image} alt={post.title} fill sizes="(max-width: 760px) 100vw, 33vw" unoptimized />
                  </Link>
                  <div className="article-card-content">
                    <p className="content-meta"><span>{post.category}</span><span>{post.date}</span></p>
                    <h2><Link href={`/articles/${post.slug}`}>{post.title}</Link></h2>
                    <p>{post.excerpt}</p>
                    <Link href={`/articles/${post.slug}`} className="content-text-link">Baca selengkapnya <PiArrowRightBold /></Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </ContentSiteShell>
  );
}
