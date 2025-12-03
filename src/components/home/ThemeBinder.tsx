'use client';

import { useEffect } from "react";
import type {
  SiteContent,
  Program,
  Testimonial,
  BlogPost,
  HeroDecoration,
} from "@/types/content";

const HERO_DECOR_SELECTORS: Record<string, string> = {
  bottom: ".hero-section .bottom-shape img",
  parasuit: ".hero-section .parasuit-shape img",
  left: ".hero-section .left-shape img",
  book: ".hero-section .book-shape img",
  pencil: ".hero-section .pencil-shape img",
  bee: ".hero-section .bee-shape img",
  right: ".hero-section .right-shape img",
  star: ".hero-section .star-shape img",
};

const DEFAULT_ROOT_ID = "clevio-template-root";

interface Props {
  content: SiteContent;
  rootId?: string;
}

export default function ThemeBinder({ content, rootId = DEFAULT_ROOT_ID }: Props) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const cleanups: Array<() => void> = [];
    const preloaderCleanup = bindPreloader(root, rootId === DEFAULT_ROOT_ID);
    if (preloaderCleanup) cleanups.push(preloaderCleanup);

    bindHeader(root, content);
    bindHero(root, content);
    bindAbout(root, content);
    bindPrograms(root, content);
    bindWorkProcess(root, content.benefits.items);
    bindActivities(root, content.activities, content.activitiesDecorations);
    bindTestimonials(root, content.testimonials, content);
    bindPartners(root, content.partners);
    bindCta(root, content.callToAction);
    bindNews(root, content.blog);
    bindNewsletter(root, content.newsletter);
    bindInstructors(root, content.instructors, content);
    bindInstagram(root, content.instagram);
    bindFooter(root, content);
    const smoothScrollCleanup = enableSmoothScroll(root);
    if (smoothScrollCleanup) cleanups.push(smoothScrollCleanup);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [content, rootId]);

  return null;
}

function bindPreloader(root: HTMLElement, attachWindowEvents: boolean) {
  const container = root.querySelector(".txt-loading");
  if (container) {
    container.innerHTML = `<span class="letters-loading" data-text-preloader="Clevio Innovator Camp">Clevio Innovator Camp</span>`;
  }
  const loaderText = root.querySelector("#preloader .text-center");
  if (loaderText) loaderText.textContent = "Loading Clevio";

  const hide = () => {
    const preloader = root.querySelector<HTMLElement>("#preloader");
    if (!preloader) return;
    preloader.classList.add("loaded");
    setTimeout(() => {
      preloader.style.display = "none";
    }, 400);
  };

  hide();
  if (attachWindowEvents) {
    window.addEventListener("load", hide);
    return () => window.removeEventListener("load", hide);
  }
  return undefined;
}

