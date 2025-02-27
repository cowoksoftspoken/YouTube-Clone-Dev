"use client";

import { useEffect, useState } from "react";

interface OptimizedImageProps {
  src: string;
  width?: number;
  format?: "webp" | "jpeg" | "png";
  alt: string;
  className?: string;
  decoding?: "async" | "auto" | "sync";
  loading?: "lazy" | undefined | "eager";
}

export default function OptimizedImage({
  src,
  width = 320,
  format = "webp",
  alt,
  className = "w-full h-auto object-cover",
  decoding = "async",
  loading = "lazy",
}: OptimizedImageProps) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (src) {
      setImageUrl(
        `/api/image?url=${encodeURIComponent(
          src
        )}&width=${width}&format=${format}`
      );
    }
  }, [src, width, format]);

  if (!imageUrl) return null;

  return (
    <img
      src={imageUrl}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={className}
    />
  );
}
