import type {
  SiteContent,
  Testimonial,
  BlogPost,
  HeroDecoration,
} from "@/types/content";

export const DEFAULT_ROOT_ID = "clevio-template-root";

interface BindOptions {
  attachWindowEvents?: boolean;
  enableSmoothScroll?: boolean;
  rootId?: string;
  documentRef?: Document;
}

export function bindTemplate(
  root: HTMLElement,
  content: SiteContent,
  {
    attachWindowEvents = true,
    enableSmoothScroll = true,
    rootId = DEFAULT_ROOT_ID,
    documentRef,
  }: BindOptions = {},
): Array<() => void> {
  const doc = documentRef ?? (typeof document !== "undefined" ? document : undefined);
  const cleanups: Array<() => void> = [];

  const preloaderCleanup = bindPreloader(root, attachWindowEvents && rootId === DEFAULT_ROOT_ID);
  if (preloaderCleanup) cleanups.push(preloaderCleanup);

  bindHeader(root, content);
  bindHero(root, content);
  bindAbout(root, content);
  bindActivities(root, content.activities, content.activitiesDecorations);
  const programCleanup = bindPrograms(root, content);
  if (programCleanup) cleanups.push(programCleanup);
  bindWorkProcess(root, content.benefits);
  bindTestimonials(root, content.testimonials, content);
  bindPartners(root, content.partners);
  bindEvents(root, content.eventsSection);
  bindGallery(root, content.gallery);
  bindCta(root, content.callToAction, doc);
  bindNews(root, content.blog);
  bindInstructors(root, content.instructors, content);
  bindInstagram(root, content.instagram);
  bindFooter(root, content);
  reorderLandingSections(root, doc);

  const smoothScrollCleanup = enableSmoothScroll ? enableSmoothScrollInternal(root, doc) : undefined;
  if (smoothScrollCleanup) cleanups.push(smoothScrollCleanup);

  return cleanups;
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
  if (attachWindowEvents && typeof window !== "undefined") {
    window.addEventListener("load", hide);
    return () => window.removeEventListener("load", hide);
  }
  return undefined;
}

