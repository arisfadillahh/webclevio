'use client';

/* Legacy helper bindings remain available for older template integrations. */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect } from "react";
import type {
  SiteContent,
  Testimonial,
  BlogPost,
  HeroDecoration,
} from "@/types/content";
import { bindTemplate, DEFAULT_ROOT_ID } from "@/lib/themeBinding";

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


interface Props {
  content: SiteContent;
  rootId?: string;
}

export default function ThemeBinder({ content, rootId = DEFAULT_ROOT_ID }: Props) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const cleanups = bindTemplate(root, content, {
      attachWindowEvents: true,
      enableSmoothScroll: true,
      rootId,
      documentRef: document,
    });

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
  const logoLoadCleanups: Array<() => void> = [];
  const logos = root.querySelectorAll(".header-left .logo img, .header-logo img, .offcanvas__logo img");
  logos.forEach((logo) => {
    const image = logo as HTMLImageElement;
    image.src = content.branding.logo;
    image.alt = content.branding.name;
    const syncLogoCanvas = () => {
      const holder = image.closest(".header-logo");
      if (!holder || !image.naturalWidth || !image.naturalHeight) return;
      holder.classList.toggle("has-padded-logo", image.naturalWidth / image.naturalHeight < 2.4);
    };
    image.addEventListener("load", syncLogoCanvas);
    logoLoadCleanups.push(() => image.removeEventListener("load", syncLogoCanvas));
    if (image.complete) syncLogoCanvas();
  });

  const navList = root.querySelector(".main-menu nav ul");
  if (navList) {
    navList.innerHTML = content.navigation.menu
      .map(
        (item, index) => `
        <li${index === 0 ? ' class="active"' : ""}>
          <a href="${escapeMarkup(item.href)}">${escapeMarkup(item.label)}</a>
        </li>
      `,
      )
      .join("");
  }

  const headerBtnSpans = root.querySelectorAll(".header-main .header-button .theme-btn span");
  headerBtnSpans.forEach((btn) => {
    btn.innerHTML = `<i class="fa-solid fa-graduation-cap" aria-hidden="true"></i><b>${escapeMarkup(content.branding.ctaLabel)}</b><i class="fa-solid fa-arrow-right-long" aria-hidden="true"></i>`;
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

  const navLinks = Array.from(
    root.querySelectorAll<HTMLAnchorElement>(".main-menu nav > ul > li > a"),
  );
  const setActiveLink = (activeLink: HTMLAnchorElement) => {
    navLinks.forEach((link) => link.parentElement?.classList.toggle("active", link === activeLink));
  };
    const clickHandlers = navLinks.map((link) => {
      const handler = () => setActiveLink(link);
      link.addEventListener("click", handler);
      return { link, handler };
    });

    const mobileMenuClickHandler = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>(".offcanvas__info .mobile-menu a");
      if (!link || !root.contains(link)) return;

      root.querySelector(".offcanvas__info")?.classList.remove("info-open");
      root.querySelector(".offcanvas__overlay")?.classList.remove("overlay-open");

      const matchingDesktopLink = navLinks.find(
        (navLink) => navLink.getAttribute("href") === link.getAttribute("href"),
      );
      if (matchingDesktopLink) setActiveLink(matchingDesktopLink);
    };
    root.addEventListener("click", mobileMenuClickHandler);

  const observedLinks = navLinks
    .map((link) => {
      const href = link.getAttribute("href") ?? "";
      if (!href.startsWith("#") || href.length < 2) return null;
      const section = root.querySelector<HTMLElement>(href);
      return section ? { link, section } : null;
    })
    .filter((item): item is { link: HTMLAnchorElement; section: HTMLElement } => Boolean(item));

  const observer =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          (entries) => {
            const visibleEntry = entries
              .filter((entry) => entry.isIntersecting)
              .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            const match = observedLinks.find((item) => item.section === visibleEntry?.target);
            if (match) setActiveLink(match.link);
          },
          { rootMargin: "-28% 0px -62%", threshold: [0, 0.1, 0.3] },
        )
      : null;
  observedLinks.forEach(({ section }) => observer?.observe(section));

  return () => {
      logoLoadCleanups.forEach((cleanup) => cleanup());
      clickHandlers.forEach(({ link, handler }) => link.removeEventListener("click", handler));
      root.removeEventListener("click", mobileMenuClickHandler);
      observer?.disconnect();
    };
}

