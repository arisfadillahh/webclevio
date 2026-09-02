import type { Metadata } from "next";
import Image from "next/image";
import { PiArrowRightBold, PiCalendarBlankBold, PiMapPinBold } from "react-icons/pi";

import ContentSiteShell from "@/components/content/ContentSiteShell";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event Clevio Innovator Camp",
  description: "Temukan workshop, kelas spesial, dan event teknologi terbaru dari Clevio.",
};

function eventHref(href: string) {
  return href.startsWith("#") ? `/${href}` : href;
}

export default async function EventsPage() {
  const content = await getSiteContent();
  const events = content.events.filter((event) => event.status === "published");

  return (
    <ContentSiteShell content={content}>
      <section className="content-index-hero event-index-hero">
        <div className="content-site-container content-index-hero-inner">
          <span className="content-kicker"><PiCalendarBlankBold /> {content.eventsSection.tagline}</span>
          <h1>{content.eventsSection.title}</h1>
          <p>{content.eventsSection.description}</p>
        </div>
      </section>

      <section className="content-index-section">
        <div className="content-site-container event-list-grid">
          {events.map((event) => (
            <article key={event.id} className="event-list-card">
              <a href={eventHref(event.landingPageUrl)} className="event-list-media">
                <Image src={event.image} alt={event.title} fill sizes="(max-width: 900px) 100vw, 42vw" unoptimized />
                <span>{event.date}</span>
              </a>
              <div className="event-list-content">
                <p className="event-list-eyebrow">{event.audience}</p>
                <h2><a href={eventHref(event.landingPageUrl)}>{event.title}</a></h2>
                <p>{event.description}</p>
                <div className="event-list-details"><span><PiCalendarBlankBold /> {event.time}</span><span><PiMapPinBold /> {event.location}</span></div>
                <a href={eventHref(event.landingPageUrl)} className="content-text-link">Buka landing page <PiArrowRightBold /></a>
              </div>
            </article>
          ))}
          {events.length === 0 && <div className="content-empty-state"><h2>Belum ada event terbit</h2><p>Event yang dipublikasikan dari dashboard akan muncul di halaman ini.</p></div>}
        </div>
      </section>
    </ContentSiteShell>
  );
}
