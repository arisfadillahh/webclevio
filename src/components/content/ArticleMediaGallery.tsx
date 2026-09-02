"use client";

import Image from "next/image";
import { useState } from "react";
import { PiCaretLeftBold, PiCaretRightBold, PiImagesBold } from "react-icons/pi";

import type { BlogPost } from "@/types/content";

type Props = {
  title: string;
  images: string[];
  mode: BlogPost["galleryMode"];
};

export default function ArticleMediaGallery({ title, images, mode }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (images.length === 0) return null;

  if (mode === "grid") {
    return (
      <section className="article-media-section" aria-labelledby="article-gallery-title">
        <div className="article-media-heading">
          <span><PiImagesBold /></span>
          <div><small>Dokumentasi</small><h2 id="article-gallery-title">Galeri kegiatan</h2></div>
        </div>
        <div className="article-media-grid">
          {images.map((image, index) => (
            <figure key={`${image}-${index}`}>
              <Image src={image} alt={`${title} — dokumentasi ${index + 1}`} fill sizes="(max-width: 700px) 100vw, 50vw" unoptimized />
            </figure>
          ))}
        </div>
      </section>
    );
  }

  const showPrevious = () => setActiveIndex((current) => (current - 1 + images.length) % images.length);
  const showNext = () => setActiveIndex((current) => (current + 1) % images.length);

  return (
    <section className="article-media-section" aria-labelledby="article-carousel-title">
      <div className="article-media-heading">
        <span><PiImagesBold /></span>
        <div><small>Dokumentasi</small><h2 id="article-carousel-title">Galeri kegiatan</h2></div>
        <div className="article-carousel-count" aria-live="polite">{activeIndex + 1} / {images.length}</div>
      </div>
      <div className="article-carousel">
        <div className="article-carousel-stage">
          <Image src={images[activeIndex]} alt={`${title} — dokumentasi ${activeIndex + 1}`} fill sizes="(max-width: 900px) 100vw, 820px" unoptimized />
          {images.length > 1 ? (
            <>
              <button type="button" className="is-previous" onClick={showPrevious} aria-label="Gambar sebelumnya"><PiCaretLeftBold /></button>
              <button type="button" className="is-next" onClick={showNext} aria-label="Gambar berikutnya"><PiCaretRightBold /></button>
            </>
          ) : null}
        </div>
        {images.length > 1 ? (
          <div className="article-carousel-thumbnails" aria-label="Pilih gambar dokumentasi">
            {images.map((image, index) => (
              <button key={`${image}-${index}`} type="button" className={index === activeIndex ? "is-active" : ""} onClick={() => setActiveIndex(index)} aria-label={`Tampilkan gambar ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined}>
                <Image src={image} alt="" fill sizes="110px" unoptimized />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