function bindHeader(root: HTMLElement, content: SiteContent) {
  const logos = root.querySelectorAll(".header-left .logo img, .header-logo img, .offcanvas__logo img");
  logos.forEach((logo) => {
    (logo as HTMLImageElement).src = content.branding.logo;
    (logo as HTMLImageElement).alt = content.branding.name;
  });

  const navList = root.querySelector(".main-menu nav ul");
  if (navList) {
    navList.innerHTML = content.navigation.menu
      .map(
        (item) => `
        <li>
          <a href="${item.href}">${item.label}</a>
        </li>
      `,
      )
      .join("");
  }

  const headerBtnSpans = root.querySelectorAll(".header-main .header-button .theme-btn span");
  headerBtnSpans.forEach((btn) => {
    btn.innerHTML = `${content.branding.ctaLabel}<i class="fa-solid fa-arrow-right-long"></i>`;
  });
  const headerLinks = root.querySelectorAll(".header-main .header-button .theme-btn");
  headerLinks.forEach((link) => {
    (link as HTMLAnchorElement).href = content.branding.ctaLink;
  });
  const offcanvasButtons = root.querySelectorAll(".offcanvas__contact .header-button .theme-btn");
  offcanvasButtons.forEach((btn) => {
    btn.innerHTML = `<span>${content.branding.ctaLabel}<i class="fa-solid fa-arrow-right-long"></i></span>`;
    (btn as HTMLAnchorElement).href = content.branding.ctaLink;
  });

  const offcanvasContact = root.querySelectorAll(".offcanvas__contact ul li");
  if (offcanvasContact[0]) {
    offcanvasContact[0].innerHTML = `<div class="offcanvas__contact-icon"><i class="fal fa-map-marker-alt"></i></div><div class="offcanvas__contact-text"><a href="#">${content.branding.address}</a></div>`;
  }
  if (offcanvasContact[1]) {
    offcanvasContact[1].innerHTML = `<div class="offcanvas__contact-icon"><i class="fal fa-envelope"></i></div><div class="offcanvas__contact-text"><a href="mailto:${content.branding.email}">${content.branding.email}</a></div>`;
  }
  if (offcanvasContact[2]) {
    offcanvasContact[2].innerHTML = `<div class="offcanvas__contact-icon"><i class="fal fa-clock"></i></div><div class="offcanvas__contact-text"><a href="#">Sen-Jum, 07.00-17.00</a></div>`;
  }
  if (offcanvasContact[3]) {
    const phoneItem = offcanvasContact[3];
    phoneItem.parentElement?.removeChild(phoneItem);
  }

  const topContacts = root.querySelectorAll(".header-top-section .contact-list li");
  if (topContacts[0]) {
    topContacts[0].innerHTML = `<i class="fal fa-map-marker-alt"></i>${content.branding.address}`;
  }
  if (topContacts[1]) {
    topContacts[1].innerHTML = `<i class="far fa-envelope"></i><a href="mailto:${content.branding.email}" class="link">${content.branding.email}</a>`;
  }

  const socialLinks = content.branding.socials
    .map(
      (social) =>
        `<a href="${social.href}" target="_blank" rel="noreferrer" aria-label="${social.label}"><i class="fab fa-${social.icon}"></i></a>`,
    )
    .join("");
  const topSocial = root.querySelector(".header-top-section .social-icon");
  if (topSocial) {
    topSocial.innerHTML = `<span>Follow Us On:</span>${socialLinks}`;
  }
  const drawerSocial = root.querySelector(".offcanvas__contact .social-icon");
  if (drawerSocial) {
    drawerSocial.innerHTML = socialLinks;
  }
}

function bindHero(root: HTMLElement, content: SiteContent) {
  const section = root.querySelector(".hero-section .hero-content");
  if (!section) return;
  const eyebrow = section.querySelector("h5");
  const title = section.querySelector("h1");
  const desc = section.querySelector("p");
  if (eyebrow) eyebrow.textContent = content.hero.eyebrow;
  if (title) title.innerHTML = content.hero.title;
  if (desc) desc.textContent = content.hero.description;

  const primaryCta = section.querySelector(".theme-btn") as HTMLAnchorElement | null;
  if (primaryCta) {
    primaryCta.href = content.hero.primaryCta.href;
    primaryCta.innerHTML = `${content.hero.primaryCta.label} <i class="fa-solid fa-arrow-right-long"></i>`;
  }
  const videoLink = section.querySelector(".video-btn") as HTMLAnchorElement | null;
  if (videoLink) videoLink.href = content.hero.media.videoUrl;

  const heroImg = root.querySelector(".hero-image img") as HTMLImageElement | null;
  if (heroImg) heroImg.src = content.hero.media.image;
  const heroShape = root.querySelector(".hero-image .hero-shape img") as HTMLImageElement | null;
  if (heroShape) heroShape.src = content.hero.media.shape;

  const heroRow = root.querySelector(".hero-section.hero-1 .row");
  if (heroRow) heroRow.classList.add("align-items-end");

  const heroCol = root.querySelector(".hero-section.hero-1 .col-lg-6:first-child .hero-content");
  if (heroCol) heroCol.classList.add("d-flex", "flex-column", "justify-content-end", "pb-5");

  bindHeroDecorations(root, content.hero.decorations);
}

function bindHeroDecorations(root: HTMLElement, decorations: HeroDecoration[]) {
  decorations.forEach((decor) => {
    const selector = HERO_DECOR_SELECTORS[decor.id];
    if (!selector) return;
    const img = root.querySelector(selector) as HTMLImageElement | null;
    if (img) img.src = decor.image;
  });
}

