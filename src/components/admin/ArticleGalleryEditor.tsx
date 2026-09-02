"use client";

import Image from "next/image";
import { useId, useState, type ChangeEvent } from "react";
import {
  PiArrowDownBold,
  PiArrowUpBold,
  PiImagesBold,
  PiSpinnerGapBold,
  PiTrashBold,
  PiUploadSimpleBold,
} from "react-icons/pi";

import { uploadImageFile } from "@/components/admin/ImageUploadField";
import type { BlogPost } from "@/types/content";

const MAX_GALLERY_IMAGES = 8;

type Props = {
  images: string[];
  mode: BlogPost["galleryMode"];
  onImagesChange: (images: string[]) => void;
  onModeChange: (mode: BlogPost["galleryMode"]) => void;
};

export default function ArticleGalleryEditor({
  images,
  mode,
  onImagesChange,
  onModeChange,
}: Props) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selectedFiles.length === 0) return;

    const remainingSlots = MAX_GALLERY_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setError(`Maksimal ${MAX_GALLERY_IMAGES} gambar dokumentasi.`);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const uploadedImages = await Promise.all(
        selectedFiles.slice(0, remainingSlots).map(uploadImageFile),
      );
      onImagesChange([...images, ...uploadedImages]);
      if (selectedFiles.length > remainingSlots) {
        setError(`Hanya ${remainingSlots} gambar yang ditambahkan karena batas galeri ${MAX_GALLERY_IMAGES} gambar.`);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Dokumentasi gagal diunggah.");
    } finally {
      setUploading(false);
    }
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= images.length) return;
    const nextImages = [...images];
    [nextImages[index], nextImages[destination]] = [nextImages[destination], nextImages[index]];
    onImagesChange(nextImages);
  };

  return (
    <section className="production-article-gallery is-wide" aria-labelledby={`${inputId}-title`}>
      <div className="production-article-gallery-heading">
        <div>
          <span className="production-gallery-icon"><PiImagesBold /></span>
          <div>
            <strong id={`${inputId}-title`}>Dokumentasi artikel</strong>
            <span>Opsional, maksimum {MAX_GALLERY_IMAGES} gambar. Urutan di bawah sama dengan urutan tampil.</span>
          </div>
        </div>
        <label>
          Tampilan
          <select value={mode} onChange={(event) => onModeChange(event.target.value as BlogPost["galleryMode"])}>
            <option value="carousel">Carousel</option>
            <option value="grid">Gallery grid</option>
          </select>
        </label>
      </div>

      {images.length > 0 ? (
        <div className="production-gallery-list">
          {images.map((image, index) => (
            <article key={`${image}-${index}`} className="production-gallery-item">
              <div className="production-gallery-thumbnail">
                <Image src={image} alt={`Dokumentasi ${index + 1}`} fill sizes="180px" unoptimized />
                <span>{index + 1}</span>
              </div>
              <div className="production-gallery-item-actions">
                <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label={`Geser gambar ${index + 1} ke atas`}><PiArrowUpBold /></button>
                <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} aria-label={`Geser gambar ${index + 1} ke bawah`}><PiArrowDownBold /></button>
                <button type="button" className="is-danger" onClick={() => onImagesChange(images.filter((_, imageIndex) => imageIndex !== index))} aria-label={`Hapus gambar ${index + 1}`}><PiTrashBold /></button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="production-gallery-empty">
          <PiImagesBold />
          <strong>Belum ada dokumentasi tambahan</strong>
          <span>Artikel tetap bisa disimpan hanya dengan gambar utama.</span>
        </div>
      )}

      <div className="production-gallery-footer">
        <span>{images.length}/{MAX_GALLERY_IMAGES} gambar</span>
        <label className={`production-upload-button ${uploading ? "is-uploading" : ""}`} htmlFor={inputId} aria-disabled={uploading || images.length >= MAX_GALLERY_IMAGES}>
          {uploading ? <PiSpinnerGapBold className="is-spinning" /> : <PiUploadSimpleBold />}
          {uploading ? "Mengunggah..." : "Tambah gambar"}
        </label>
        <input id={inputId} className="image-file-input" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} disabled={uploading || images.length >= MAX_GALLERY_IMAGES} />
      </div>
      {error ? <p className="production-upload-error">{error}</p> : null}
    </section>
  );
}