function bindHero(root: HTMLElement, content: SiteContent) {
  const section = root.querySelector(".hero-section .hero-content");
  if (!section) return;
  const eyebrow = section.querySelector("h5");
  const title = section.querySelector("h1");
  const desc = section.querySelector("p");
  if (eyebrow) {
    const eyebrowLabel = eyebrow.querySelector("[data-hero-eyebrow]");
    if (eyebrowLabel) eyebrowLabel.textContent = content.hero.eyebrow;
    else eyebrow.textContent = content.hero.eyebrow;
  }
  if (title) title.innerHTML = content.hero.title;
  if (desc) desc.textContent = content.hero.description;

  const primaryCta = section.querySelector(".theme-btn") as HTMLAnchorElement | null;
  if (primaryCta) {
    primaryCta.href = content.hero.primaryCta.href;
    primaryCta.innerHTML = `${content.hero.primaryCta.label} <i class="fa-solid fa-arrow-right-long"></i>`;
  }
  const secondaryLink = section.querySelector(".hero-secondary-link") as HTMLAnchorElement | null;
  if (secondaryLink) {
    const videoUrl = content.hero.media.videoUrl?.trim();
    secondaryLink.href = videoUrl || content.hero.secondaryCta.href;
    secondaryLink.classList.toggle("video-popup", Boolean(videoUrl));
    secondaryLink.setAttribute(
      "aria-label",
      videoUrl ? `Putar video ${content.hero.secondaryCta.label}` : content.hero.secondaryCta.label,
    );
  }
  const secondaryLabel = section.querySelector(".hero-secondary-label");
  if (secondaryLabel) secondaryLabel.textContent = content.hero.secondaryCta.label;

  const heroImg = root.querySelector(".hero-image img") as HTMLImageElement | null;
  if (heroImg) {
    heroImg.src = content.hero.media.image;
    heroImg.alt = "Anak berkreasi dengan teknologi bersama Clevio";
  }
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
              <i class="fa-solid fa-code-branch"></i>
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
            <img src="${escapeMarkup(program.image)}" alt="Level ${escapeMarkup(program.title)}">
          </div>
          <div class="program-content text-center ${index === 2 ? "style-2" : ""}">
            <h4>${escapeMarkup(program.title)}</h4>
            <span>${escapeMarkup(program.ageRange)}</span>
            <p>${escapeMarkup(program.description)}</p>
            <button type="button" class="program-detail-trigger" data-program-open="${index}" aria-label="Lihat detail level ${escapeMarkup(program.title)}" aria-haspopup="dialog">
              <span>Lihat detail level</span>
              <i class="fa-solid fa-arrow-right-long"></i>
            </button>
          </div>
        </div>
      </div>
    `,
    )
    .join("");

  const dialog = root.querySelector<HTMLElement>("[data-program-dialog]");
  const panel = dialog?.querySelector<HTMLElement>(".program-detail-panel");
  if (!dialog || !panel) return;

  const detailImage = dialog.querySelector<HTMLImageElement>("[data-program-detail-image]");
  const detailAge = dialog.querySelector<HTMLElement>("[data-program-detail-age]");
  const detailTitle = dialog.querySelector<HTMLElement>("[data-program-detail-title]");
  const detailTagline = dialog.querySelector<HTMLElement>("[data-program-detail-tagline]");
  const detailDescription = dialog.querySelector<HTMLElement>("[data-program-detail-description]");
  const benefitsList = dialog.querySelector<HTMLElement>("[data-program-learning]");
  const projectsList = dialog.querySelector<HTMLElement>("[data-program-projects]");
  const toolsList = dialog.querySelector<HTMLElement>("[data-program-tools]");
  const trialLink = dialog.querySelector<HTMLAnchorElement>("[data-program-trial-link]");
  const classLink = dialog.querySelector<HTMLAnchorElement>("[data-program-class-link]");
  const openButtons = Array.from(wrapper.querySelectorAll<HTMLButtonElement>("[data-program-open]"));
  const closeButtons = Array.from(dialog.querySelectorAll<HTMLButtonElement>("[data-program-close]"));
  let previousFocus: HTMLElement | null = null;

  const programTaglines: Record<string, string> = {
    explorer: "Belajar sambil bermain, eksplorasi tanpa batas!",
    creator: "Ubah ide menjadi game, aplikasi, dan karya digital.",
    innovator: "Bangun produk digital, website, dan solusi AI nyata.",
  };

  const suitabilityMeta: Record<string, string[]> = {
    explorer: ["Pemula", "Suka bermain & bereksplorasi", "Belajar kreatif"],
    creator: ["Sudah mengenal coding dasar", "Suka membuat game & aplikasi", "Siap mengerjakan project"],
    innovator: ["Siap membangun portfolio", "Tertarik software & AI", "Belajar mandiri & kolaboratif"],
  };

  const toolMeta = [
    {
      match: ["scratch"],
      icon: "/assets/img/program/detail/software-scratch.svg",
      description: "Membuat game dan animasi dengan blok interaktif.",
    },
    {
      match: ["code.org", "game lab"],
      icon: "/assets/img/program/detail/software-codeorg.svg",
      description: "Belajar logika game lewat blok dan JavaScript.",
    },
    {
      match: ["minecraft"],
      icon: "/assets/img/program/detail/software-minecraft.svg",
      description: "Membangun dunia 3D sambil belajar coding.",
    },
    {
      match: ["construct"],
      icon: "/assets/img/program/detail/software-construct3.svg",
      description: "Memahami game mechanics lewat project 2D.",
    },
    {
      match: ["canva"],
      icon: "/assets/img/program/detail/software-canva.svg",
      description: "Mendesain visual, poster, dan presentasi digital.",
    },
    {
      match: ["roblox"],
      icon: "/assets/img/program/detail/software-roblox-studio.svg",
      description: "Membangun dunia dan game 3D dengan Luau.",
    },
    {
      match: ["html", "javascript", "css"],
      icon: "/assets/img/program/detail/software-web.svg",
      description: "Membuat website interaktif yang bisa dipublikasikan.",
    },
    {
      match: ["python"],
      icon: "/assets/img/program/detail/software-python.svg",
      description: "Membangun otomasi, data, dan project AI dasar.",
    },
  ];

  const renderProjects = (items: string[]) => {
    if (!projectsList) return;
    projectsList.innerHTML = items
      .filter((item) => item.trim())
      .slice(0, 3)
      .map(
        (item, index) =>
          `<span class="program-detail-project-dot${index === 0 ? " is-active" : ""}" title="${escapeMarkup(item.trim())}" aria-label="${escapeMarkup(item.trim())}"></span>`,
      )
      .join("");
  };

  const renderBenefits = (programTitle: string, items: string[]) => {
    if (!benefitsList) return;
    const fallback = items.filter((item) => item.trim()).slice(0, 3);
    const suitability = suitabilityMeta[programTitle.toLowerCase()] ?? fallback;
    benefitsList.innerHTML = `
      <h4>Cocok untuk <i class="fa-solid fa-sparkles" aria-hidden="true"></i></h4>
      <ul>
        ${suitability
          .map((item) => `<li><i class="fa-solid fa-circle-check"></i><span>${escapeMarkup(item)}</span></li>`)
          .join("")}
      </ul>
    `;
  };

  const renderTools = (items: string[]) => {
    if (!toolsList) return;
    toolsList.innerHTML = items
      .filter((item) => item.trim())
      .slice(0, 3)
      .map((item) => {
        const cleanItem = item.trim();
        const normalized = cleanItem.toLowerCase();
        const meta = toolMeta.find((entry) => entry.match.some((term) => normalized.includes(term)));
        const icon = meta?.icon ?? "/assets/img/program/detail/software-codeorg.svg";
        const description = meta?.description ?? "Membantu anak mengubah ide menjadi karya digital.";
        return `
          <article class="program-detail-tool">
            <span class="program-detail-tool-icon"><img src="${icon}" alt="" aria-hidden="true"></span>
            <span>
              <strong>${escapeMarkup(cleanItem)}</strong>
              <small>${escapeMarkup(description)}</small>
            </span>
          </article>
        `;
      })
      .join("");
  };

  const closeDialog = (restoreFocus = true) => {
    if (dialog.hidden) return;
    dialog.hidden = true;
    dialog.setAttribute("aria-hidden", "true");
    document.body.classList.remove("program-dialog-open");
    if (restoreFocus) previousFocus?.focus();
    previousFocus = null;
  };

  const openDialog = (index: number, trigger: HTMLElement) => {
    const program = programs[index];
    if (!program) return;

    previousFocus = trigger;
    if (detailImage) {
      detailImage.src = program.projectImage || program.image;
      detailImage.alt = `Contoh project level ${program.title}`;
    }
    if (detailAge) detailAge.textContent = program.ageRange;
    if (detailTitle) detailTitle.textContent = program.title;
    if (detailTagline) {
      detailTagline.textContent =
        programTaglines[program.title.toLowerCase()] ?? "Belajar coding lewat project yang seru dan relevan.";
    }
    if (detailDescription) detailDescription.textContent = program.description;
    renderProjects(program.projectExamples ?? []);
    renderBenefits(program.title, program.learningPoints ?? []);
    renderTools(program.tools ?? []);
    if (trialLink) trialLink.href = content.freeTrial.ctaLink;
    if (classLink) classLink.href = content.about.ctaLink || "#contact";

    dialog.hidden = false;
    dialog.setAttribute("aria-hidden", "false");
    document.body.classList.add("program-dialog-open");
    window.requestAnimationFrame(() => panel.focus());
  };

  const openHandlers = openButtons.map((button) => {
    const handler = () => openDialog(Number(button.dataset.programOpen), button);
    button.addEventListener("click", handler);
    return { button, handler };
  });
  const closeHandlers = closeButtons.map((button) => {
    const handler = () => closeDialog();
    button.addEventListener("click", handler);
    return { button, handler };
  });
  const classLinkHandler = () => closeDialog(false);
  classLink?.addEventListener("click", classLinkHandler);
  const keyHandler = (event: KeyboardEvent) => {
    if (dialog.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener("keydown", keyHandler);

  return () => {
    openHandlers.forEach(({ button, handler }) => button.removeEventListener("click", handler));
    closeHandlers.forEach(({ button, handler }) => button.removeEventListener("click", handler));
    classLink?.removeEventListener("click", classLinkHandler);
    document.removeEventListener("keydown", keyHandler);
    closeDialog(false);
  };
}

function bindFreeTrial(root: HTMLElement, freeTrial: Props["content"]["freeTrial"]) {
  const section = root.querySelector<HTMLElement>(".free-trial-section");
  if (!section) return;

  const eyebrow = section.querySelector<HTMLElement>("[data-free-trial-eyebrow]");
  const title = section.querySelector<HTMLElement>("[data-free-trial-title]");
  const highlight = section.querySelector<HTMLElement>("[data-free-trial-highlight]");
  const subtitle = section.querySelector<HTMLElement>("[data-free-trial-subtitle]");
  const description = section.querySelector<HTMLElement>("[data-free-trial-description]");
  const benefits = section.querySelector<HTMLElement>("[data-free-trial-benefits]");
  const link = section.querySelector<HTMLAnchorElement>("[data-free-trial-link]");
  const label = section.querySelector<HTMLElement>("[data-free-trial-label]");
  const note = section.querySelector<HTMLElement>("[data-free-trial-note]");
  const visualImage = section.querySelector<HTMLImageElement>("[data-free-trial-image]");
  const availabilityTitle = section.querySelector<HTMLElement>("[data-free-trial-availability-title]");
  const availabilityText = section.querySelector<HTMLElement>("[data-free-trial-availability-text]");
  const availabilityBadge = section.querySelector<HTMLElement>("[data-free-trial-availability-badge]");
  const trustTitle = section.querySelector<HTMLElement>("[data-free-trial-trust-title]");
  const trustText = section.querySelector<HTMLElement>("[data-free-trial-trust-text]");

  if (eyebrow) eyebrow.textContent = freeTrial.eyebrow;
  if (title) title.textContent = freeTrial.title;
  if (highlight) highlight.textContent = freeTrial.highlight;
  if (subtitle) subtitle.textContent = freeTrial.subtitle;
  if (description) description.textContent = freeTrial.description;
  if (benefits) {
    benefits.innerHTML = freeTrial.benefits
      .filter((item) => item.trim())
      .map((item) => `<li><i class="fa-solid fa-circle-check"></i><span>${escapeMarkup(item.trim())}</span></li>`)
      .join("");
  }
  if (link) link.href = freeTrial.ctaLink;
  if (label) label.textContent = freeTrial.ctaLabel;
  if (note) note.textContent = freeTrial.note;
  if (visualImage) visualImage.src = freeTrial.visualImage;
  if (availabilityTitle) availabilityTitle.textContent = freeTrial.availabilityTitle;
  if (availabilityText) availabilityText.textContent = freeTrial.availabilityText;
  if (availabilityBadge) availabilityBadge.textContent = freeTrial.availabilityBadge;
  if (trustTitle) trustTitle.textContent = freeTrial.trustTitle;
  if (trustText) trustText.textContent = freeTrial.trustText;
}

function bindWorkProcess(root: HTMLElement, sectionContent: Props["content"]["benefits"]) {
  const section = root.querySelector(".work-process-section");
  if (!section) return;

  const tagline = section.querySelector("[data-work-process-tagline]");
  const title = section.querySelector("[data-work-process-title]");
  const description = section.querySelector("[data-work-process-description]");
  if (tagline) tagline.textContent = sectionContent.tagline;
  if (title) title.textContent = sectionContent.title;
  if (description) description.textContent = sectionContent.description;

  const wrapper = section.querySelector(".work-process-grid");
  if (!wrapper) return;
  wrapper.innerHTML = sectionContent.items
    .map(
      (item, index) => {
        const isLast = index === sectionContent.items.length - 1;
        const fallbackIcons = [
          "fa-solid fa-code",
          "fa-solid fa-laptop-code",
          "fa-solid fa-microchip",
          "fa-solid fa-robot",
        ];
        const iconClass = item.icon || fallbackIcons[index % fallbackIcons.length];
        const isImageIcon =
          !!item.icon &&
          (item.icon.startsWith("http") ||
            item.icon.startsWith("/") ||
            /\.(png|jpe?g|gif|svg|webp)$/i.test(item.icon));

        const connectorMarkup = isLast
          ? ""
          : `
            <div class="work-process-connector" aria-hidden="true">
              <svg viewBox="0 0 60 18" focusable="false">
                <path d="M2 9 H54"></path>
                <path d="M47 3 L54 9 L47 15"></path>
              </svg>
            </div>`;

        const contentMarkup = `
          <div class="content">
            <h4>${escapeMarkup(item.title)}</h4>
            <span class="work-process-divider" aria-hidden="true"></span>
            <p>${escapeMarkup(item.description)}</p>
          </div>`;

        const iconMarkup = isImageIcon
          ? `
          <div class="icon icon-uploaded">
            <img src="${escapeMarkup(item.icon)}" alt="Ikon ${escapeMarkup(item.title)}" />
          </div>`
          : `
          <div class="icon">
            <i class="${escapeMarkup(iconClass)}" aria-hidden="true"></i>
          </div>`;

        return `
        <div class="work-process-step work-process-tone-${index % 2 === 0 ? "primary" : "accent"} wow fadeInUp" data-wow-delay="${0.2 + index * 0.12}s">
          <article class="work-process-items text-center">
            <span class="work-process-number">${String(index + 1).padStart(2, "0")}</span>
            ${iconMarkup}
            ${contentMarkup}
          </article>
          ${connectorMarkup}
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
    const description = section.querySelector(".activities-content > p");
    if (eyebrow) eyebrow.textContent = activities.tagline;
    if (title) title.textContent = activities.title;
    if (description) description.textContent = activities.description;
  }

  const activitiesImage = root.querySelector(".activities-image img") as HTMLImageElement | null;
  if (activitiesImage) activitiesImage.src = activities.image;

  const wrapper = root.querySelector(".about-activities-section .row.g-4.mt-4");
  if (!wrapper) return;
  wrapper.innerHTML = activities.items
    .map(
      (item, index) => {
        const fallbackIcons = [
          "fa-solid fa-code",
          "fa-solid fa-microchip",
          "fa-solid fa-robot",
          "fa-solid fa-brain",
        ];
        const iconClass = item.icon || fallbackIcons[index % fallbackIcons.length];
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
  const sectionContent = content.testimonialsSection ?? {
    tagline: "Testimoni Orang Tua",
    title: "Apa Kata Orang Tua Tentang Clevio",
    description: "Cerita nyata tentang anak yang belajar, bertumbuh, dan makin percaya diri bersama Clevio.",
  };
  const eyebrow = root.querySelector(".testimonial-clevio-eyebrow span");
  const title = root.querySelector(".testimonial-clevio-header h2");
  const description = root.querySelector(".testimonial-clevio-description");
  if (eyebrow) eyebrow.textContent = sectionContent.tagline;
  if (title) title.innerHTML = sectionContent.title.replace(/\n/g, "<br>");
  if (description) description.textContent = sectionContent.description;

  const slider = root.querySelector(".testimonial-section .swiper-wrapper");
  if (!slider) return;
  const authorIcons = [
    "fa-regular fa-lightbulb",
    "fa-regular fa-comment-dots",
    "fa-regular fa-file-lines",
  ];
  slider.innerHTML = testimonials
    .map(
      (testi, index) => `
      <div class="swiper-slide">
        <article class="testimonial-items testimonial-clevio-card">
          <span class="testimonial-quote-watermark" aria-hidden="true">“</span>
          <span class="testimonial-quote-badge" aria-hidden="true">“</span>
          <div class="testimonial-content">
            <p>${escapeMarkup(testi.message)}</p>
            <div class="testimonial-author">
              <span class="testimonial-author-icon" aria-hidden="true"><i class="${authorIcons[index % authorIcons.length]}"></i></span>
              <span class="testimonial-author-copy">
                <h6>${escapeMarkup(testi.name)}</h6>
                <span>${escapeMarkup(testi.role)}</span>
              </span>
            </div>
          </div>
        </article>
      </div>
    `,
    )
    .join("");
}

function bindEvents(
  root: HTMLElement,
  sectionContent: SiteContent["eventsSection"],
  events: SiteContent["events"],
) {
  const section = root.querySelector(".home-events-section");
  if (!section) return;

  const tagline = section.querySelector(".home-events-tagline");
  const title = section.querySelector(".home-events-title");
  const description = section.querySelector(".home-events-description");
  if (tagline) tagline.textContent = sectionContent.tagline;
  if (title) title.textContent = sectionContent.title;
  if (description) description.textContent = sectionContent.description;

  const grid = section.querySelector(".home-events-grid");
  if (!grid) return;
  grid.innerHTML = "";

  events
    .filter((event) => event.status === "published")
    .slice(0, 3)
    .forEach((event) => {
      const article = document.createElement("article");
      article.className = "home-event-card wow fadeInUp";

      const mediaLink = document.createElement("a");
      mediaLink.className = "home-event-media";
      mediaLink.href = event.landingPageUrl;
      const image = document.createElement("img");
      image.src = event.image;
      image.alt = event.title;
      mediaLink.appendChild(image);
      const date = document.createElement("span");
      date.className = "home-event-card-date";
      date.textContent = event.date;
      mediaLink.appendChild(date);

      const cardContent = document.createElement("div");
      cardContent.className = "home-event-content";
      const audience = document.createElement("span");
      audience.className = "home-event-audience";
      audience.textContent = event.audience;
      const heading = document.createElement("h3");
      const titleLink = document.createElement("a");
      titleLink.href = event.landingPageUrl;
      titleLink.textContent = event.title;
      heading.appendChild(titleLink);
      const summary = document.createElement("p");
      summary.textContent = event.description;
      const meta = document.createElement("div");
      meta.className = "home-event-meta";
      const time = document.createElement("span");
      time.innerHTML = `<i class="fa-regular fa-clock"></i> ${escapeMarkup(event.time)}`;
      const location = document.createElement("span");
      location.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${escapeMarkup(event.location)}`;
      meta.append(time, location);
      const action = document.createElement("a");
      action.className = "home-event-link";
      action.href = event.landingPageUrl;
      action.innerHTML = `Buka Landing Page <i class="fa-solid fa-arrow-right-long"></i>`;
      cardContent.append(audience, heading, summary, meta, action);
      article.append(mediaLink, cardContent);
      grid.appendChild(article);
    });
}

function bindNews(root: HTMLElement, blog: Props["content"]["blog"]) {
  const sectionTitle = root.querySelector(".news-section .section-title");
  if (sectionTitle) {
    const eyebrow = sectionTitle.querySelector("span");
    const title = sectionTitle.querySelector("h2");
    if (eyebrow) eyebrow.textContent = blog.tagline;
    if (title) title.innerHTML = blog.title;
  }

  const posts: BlogPost[] = blog.posts.filter((post) => post.status === "published");
  if (posts.length === 0) return;
  const allArticlesLink = root.querySelector(".news-section .section-title-area > a") as HTMLAnchorElement | null;
  if (allArticlesLink) allArticlesLink.href = "/articles";
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
    if (title) title.innerHTML = `<a href="/articles/${encodeURIComponent(primary.slug)}">${escapeMarkup(primary.title)}</a>`;
    const excerpt = featured.querySelector(".news-content p");
    if (excerpt) excerpt.textContent = primary.excerpt;
    const authorName = featured.querySelector(".post-author-items h6");
    if (authorName) authorName.textContent = primary.author;
    const readMore = featured.querySelector(".post-author-items > a") as HTMLAnchorElement | null;
    if (readMore) readMore.href = `/articles/${encodeURIComponent(primary.slug)}`;
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
            <h3><a href="/articles/${encodeURIComponent(post.slug)}">${escapeMarkup(post.title)}</a></h3>
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

function escapeMarkup(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

function bindNewsletter(root: HTMLElement, newsletter: Props["content"]["newsletter"]) {
  const section = root.querySelector(".main-cta-section .section-title");
  if (section) {
    const eyebrow = section.querySelector("span");
    const title = section.querySelector("h2");
    if (eyebrow) eyebrow.textContent = newsletter.eyebrow;
    if (title) title.textContent = newsletter.title;
  }
  const description = root.querySelector(".main-cta-section .newsletter-support-text");
  if (description) {
    description.textContent =
      newsletter.description || "Info event, kelas baru, dan promo pilihan yang relevan untuk keluarga Clevio.";
  }
  const button = root.querySelector(".main-cta-section .theme-btn span");
  if (button) button.textContent = newsletter.buttonLabel;
}

function bindInstagram(root: HTMLElement, items: Props["content"]["instagram"]) {
  const wrapper = root.querySelector(".instagram-grid[data-instagram-grid]");
  if (!wrapper) return;
  wrapper.innerHTML = items
    .map(
      (item, index) => `
      <div class="instagram-banner-items">
        <div class="banner-image">
          <img src="${item.image}" alt="Kegiatan Clevio di Instagram ${index + 1}">
          <a href="${item.link}" target="_blank" rel="noreferrer" class="icon" aria-label="Buka foto Instagram ${index + 1}">
            <i class="fa-brands fa-instagram"></i>
          </a>
        </div>
      </div>
    `,
    )
    .join("");
}

function bindFooter(root: HTMLElement, content: SiteContent) {
  const footerContacts = content.footer.contacts?.length
    ? content.footer.contacts
    : [
        {
          label: "Call Us 7/24",
          value: content.contact.whatsapp,
          href: `tel:${content.contact.whatsapp.replace(/[^+\\d]/g, "")}`,
        },
        { label: "Make a Quote", value: content.contact.email, href: `mailto:${content.contact.email}` },
        { label: "Location", value: content.contact.address },
      ];

  const contactItems = root.querySelectorAll(".contact-info-area .contact-info-items");
  contactItems.forEach((item, index) => {
    const data = footerContacts[index];
    if (!data) return;
    const cleanedTel = (data.value || "").replace(/[^+\\d]/g, "");
    const fallbackHref =
      data.href ||
      (data.value.includes("@")
        ? `mailto:${data.value}`
        : cleanedTel
          ? `tel:${cleanedTel}`
          : undefined);
    const labelEl = item.querySelector(".content p");
    const valueEl = item.querySelector(".content h3 a, .content h3");
    if (labelEl) labelEl.textContent = data.label;
    if (valueEl) {
      if ((valueEl as HTMLAnchorElement).tagName === "A") {
        const anchor = valueEl as HTMLAnchorElement;
        anchor.textContent = data.value;
        if (fallbackHref) anchor.href = fallbackHref;
      } else {
        valueEl.textContent = data.value;
      }
    }
  });

  const footerWidgets = Array.from(root.querySelectorAll<HTMLElement>(".footer-widgets-wrapper .single-footer-widget"));
  const brandWidget = footerWidgets[0];
  if (brandWidget) {
    const brandLogo = brandWidget.querySelector("a img");
    if (brandLogo) {
      (brandLogo as HTMLImageElement).src = content.branding.logo;
      (brandLogo as HTMLImageElement).alt = content.branding.name;
    }
    const brandDesc = brandWidget.querySelector(".footer-content p");
    if (brandDesc) {
      brandDesc.textContent =
        content.footer.blurb || "Phasellus ultricies aliquam volutpat ullamcorper laoreet neque.";
    }
    const brandSocial = brandWidget.querySelector(".social-icon");
    if (brandSocial) {
      brandSocial.innerHTML = content.branding.socials
        .map(
          (social) =>
            `<a href="${social.href}" target="_blank" rel="noreferrer" aria-label="${social.label}"><i class="fab fa-${social.icon}"></i></a>`,
        )
        .join("");
    }
  }

  footerWidgets.forEach((widget) => {
    const heading = widget.querySelector(".widget-head h3");
    const title = heading?.textContent?.trim().toLowerCase();
    if (!title) return;

    if (widget.classList.contains("footer-quick-links")) {
      const list = widget.querySelector(".list-area");
      if (list) {
        list.innerHTML = content.footer.quickLinks
          .map(
            (link) => `
            <li>
              <a href="${link.href}">
                <i class="fa-solid fa-chevron-right"></i>
                ${link.label}
              </a>
            </li>`,
          )
          .join("");
      }
    }

    if (widget.classList.contains("footer-program-links")) {
      const list = widget.querySelector(".list-area");
      if (list) {
        list.innerHTML = (content.footer.categories ?? [])
          .map(
            (cat) => `
            <li>
              <a href="${cat.href}">
                <i class="fa-solid fa-chevron-right"></i>
                ${cat.label}
              </a>
            </li>`,
          )
          .join("");
      }
    }
  });

  const recentPosts = root.querySelectorAll(".recent-post-area .recent-post-items");
  const publishedPosts = content.blog.posts.filter((post) => post.status === "published");
  recentPosts.forEach((item, index) => {
    const post = publishedPosts[index];
    if (!post) {
      (item as HTMLElement).style.display = "none";
      return;
    }
    const image = item.querySelector("img") as HTMLImageElement | null;
    const date = item.querySelector(".post-date li");
    const link = item.querySelector("h6 a") as HTMLAnchorElement | null;
    if (image) {
      image.src = post.image;
      image.alt = post.title;
    }
    if (date) date.innerHTML = `<i class="fa-solid fa-calendar-days me-2"></i>${escapeMarkup(post.date)}`;
    if (link) {
      link.href = `/articles/${encodeURIComponent(post.slug)}`;
      link.textContent = post.title;
    }
  });

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