function bindAbout(root: HTMLElement, content: SiteContent) {
  const imagePrimary = root.querySelector(".about-image img") as HTMLImageElement | null;
  if (imagePrimary) imagePrimary.src = content.about.images.primary;
  const imageSecondary = root.querySelector(".about-image-2 img") as HTMLImageElement | null;
  if (imageSecondary) imageSecondary.src = content.about.images.secondary;

  const section = root.querySelector(".about-content");
  if (!section) return;
  const eyebrow = section.querySelector(".section-title span");
  const title = section.querySelector(".section-title h2");
  const desc = section.querySelector("p");
  if (eyebrow) eyebrow.textContent = content.about.tagline;
  if (title) title.textContent = content.about.title;
  if (desc) desc.textContent = content.about.text;

  const listWrapper = section.querySelector(".about-list");
  if (listWrapper) {
    const columns: string[][] = [[], []];
    content.about.bullets.forEach((bullet, index) => {
      columns[index % 2].push(bullet);
    });
    listWrapper.innerHTML = columns
      .map(
        (items, columnIndex) => `
        <ul class="wow fadeInUp" data-wow-delay=".${columnIndex === 0 ? 3 : 5}s">
          ${items
            .map(
              (item) => `
            <li>
              <i class="fa-regular fa-circle-check"></i>
              ${item}
            </li>
          `,
            )
            .join("")}
        </ul>
      `,
      )
      .join("");
  }

  const aboutButton = section.querySelector(".about-button .theme-btn") as HTMLAnchorElement | null;
  if (aboutButton) {
    const href = content.about.ctaLink || content.branding.ctaLink;
    const label = content.about.ctaLabel || content.branding.ctaLabel;
    aboutButton.href = href;
    aboutButton.innerHTML = `${label} <i class="fa-solid fa-arrow-right-long"></i>`;
  }
  const phoneLink = section.querySelector(".author-icon h5 a") as HTMLAnchorElement | null;
  if (phoneLink) {
    const phone = content.about.phone || content.contact.whatsapp;
    const telValue = phone.replace(/[^+\d]/g, "") || phone;
    phoneLink.textContent = phone;
    phoneLink.href = `tel:${telValue}`;
  }
}

function bindPrograms(root: HTMLElement, content: SiteContent) {
  const decorations = content.programDecorations;
  const topShape = root.querySelector(".program-section .top-shape img") as HTMLImageElement | null;
  if (topShape && decorations?.topShape) topShape.src = decorations.topShape;
  const bottomShape = root.querySelector(".program-section .bottom-shape img") as HTMLImageElement | null;
  if (bottomShape && decorations?.bottomShape) bottomShape.src = decorations.bottomShape;
  const maskShape = root.querySelector(".program-section .mask-shape img") as HTMLImageElement | null;
  if (maskShape && decorations?.mask) maskShape.src = decorations.mask;
  const maskShape2 = root.querySelector(".program-section .mask-shape-2 img") as HTMLImageElement | null;
  if (maskShape2 && decorations?.mask2) maskShape2.src = decorations.mask2;
  const pencilShape = root.querySelector(".program-section .pencil-shape img") as HTMLImageElement | null;
  if (pencilShape && decorations?.pencil) pencilShape.src = decorations.pencil;
  const compassShape = root.querySelector(".program-section .compass-shape img") as HTMLImageElement | null;
  if (compassShape && decorations?.compass) compassShape.src = decorations.compass;

  const section = root.querySelector(".program-section .section-title");
  if (section) {
    const tagline = section.querySelector("span");
    const heading = section.querySelector("h2");
    if (tagline) tagline.textContent = content.programsSection.tagline;
    if (heading) heading.innerHTML = content.programsSection.title.replace(/\n/g, "<br>");
  }

  const programs = content.programs;
  const wrapper = root.querySelector(".program-section .row");
  if (!wrapper) return;
  wrapper.innerHTML = programs
    .map(
      (program, index) => `
      <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="${0.3 + index * 0.2}s">
        <div class="program-box-items">
          <div class="program-bg ${index === 1 ? "bg-2" : index === 2 ? "bg-3" : ""}"></div>
          <div class="program-image">
            <img src="${program.image}" alt="${program.title}">
          </div>
          <div class="program-content text-center ${index === 2 ? "style-2" : ""}">
            <h4><a href="#programs">${program.title}</a></h4>
            <span>${program.ageRange}</span>
            <p>${program.description}</p>
            <a href="#programs" class="arrow-icon ${index === 1 ? "color-2" : ""}">
              <i class="fa-solid fa-arrow-right-long"></i>
            </a>
          </div>
        </div>
      </div>
    `,
    )
    .join("");
}

