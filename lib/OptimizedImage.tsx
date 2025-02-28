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
  quality?: number;
}

const sizes = [320, 480, 640, 750, 1080, 1200, 1920];

export default function OptimizedImage({
  src,
  width = 320,
  format = "webp",
  alt,
  className = "w-full h-auto object-cover",
  decoding = "async",
  loading = "lazy",
  quality,
}: OptimizedImageProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [generateSrcSet, setGenerateSrcSet] = useState("");

  const getQuality = () => {
    if (window.innerWidth <= 480) return 50;
    if (window.innerWidth <= 1080) return 75;
    return 85;
  };

  useEffect(() => {
    if (src) {
      const adjustedQuality = quality ?? getQuality();

      setImageUrl(
        `/api/image?url=${encodeURIComponent(
          src
        )}&width=${width}&format=${format}&quality=${adjustedQuality}`
      );

      const generatedSrcSet = sizes
        .map(
          (size) =>
            `/api/image?url=${encodeURIComponent(
              src
            )}&width=${size}&format=${format}&quality=${adjustedQuality} ${size}w`
        )
        .join(", ");

      setGenerateSrcSet(generatedSrcSet);
    }
  }, [src, width, format, quality]);

  if (!imageUrl) return null;

  return (
    <img
      src={imageUrl}
      alt={alt}
      sizes="(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1080px) 50vw, 33vw"
      srcSet={generateSrcSet}
      loading={loading}
      decoding={decoding}
      className={className}
    />
  );
}
