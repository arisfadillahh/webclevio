import assert from "node:assert/strict";
import test from "node:test";
import { parseHTML } from "linkedom";

import { applyRecentFooterPosts, latestPublishedPosts } from "../src/lib/latest-posts.ts";
import type { BlogPost } from "../src/types/content.ts";

function post(overrides: Partial<BlogPost> & Pick<BlogPost, "slug" | "title" | "status">): BlogPost {
  return {
    id: overrides.slug,
    excerpt: "Ringkasan artikel yang cukup panjang untuk tes.",
    image: `/media/${overrides.slug}.jpg`,
    date: "1 Jan 2024",
    author: "Tim Clevio",
    category: "Insight",
    readingTime: "4 menit",
    body: "Isi artikel untuk tes footer.",
    gallery: [],
    galleryMode: "carousel",
    ...overrides,
  };
}

test("footer uses the two newest published articles and skips drafts", () => {
  const posts = [
    post({ slug: "draft-baru", title: "Draft terbaru", status: "draft", publishedAt: "2026-09-01T00:00:00.000Z" }),
    post({ slug: "lama", title: "Artikel lama", status: "published", publishedAt: "2026-01-02T00:00:00.000Z", date: "2 Jan 2026" }),
    post({ slug: "terbaru", title: "Artikel terbaru", status: "published", publishedAt: "2026-08-20T00:00:00.000Z", date: "20 Agu 2026" }),
    post({ slug: "tengah", title: "Artikel tengah", status: "published", publishedAt: "2026-05-01T00:00:00.000Z", date: "1 Mei 2026" }),
  ];

  const latest = latestPublishedPosts(posts, 2);
  assert.deepEqual(latest.map((item) => item.slug), ["terbaru", "tengah"]);
});

test("posts without a database timestamp still use the displayed date", () => {
  const latest = latestPublishedPosts([
    post({ slug: "februari", title: "Artikel Februari", status: "published", date: "20 Feb 2025" }),
    post({ slug: "maret-akhir", title: "Artikel akhir Maret", status: "published", date: "25 Mar 2025" }),
    post({ slug: "maret-awal", title: "Artikel awal Maret", status: "published", date: "11 Mar 2025" }),
  ], 2);
  assert.deepEqual(latest.map((item) => item.slug), ["maret-akhir", "maret-awal"]);
});

test("footer slots replace the template articles", () => {
  const { document } = parseHTML(`<div class="recent-post-area">
    <div class="recent-post-items">
      <div class="thumb"><img src="/assets/img/news/pp1.jpg" alt="post-img"></div>
      <div class="content">
        <ul class="post-date"><li><i class="fa-solid fa-calendar-days"></i>20 Feb, 2024</li></ul>
        <h6><a href="/articles">That jerk Form Finance really threw me</a></h6>
      </div>
    </div>
    <div class="recent-post-items">
      <div class="thumb"><img src="/assets/img/news/pp2.jpg" alt="post-img"></div>
      <div class="content">
        <ul class="post-date"><li><i class="fa-solid fa-calendar-days"></i>15 Dec, 2024</li></ul>
        <h6><a href="/articles">From without content style without</a></h6>
      </div>
    </div>
  </div>`);

  applyRecentFooterPosts(document, [
    post({ slug: "pitching-day", title: "Pitching Day Clevio", status: "published", publishedAt: "2026-07-01T00:00:00.000Z", date: "1 Jul 2026", image: "/api/media/pitching" }),
    post({ slug: "festival", title: "Festival Technopreneur", status: "published", publishedAt: "2026-06-01T00:00:00.000Z", date: "1 Jun 2026", image: "/api/media/festival" }),
  ]);

  const links = Array.from(document.querySelectorAll("h6 a"));
  assert.deepEqual(links.map((link) => link.textContent), ["Pitching Day Clevio", "Festival Technopreneur"]);
  assert.deepEqual(links.map((link) => link.getAttribute("href")), ["/articles/pitching-day", "/articles/festival"]);
  assert.equal(document.querySelector("img")?.getAttribute("src"), "/api/media/pitching");
  assert.equal(document.toString().includes("That jerk Form Finance"), false);
  assert.equal(document.toString().includes("pp1.jpg"), false);
  assert.equal(document.toString().includes("20 Feb, 2024"), false);
});

test("an empty published list hides the hardcoded footer slots", () => {
  const { document } = parseHTML(`<div class="recent-post-area"><div class="recent-post-items"><h6><a href="/articles">That jerk Form Finance</a></h6></div></div>`);
  applyRecentFooterPosts(document, [post({ slug: "draft", title: "Belum tayang", status: "draft" })]);
  const item = document.querySelector(".recent-post-items") as HTMLElement | null;
  assert.equal(item?.getAttribute("hidden"), "");
  assert.equal(item?.style.display, "none");
});