function bindWorkProcess(root: HTMLElement, items: Props["content"]["benefits"]["items"]) {
  const wrapper = root.querySelector(".work-process-section .row");
  if (!wrapper) return;
  wrapper.innerHTML = items
    .map(
      (item, index) => {
        const isLast = index === items.length - 1;
        const isZigzag = index % 2 === 1;
        const lineClass = isZigzag ? "line-shape-2" : "line-shape";
        const lineImg = isZigzag ? "line-2.png" : "line.png";
        const itemStyle = isZigzag || isLast ? "style-2" : "";
        const iconClass = item.icon || `icon-icon-${(index % 4) + 1}`;
        const isImageIcon =
          !!item.icon &&
          (item.icon.startsWith("http") ||
            item.icon.startsWith("/") ||
            /\.(png|jpe?g|gif|svg|webp)$/i.test(item.icon));

        const lineMarkup = isLast
          ? ""
          : `
            <div class="${lineClass}">
              <img src="/assets/img/process/${lineImg}" alt="shape">
            </div>`;

        const contentMarkup = `
          <div class="content">
            <h4>${item.title}</h4>
            <p>${item.description}</p>
          </div>`;

        const iconMarkup = isImageIcon
          ? `
          <div class="icon icon-uploaded">
            <img src="${item.icon}" alt="${item.title} icon" />
          </div>`
          : `
          <div class="icon bg-cover" style="background-image: url('/assets/img/process/icon-bg.png');">
            <i class="${iconClass}"></i>
          </div>`;

        const body = `${lineMarkup}${iconMarkup}${contentMarkup}`;

        return `
        <div class="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="${0.3 + index * 0.2}s">
          <div class="work-process-items text-center ${itemStyle}">
            ${body}
          </div>
        </div>`;
      },
    )
    .join("");
}

function bindActivities(
  root: HTMLElement,
  activities: Props["content"]["activities"],
  decorations: SiteContent["activitiesDecorations"],
) {
  const pencilShape = root.querySelector(".about-activities-section .pencil-shape img") as HTMLImageElement | null;
  if (pencilShape && decorations?.pencil) {
    pencilShape.src = decorations.pencil;
  }
  const giraffeShape = root.querySelector(".about-activities-section .zebra-shape img") as HTMLImageElement | null;
  if (giraffeShape && decorations?.giraffe) {
    giraffeShape.src = decorations.giraffe;
  }
  const radiusShape = root.querySelector(".about-activities-section .radius-shape img") as HTMLImageElement | null;
  if (radiusShape && decorations?.radius) {
    radiusShape.src = decorations.radius;
  }

  const section = root.querySelector(".about-activities-section");
  if (section) {
    const eyebrow = section.querySelector(".section-title span");
    const title = section.querySelector(".section-title h2");
    if (eyebrow) eyebrow.textContent = activities.tagline;
    if (title) title.textContent = activities.title;
  }

  const activitiesImage = root.querySelector(".activities-image img") as HTMLImageElement | null;
  if (activitiesImage) activitiesImage.src = activities.image;

  const wrapper = root.querySelector(".about-activities-section .row.g-4.mt-4");
  if (!wrapper) return;
  wrapper.innerHTML = activities.items
    .map(
      (item, index) => {
        const iconClass = item.icon || `icon-icon-${(index % 8) + 1}`;
        return `
      <div class="col-xl-6 col-lg-8 col-md-6 wow fadeInUp" data-wow-delay="${0.3 + index * 0.2}s">
        <div class="icon-items">
          <div class="icon box-color-${(index % 4) + 1}">
            <i class="${iconClass}"></i>
          </div>
          <div class="content">
            <h5>${item.title}</h5>
            <p>${item.description}</p>
          </div>
        </div>
      </div>
    `;
      },
    )
    .join("");
}