function bindHeader(root: HTMLElement, content: SiteContent) {
  const logos = root.querySelectorAll(".header-left .logo img, .header-logo img, .offcanvas__logo img");
  logos.forEach((logo) => {
    const image = logo as HTMLImageElement;
    image.src = content.branding.logo;
    image.alt = content.branding.name;
    // The approved Clevio lockup contains a tall transparent canvas. Keep the
    // same clipped treatment during SSR so the first paint matches hydration.
    image.closest(".header-logo")?.classList.add("has-padded-logo");
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
    const benefits = content.about.benefits ?? content.about.bullets.map((title, index) => ({
      number: String(index + 1).padStart(2, "0"),
      title,
      description: "",
    }));
    listWrapper.innerHTML = benefits
      .map(
        (benefit, index) => `
        <article class="why-benefit-card wow fadeInUp" data-wow-delay=".${3 + index}s">
          <span class="why-benefit-number">${escapeMarkup(benefit.number)}</span>
          <div>
            <h3>${escapeMarkup(benefit.title)}</h3>
            <p>${escapeMarkup(benefit.description)}</p>
          </div>
        </article>
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
  // Hide busy decorative shapes for a cleaner program grid
  [
    ".program-section .top-shape",
    ".program-section .bottom-shape",
    ".program-section .mask-shape",
    ".program-section .mask-shape-2",
    ".program-section .pencil-shape",
    ".program-section .compass-shape",
  ].forEach((selector) => {
    const el = root.querySelector<HTMLElement>(selector);
    if (el) el.style.display = "none";
  });

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
  wrapper.classList.add("g-4");
  wrapper.innerHTML = programs
    .map(
      (program, index) => `
      <div class="col-xl-4 col-lg-6 col-md-6 mb-4 wow fadeInUp" data-wow-delay="${0.15 + index * 0.1}s">
        <div class="program-box-items">
          <div class="program-bg ${index === 1 ? "bg-2" : index === 2 ? "bg-3" : ""}"></div>
          <div class="program-image">
            <img src="${escapeMarkup(program.image)}" alt="Level ${escapeMarkup(program.title)}">
          </div>
          <div class="program-content text-center ${index === 2 ? "style-2" : ""}">
            <h4>${escapeMarkup(program.title)}</h4>
            <span>${escapeMarkup(program.ageRange)}</span>
            <p>${escapeMarkup(program.summary || program.description)}</p>
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

  return bindProgramDialog(root, programs, content);
}

function bindWorkProcess(root: HTMLElement, benefits: SiteContent["benefits"]) {
  const section = root.querySelector(".work-process-section");
  const tagline = section?.querySelector("[data-work-process-tagline]");
  const title = section?.querySelector("[data-work-process-title]");
  const description = section?.querySelector("[data-work-process-description]");
  if (tagline) tagline.textContent = benefits.tagline;
  if (title) title.textContent = benefits.title;
  if (description) description.textContent = benefits.description;

  const wrapper = root.querySelector(".work-process-section .work-process-grid");
  if (!wrapper) return;
  wrapper.innerHTML = benefits.items
    .map(
      (item, index) => {
        const isLast = index === benefits.items.length - 1;
        const iconClass = item.icon || `fa-solid fa-code`;
        const connector = isLast
          ? ""
          : `<div class="work-process-connector" aria-hidden="true"><svg viewBox="0 0 36 18" focusable="false"><path d="M2 9 H30"></path><path d="M23 3 L30 9 L23 15"></path></svg></div>`;

        return `
        <div class="work-process-step ${index % 2 ? "work-process-tone-accent" : "work-process-tone-primary"} wow fadeInUp" data-wow-delay="${0.2 + index * 0.1}s">
          <article class="work-process-items text-center">
            <span class="work-process-number">${String(index + 1).padStart(2, "0")}</span>
            <div class="icon"><i class="${escapeMarkup(iconClass)}" aria-hidden="true"></i></div>
            <div class="content">
              <h4>${escapeMarkup(item.title)}</h4>
              <span class="work-process-divider" aria-hidden="true"></span>
              <p>${escapeMarkup(item.description)}</p>
            </div>
          </article>
          ${connector}
        </div>`;
      },
    )
    .join("");

}

function bindProgramDialog(
  root: HTMLElement,
  programs: SiteContent["programs"],
  content: SiteContent,
) {

  const dialog = root.querySelector<HTMLElement>("[data-program-dialog]");
  const wrapper = root.querySelector<HTMLElement>(".program-section .row");
  const panel = dialog?.querySelector<HTMLElement>(".program-detail-panel");
  if (!dialog || !panel || !wrapper) return;

  // Server-side template binding only needs the generated markup. Event handlers
  // are attached by the client-side hydration pass where a real window exists.
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const detailImage = dialog.querySelector<HTMLImageElement>("[data-program-detail-image]");
  const detailAge = dialog.querySelector<HTMLElement>("[data-program-detail-age]");
  const detailTitle = dialog.querySelector<HTMLElement>("[data-program-detail-title]");
  const detailTagline = dialog.querySelector<HTMLElement>("[data-program-detail-tagline]");
  const detailDescription = dialog.querySelector<HTMLElement>("[data-program-detail-description]");
  const focusList = dialog.querySelector<HTMLElement>("[data-program-learning]");
  const projectsList = dialog.querySelector<HTMLElement>("[data-program-projects]");
  const toolsList = dialog.querySelector<HTMLElement>("[data-program-tools]");
  const trialLink = dialog.querySelector<HTMLAnchorElement>("[data-program-trial-link]");
  const classLink = dialog.querySelector<HTMLAnchorElement>("[data-program-class-link]");
  const openButtons = Array.from(wrapper.querySelectorAll<HTMLButtonElement>("[data-program-open]"));
  const closeButtons = Array.from(dialog.querySelectorAll<HTMLButtonElement>("[data-program-close]"));
  let previousFocus: HTMLElement | null = null;

  const toolIcons: Record<string, string> = {
    scratch: "/assets/img/program/detail/software-scratch.svg",
    "code.org": "/assets/img/program/detail/software-codeorg.svg",
    kodu: "/assets/img/program/detail/software-construct3.svg",
    bebras: "/assets/img/program/detail/software-codeorg.svg",
    minecraft: "/assets/img/program/detail/software-minecraft.svg",
    gdevelop: "/assets/img/program/detail/software-construct3.svg",
    construct: "/assets/img/program/detail/software-construct3.svg",
    canva: "/assets/img/program/detail/software-canva.svg",
    "book creator": "/assets/img/program/detail/software-web.svg",
    "app inventor": "/assets/img/program/detail/software-web.svg",
    thunkable: "/assets/img/program/detail/software-web.svg",
    makecode: "/assets/img/program/detail/software-codeorg.svg",
    trinket: "/assets/img/program/detail/software-python.svg",
    "visual studio code": "/assets/img/program/detail/software-web.svg",
    roblox: "/assets/img/program/detail/software-roblox-studio.svg",
    html: "/assets/img/program/detail/software-web.svg",
    python: "/assets/img/program/detail/software-python.svg",
  };

  const findToolIcon = (name: string) => {
    const normalized = name.toLowerCase();
    const key = Object.keys(toolIcons).find((term) => normalized.includes(term));
    return key ? toolIcons[key] : "/assets/img/program/detail/software-codeorg.svg";
  };

  const renderModalLists = (program: SiteContent["programs"][number]) => {
    if (projectsList) {
      projectsList.innerHTML = (program.projectExamples ?? [])
        .slice(0, 3)
        .map((item, index) => `<span class="program-detail-project-dot${index === 0 ? " is-active" : ""}" title="${escapeMarkup(item)}" aria-label="${escapeMarkup(item)}"></span>`)
        .join("");
    }
    if (focusList) {
      focusList.innerHTML = `
        <h4>Fokus <i class="fa-solid fa-sparkles" aria-hidden="true"></i></h4>
        <ul>${(program.focus ?? program.learningPoints ?? [])
          .map((item) => `<li><i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>${escapeMarkup(item)}</span></li>`)
          .join("")}</ul>`;
    }
    if (toolsList) {
      const tools = program.tools ?? [];
      const collapsedToolCount = 6;
      toolsList.innerHTML = tools
        .map((tool, index) => `
          <article class="program-detail-tool"${index >= collapsedToolCount ? " hidden" : ""} data-program-tool-extra>
            <span class="program-detail-tool-icon"><img src="${findToolIcon(tool)}" alt="" aria-hidden="true"></span>
            <strong>${escapeMarkup(tool)}</strong>
          </article>`)
        .join("") + (tools.length > collapsedToolCount
          ? `<button class="program-detail-tools-toggle" type="button" aria-expanded="false">Lihat ${tools.length - collapsedToolCount} software lainnya <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button>`
          : "");

      const toolToggle = toolsList.querySelector<HTMLButtonElement>(".program-detail-tools-toggle");
      const extraTools = Array.from(toolsList.querySelectorAll<HTMLElement>("[data-program-tool-extra][hidden]"));
      toolToggle?.addEventListener("click", () => {
        const isExpanded = toolToggle.getAttribute("aria-expanded") === "true";
        extraTools.forEach((item) => {
          item.hidden = isExpanded;
        });
        toolToggle.setAttribute("aria-expanded", String(!isExpanded));
        toolToggle.innerHTML = isExpanded
          ? `Lihat ${extraTools.length} software lainnya <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>`
          : `Ringkas daftar <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>`;
      });
    }
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
    if (detailTagline) detailTagline.textContent = `Belajar melalui project ${program.title.toLowerCase()} yang relevan dan menyenangkan.`;
    if (detailDescription) detailDescription.textContent = program.description;
    renderModalLists(program);
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

function bindActivities(
  root: HTMLElement,
  activities: SiteContent["activities"],
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
  const section = root.querySelector(".testimonial-clevio-section");
  const header = section?.querySelector(".testimonial-clevio-header");
  if (header) {
    const eyebrow = header.querySelector(".testimonial-clevio-eyebrow span");
    const title = header.querySelector("h2");
    const description = header.querySelector(".testimonial-clevio-description");
    if (eyebrow) eyebrow.textContent = sectionContent.tagline;
    if (title) {
      const testimonialTitle = sectionContent.title.replace(/\byang\b/g, "Yang");
      title.innerHTML = escapeMarkup(testimonialTitle)
        .replace(/\n/g, "<br>")
        .replace(/\s+Bersama\s+/i, "<br>Bersama ");
    }
    if (description && sectionContent.description) description.textContent = sectionContent.description;
  }

  const slider = section?.querySelector(".swiper-wrapper");
  if (!slider) return;
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
              <span class="testimonial-author-icon" aria-hidden="true"><i class="${index === 0 ? "fa-regular fa-lightbulb" : index === 1 ? "fa-regular fa-comment-dots" : "fa-regular fa-file-lines"}"></i></span>
              <span class="testimonial-author-copy"><h6>${escapeMarkup(testi.name)}</h6><span>${escapeMarkup(testi.role)}</span></span>
            </div>
          </div>
        </article>
      </div>
    `,
    )
    .join("");
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

function bindEvents(root: HTMLElement, sectionContent: SiteContent["eventsSection"]) {
  const section = root.querySelector(".home-events-section");
  const grid = section?.querySelector(".home-events-grid");
  if (!section || !grid) return;

  const tagline = section.querySelector(".home-events-tagline");
  const title = section.querySelector(".home-events-title");
  const description = section.querySelector(".home-events-description");
  if (tagline) tagline.textContent = sectionContent.tagline;
  if (title) title.textContent = sectionContent.title;
  if (description) description.textContent = sectionContent.description;

  const items = sectionContent.showcaseItems ?? [];
  grid.innerHTML = items
    .map(
      (item, index) => `
        <article class="showcase-story-card wow fadeInUp" data-wow-delay=".${3 + index}s">
          <div class="showcase-story-media">
            <img src="${escapeMarkup(item.image || `/assets/img/instagram/${String((index % 6) + 1).padStart(2, "0")}.jpg`)}" alt="Placeholder dokumentasi ${escapeMarkup(item.title)}">
            <span class="showcase-story-media-label">Dokumentasi karya</span>
          </div>
          <div class="showcase-story-copy">
            <h3>${escapeMarkup(item.title)}</h3>
            <p>${escapeMarkup(item.description)}</p>
            <span class="showcase-story-link">Lihat cerita kegiatan <i class="fa-solid fa-arrow-right-long" aria-hidden="true"></i></span>
          </div>
        </article>
      `,
    )
    .join("");

}

function bindGallery(root: HTMLElement, gallery: SiteContent["gallery"]) {
  const section = root.querySelector(".gallery-karya-section");
  const grid = section?.querySelector("[data-gallery-grid]");
  if (!section || !grid) return;

  const tagline = section.querySelector("[data-gallery-tagline]");
  const title = section.querySelector("[data-gallery-title]");
  const description = section.querySelector("[data-gallery-description]");
  if (tagline) tagline.textContent = gallery.tagline;
  if (title) title.textContent = gallery.title;
  if (description) description.textContent = gallery.description ?? "";

  grid.innerHTML = gallery.items
    .map(
      (item, index) => `
        <a class="gallery-karya-item gallery-karya-item-${(index % 4) + 1}" href="#social-media" aria-label="Lihat karya ${escapeMarkup(item.title)}">
          <img src="${escapeMarkup(item.image)}" alt="Karya anak: ${escapeMarkup(item.title)}">
          <span class="gallery-karya-overlay">
            <small>${String(index + 1).padStart(2, "0")}</small>
            <strong>${escapeMarkup(item.title)}</strong>
          </span>
        </a>
      `,
    )
    .join("");
}

function bindCta(root: HTMLElement, cta: SiteContent["callToAction"], doc?: Document) {
  const ctaSection = root.querySelector(".cta-section .section-title");
  if (ctaSection) {
    const eyebrow = ctaSection.querySelector("span");
    const title = ctaSection.querySelector("h2");
    if (eyebrow) eyebrow.textContent = cta.eyebrow;
    if (title) title.innerHTML = cta.title;
    let desc = ctaSection.querySelector(".cta-text");
    if (!desc && doc) {
      desc = doc.createElement("p");
      desc.className = "text-white wow fadeInUp cta-text";
      desc.setAttribute("data-wow-delay", ".35s");
      ctaSection.appendChild(desc);
    }
    if (desc) desc.textContent = cta.text;
  }
  const button = root.querySelector(".cta-section .theme-btn") as HTMLAnchorElement | null;
  if (button) {
    button.href = cta.button.href;
    button.innerHTML = `${cta.button.label} <i class="fa-solid fa-arrow-right-long"></i>`;
  }
  const ctaImage = root.querySelector(".cta-section .cta-image img") as HTMLImageElement | null;
  if (ctaImage) ctaImage.src = cta.image;

  const mainCta = root.querySelector(".closing-cta-section");
  if (mainCta) {
    const mainEyebrow = mainCta.querySelector("[data-closing-eyebrow]");
    const mainTitle = mainCta.querySelector("[data-closing-title]");
    const mainText = mainCta.querySelector("[data-closing-text]");
    const mainButton = mainCta.querySelector("[data-closing-button]") as HTMLAnchorElement | null;
    if (mainEyebrow) mainEyebrow.textContent = cta.eyebrow;
    if (mainTitle) mainTitle.textContent = cta.title;
    if (mainText) mainText.textContent = cta.text;
    if (mainButton) {
      mainButton.href = cta.button.href;
      mainButton.innerHTML = `${escapeMarkup(cta.button.label)} <i class="fa-solid fa-arrow-right-long" aria-hidden="true"></i>`;
    }
  }
}

function bindNews(root: HTMLElement, blog: SiteContent["blog"]) {
  const sectionTitle = root.querySelector(".news-section .section-title");
  if (sectionTitle) {
    const eyebrow = sectionTitle.querySelector("span");
    const title = sectionTitle.querySelector("h2");
    if (eyebrow) eyebrow.textContent = blog.tagline;
    if (title) title.innerHTML = blog.title;
  }

  const sectionDescription = root.querySelector(".news-section-description");
  if (sectionDescription) sectionDescription.textContent = blog.description ?? "";

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

function bindInstructors(root: HTMLElement, instructors: SiteContent["instructors"], content: SiteContent) {
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

function bindInstagram(root: HTMLElement, items: SiteContent["instagram"]) {
  const socialSection = root.querySelector(".instagram-banner");
  const socialTitle = socialSection?.querySelector("[data-social-title]");
  const socialDescription = socialSection?.querySelector("[data-social-description]");
  if (socialTitle) socialTitle.textContent = "Ikuti Perjalanan Kami";
  if (socialDescription) {
    socialDescription.textContent =
      "Lihat karya anak, aktivitas kelas, event, dan berbagai cerita dari komunitas Clevio.";
  }

  const wrapper = root.querySelector(".instagram-grid[data-instagram-grid]");
  if (!wrapper) return;
  wrapper.innerHTML = items
    .map(
      (item) => `
      <div class="instagram-banner-items">
        <div class="banner-image">
          <img src="${item.image}" alt="Dokumentasi kegiatan Clevio">
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

    if (title.includes("quick")) {
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

    if (title.includes("categori")) {
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

  const footerText = root.querySelector(".footer-bottom p");
  if (footerText) footerText.textContent = content.footer.text;
}

function enableSmoothScrollInternal(root: HTMLElement, doc?: Document) {
  if (typeof window === "undefined") return undefined;
  const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  if (anchors.length === 0) return undefined;

  const handler = (event: Event) => {
    const anchor = event.currentTarget as HTMLAnchorElement | null;
    if (!anchor) return;
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;
    const target =
      doc?.querySelector(targetId) ||
      root.querySelector(targetId) ||
      root.querySelector(`[data-preview="${targetId.replace("#", "")}"]`);
    if (!target) return;
    event.preventDefault();
    if (targetId === "#hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    (target as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
  };

  anchors.forEach((a) => a.addEventListener("click", handler));

  return () => anchors.forEach((a) => a.removeEventListener("click", handler));
}

function reorderLandingSections(root: HTMLElement, doc?: Document) {
  const sectionOrder = [
    "hero",
    "partners",
    "about",
    "activities",
    "programs",
    "work-process",
    "free-trial",
    "events",
    "gallery",
    "news",
    "testimonials",
    "cta",
    "instagram",
  ];
  const sections = sectionOrder
    .map((preview) => root.querySelector<HTMLElement>(`[data-preview="${preview}"]`))
    .filter((section): section is HTMLElement => Boolean(section));
  const firstSection = root.querySelector<HTMLElement>("[data-preview=\"hero\"]");
  if (!firstSection || sections.length === 0) return;

  const ownerDocument = doc ?? root.ownerDocument;
  const anchor = ownerDocument.createComment("clevio-landing-order");
  firstSection.parentNode?.insertBefore(anchor, firstSection);
  const fragment = ownerDocument.createDocumentFragment();
  sections.forEach((section) => fragment.appendChild(section));
  anchor.parentNode?.insertBefore(fragment, anchor.nextSibling);
  anchor.remove();
}

function escapeMarkup(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
