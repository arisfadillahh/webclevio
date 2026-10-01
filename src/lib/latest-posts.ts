import type { BlogPost } from "@/types/content";

export interface RecentFooterSlot {
  hidden: boolean;
  href?: string;
  title?: string;
  date?: string;
  image?: string;
}

const MONTHS: Record<string, number> = {
  jan: 0, january: 0, januari: 0,
  feb: 1, february: 1, februari: 1,
  mar: 2, march: 2, maret: 2,
  apr: 3, april: 3,
  may: 4, mei: 4,
  jun: 5, june: 5, juni: 5,
  jul: 6, july: 6, juli: 6,
  aug: 7, august: 7, agu: 7, agustus: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9, okt: 9, oktober: 9,
  nov: 10, november: 10,
  dec: 11, december: 11, des: 11, desember: 11,
};

function publishedTimestamp(post: BlogPost) {
  const parsed = Date.parse(post.publishedAt ?? "");
  if (!Number.isNaN(parsed)) return parsed;
  const match = post.date.trim().match(/(\d{1,2})\s+([A-Za-z]+)\.?,?\s+(\d{4})/);
  if (!match) return null;
  const month = MONTHS[match[2].toLowerCase()];
  if (month === undefined) return null;
  return Date.UTC(Number(match[3]), month, Number(match[1]));
}

export function latestPublishedPosts(posts: BlogPost[], limit = 2) {
  const published = posts
    .map((post, index) => ({ post, index }))
    .filter(({ post }) => post.status === "published" && post.slug.trim().length > 0 && post.title.trim().length > 0);

  published.sort((left, right) => {
    const leftTime = publishedTimestamp(left.post);
    const rightTime = publishedTimestamp(right.post);
    if (leftTime !== null && rightTime !== null && leftTime !== rightTime) return rightTime - leftTime;
    if (leftTime !== null && rightTime === null) return -1;
    if (leftTime === null && rightTime !== null) return 1;
    return left.index - right.index;
  });

  return published.slice(0, Math.max(0, limit)).map(({ post }) => post);
}

export function recentFooterSlots(posts: BlogPost[], slotCount: number): RecentFooterSlot[] {
  const latest = latestPublishedPosts(posts, slotCount);
  return Array.from({ length: slotCount }, (_, index) => {
    const post = latest[index];
    if (!post) return { hidden: true };
    return {
      hidden: false,
      href: `/articles/${encodeURIComponent(post.slug)}`,
      title: post.title,
      date: post.date,
      image: post.image,
    };
  });
}

export function applyRecentFooterPosts(root: ParentNode, posts: BlogPost[]) {
  const items = Array.from(root.querySelectorAll<HTMLElement>(".recent-post-area .recent-post-items"));
  const slots = recentFooterSlots(posts, items.length);

  items.forEach((item, index) => {
    const slot = slots[index];
    if (!slot || slot.hidden) {
      item.setAttribute("hidden", "");
      item.style.display = "none";
      return;
    }

    item.removeAttribute("hidden");
    item.style.removeProperty("display");

    const image = item.querySelector("img");
    if (image) {
      image.setAttribute("src", slot.image || "");
      image.setAttribute("alt", slot.title || "");
    }

    const date = item.querySelector(".post-date li");
    if (date && slot.date) {
      const icon = date.querySelector("i");
      date.textContent = "";
      if (icon) date.append(icon);
      date.append(` ${slot.date}`);
    }

    const link = item.querySelector("h6 a");
    if (link) {
      if (slot.href) link.setAttribute("href", slot.href);
      link.textContent = slot.title ?? "";
    }
  });
}