function bindTestimonials(root: HTMLElement, testimonials: Testimonial[], content: SiteContent) {
  const sectionContent = content.testimonialsSection ?? { tagline: "", title: "" };
  const sectionTitle = root.querySelector(".testimonial-section .section-title");
  if (sectionTitle) {
    const eyebrow = sectionTitle.querySelector("span");
    const title = sectionTitle.querySelector("h2");
    if (eyebrow) eyebrow.textContent = sectionContent.tagline;
    if (title) title.innerHTML = sectionContent.title.replace(/\n/g, "<br>");
  }

  const slider = root.querySelector(".testimonial-section .swiper-wrapper");
  if (!slider) return;
  slider.innerHTML = testimonials
    .map(
      (testi, index) => `
      <div class="swiper-slide">
        <div class="testimonial-items ${index === 1 ? "style-2" : index === 2 ? "style-3" : ""}">
          <div class="icon">
            <img src="/assets/img/quote${index === 1 ? "-2" : index === 2 ? "-3" : ""}.png" alt="quote">
          </div>
          <div class="testimonial-bg ${index === 1 ? "bg-2" : index === 2 ? "bg-3" : ""}"></div>
          <div class="testimonial-content">
            <p>${testi.message}</p>
            <h6>${testi.name}</h6>
            <span>${testi.role}</span>
          </div>
        </div>
      </div>
    `,
    )
    .join("");
}

function bindCta(root: HTMLElement, cta: Props["content"]["callToAction"]) {
  const ctaSection = root.querySelector(".cta-section .section-title");
  if (ctaSection) {
    const eyebrow = ctaSection.querySelector("span");
    const title = ctaSection.querySelector("h2");
    if (eyebrow) eyebrow.textContent = cta.eyebrow;
    if (title) title.innerHTML = cta.title;
    let desc = ctaSection.querySelector(".cta-text");
    if (!desc) {
      desc = document.createElement("p");
      desc.className = "text-white wow fadeInUp cta-text";
      desc.setAttribute("data-wow-delay", ".35s");
      ctaSection.appendChild(desc);
    }
    desc.textContent = cta.text;
  }
  const button = root.querySelector(".cta-section .theme-btn") as HTMLAnchorElement | null;
  if (button) {
    button.href = cta.button.href;
    button.innerHTML = `${cta.button.label} <i class="fa-solid fa-arrow-right-long"></i>`;
  }
  const ctaImage = root.querySelector(".cta-section .cta-image img") as HTMLImageElement | null;
  if (ctaImage) ctaImage.src = cta.image;

  const mainCta = root.querySelector(".main-cta-section .section-title");
  if (mainCta) {
    const mainEyebrow = mainCta.querySelector("span");
    const mainTitle = mainCta.querySelector("h2");
    if (mainEyebrow) mainEyebrow.textContent = cta.eyebrow;
    if (mainTitle) mainTitle.textContent = cta.title;
  }
}

function bindNews(root: HTMLElement, blog: Props["content"]["blog"]) {
  const sectionTitle = root.querySelector(".news-section .section-title");
  if (sectionTitle) {
    const eyebrow = sectionTitle.querySelector("span");
    const title = sectionTitle.querySelector("h2");
    if (eyebrow) eyebrow.textContent = blog.tagline;
    if (title) title.innerHTML = blog.title;
  }

  const posts: BlogPost[] = blog.posts;
  if (posts.length === 0) return;
  const featured = root.querySelector(".news-single-items");
  if (featured) {
    const primary = posts[0];
    const image = featured.querySelector(".news-image img") as HTMLImageElement | null;
    if (image) image.src = primary.image;
    const list = featured.querySelector(".news-content ul");
    if (list) {
      list.innerHTML = `
        <li><i class="fas fa-tag"></i>${primary.author}</li>
        <li><i class="fa-solid fa-calendar-days"></i>${primary.date}</li>
      `;
    }
    const title = featured.querySelector(".news-content h3");
    if (title) title.textContent = primary.title;
    const excerpt = featured.querySelector(".news-content p");
    if (excerpt) excerpt.textContent = primary.excerpt;
    const authorName = featured.querySelector(".post-author-items h6");
    if (authorName) authorName.textContent = primary.author;
  }

  const rightWrapper = root.querySelector(".news-section .col-xl-6.mt-5");
  if (rightWrapper) {
    rightWrapper.innerHTML = posts
      .slice(1)
      .map(
        (post, index) => `
        <div class="news-right-items wow fadeInUp" data-wow-delay="${0.4 + index * 0.2}s">
          <div class="news-thumb">
            <img src="${post.image}" alt="${post.title}">
          </div>
          <div class="news-content">
            <ul>
              <li><i class="fas fa-tag"></i>${post.author}</li>
              <li><i class="fa-solid fa-calendar-days"></i>${post.date}</li>
            </ul>
            <h3>${post.title}</h3>
            <div class="post-items">
              <div class="thumb">
                <img src="/assets/img/news/author.png" alt="author">
              </div>
              <div class="content">
                <span>By Admin</span>
                <h6>${post.author}</h6>
              </div>
            </div>
          </div>
        </div>
      `,
      )
      .join("");
  }
}

