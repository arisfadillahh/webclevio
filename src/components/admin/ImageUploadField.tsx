"use client";

import Image from "next/image";
import { useId, useState, type ChangeEvent } from "react";
import {
  PiImageBold,
  PiSpinnerGapBold,
  PiUploadSimpleBold,
} from "react-icons/pi";

const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

type UploadResponse = {
  ok?: boolean;
  url?: string;
  message?: string;
};

export async function uploadImageFile(file: File) {
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("Ukuran gambar maksimum 8MB.");
  }

  if (!ACCEPTED_IMAGE_TYPES.split(",").includes(file.type)) {
    throw new Error("Gunakan gambar JPG, PNG, atau WebP.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  const result = (await response.json()) as UploadResponse;

  if (!response.ok || !result.url) {
    throw new Error(result.message ?? "Gambar gagal diunggah.");
  }

  return result.url;
}

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  aspectRatio?: `${number} / ${number}`;
};

export default function ImageUploadField({
  label,
  value,
  onChange,
  description = "JPG, PNG, atau WebP. Maksimum 8MB; gambar otomatis dioptimalkan.",
  aspectRatio = "16 / 9",
}: Props) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      onChange(await uploadImageFile(file));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Gambar gagal diunggah.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="production-image-upload is-wide">
      <div className="production-image-upload-heading">
        <div>
          <strong>{label}</strong>
          <span>{description}</span>
        </div>
        <label
          className={`production-upload-button ${uploading ? "is-uploading" : ""}`}
          htmlFor={inputId}
          aria-disabled={uploading}
        >
          {uploading ? <PiSpinnerGapBold className="is-spinning" /> : <PiUploadSimpleBold />}
          {uploading ? "Mengunggah..." : value ? "Ganti gambar" : "Pilih gambar"}
        </label>
        <input
          id={inputId}
          className="image-file-input"
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          onChange={handleFile}
          disabled={uploading}
        />
      </div>

      <div className="production-image-upload-preview" style={{ aspectRatio }}>
        {value ? (
          <Image src={value} alt={`Preview ${label}`} fill sizes="(max-width: 900px) 100vw, 760px" unoptimized />
        ) : (
          <div className="production-image-upload-empty">
            <PiImageBold />
            <strong>Belum ada gambar</strong>
            <span>Pilih file dari perangkat Anda.</span>
          </div>
        )}
      </div>
      {error ? <p className="production-upload-error">{error}</p> : null}
    </div>
  );
}