function bindNewsletter(root: HTMLElement, newsletter: Props["content"]["newsletter"]) {
  const section = root.querySelector(".main-cta-section .section-title");
  if (section) {
    const eyebrow = section.querySelector("span");
    const title = section.querySelector("h2");
    if (eyebrow) eyebrow.textContent = newsletter.eyebrow;
    if (title) title.textContent = newsletter.title;
  }
  const button = root.querySelector(".main-cta-section .theme-btn span");
  if (button) button.textContent = newsletter.buttonLabel;
}

function bindInstructors(root: HTMLElement, instructors: Props["content"]["instructors"], content: SiteContent) {
  const wrapper = root.querySelector(".team-grid[data-team-grid]");
  if (!wrapper) return;

  const loveShape = root.querySelector(".team-section .love-shape img") as HTMLImageElement | null;
  if (loveShape) loveShape.src = content.instructorsDecorations.loveShape;
  const frameShape = root.querySelector(".team-section .frame-shape img") as HTMLImageElement | null;
  if (frameShape) frameShape.src = content.instructorsDecorations.frameShape;

  wrapper.innerHTML = instructors
    .map(
      (instructor) => `
      <div class="team-items">
        <div class="team-image">
          <img src="${instructor.avatar}" alt="${instructor.name}">
          <div class="social-profile">
            <span class="plus-btn"><i class="fas fa-share-alt"></i></span>
            <ul>
              ${instructor.socials
                .map(
                  (social) =>
                    `<li><a href="${social.href}" target="_blank" rel="noreferrer"><i class="fab fa-${social.icon}"></i></a></li>`,
                )
                .join("")}
            </ul>
          </div>
        </div>
        <div class="team-content">
          <h3><a href="#instructors">${instructor.name}</a></h3>
          <p>${instructor.role}</p>
        </div>
      </div>
    `,
    )
    .join("");
}

function bindInstagram(root: HTMLElement, items: Props["content"]["instagram"]) {
  const wrapper = root.querySelector(".instagram-grid[data-instagram-grid]");
  if (!wrapper) return;
  wrapper.innerHTML = items
    .map(
      (item) => `
      <div class="instagram-banner-items">
        <div class="banner-image">
          <img src="${item.image}" alt="instagram">
          <a href="${item.link}" target="_blank" rel="noreferrer" class="icon">
            <i class="fa-brands fa-instagram"></i>
          </a>
        </div>
      </div>
    `,
    )
    .join("");
}

function bindFooter(root: HTMLElement, content: SiteContent) {
  const contact = root.querySelector(".footer-widget .footer-contact");
  if (contact) {
    contact.innerHTML = `
      <li><i class="fa-solid fa-phone"></i>${content.contact.whatsapp}</li>
      <li><i class="fa-solid fa-envelope"></i>${content.contact.email}</li>
      <li><i class="fa-solid fa-location-dot"></i>${content.contact.address}</li>
    `;
  }

  const footerText = root.querySelector(".footer-bottom p");
  if (footerText) footerText.textContent = content.footer.text;
}

function bindPartners(root: HTMLElement, partners: SiteContent["partners"]) {
  if (!partners || partners.length === 0) return;
  const marquee = root.querySelector(".partner-track[data-partner-track]");
  if (!marquee) return;
  const logos = partners
    .map(
      (partner) => `
    <div class="partner-logo">
      <img src="${partner.logo}" alt="partner logo">
    </div>`,
    )
    .join("");
  marquee.innerHTML = `${logos}${logos}`;
}

function enableSmoothScroll(root: HTMLElement) {
  const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  if (anchors.length === 0) return undefined;

  const handler = (event: Event) => {
    const anchor = event.currentTarget as HTMLAnchorElement | null;
    if (!anchor) return;
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;
    const target =
      document.querySelector(targetId) ||
      root.querySelector(`[data-preview="${targetId.replace("#", "")}"]`);
    if (!target) return;
    event.preventDefault();
    if (targetId === "#hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  anchors.forEach((a) => a.addEventListener("click", handler));

  return () => anchors.forEach((a) => a.removeEventListener("click", handler));
}
