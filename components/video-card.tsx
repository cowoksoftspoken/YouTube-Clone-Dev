"use client";

import Link from "next/link";
import { formatViews, formatPublishedDate, formatDuration } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";
import { Roboto } from "next/font/google";

interface Video {
  id: { videoId: string } | string;
  snippet: {
    title: string;
    thumbnails: { medium: { url: string }; default: { url: string } };
    channelTitle: string;
    publishedAt: string;
    resourceId: { videoId: string };
  };
  contentDetails?: { duration: string };
  statistics?: { viewCount: string };
}

interface VideoCardProps {
  video: Video;
  compact?: boolean;
}

let videoId: string | null = null;

const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500"] });

export default function VideoCard({ video, compact = false }: VideoCardProps) {
  if (video.snippet?.resourceId?.videoId) {
    videoId = video.snippet.resourceId.videoId;
  } else if (typeof video.id === "string") {
    videoId = video.id;
  } else if (video.id?.videoId) {
    videoId = video.id.videoId;
  }

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = compact
      ? video.snippet.thumbnails?.default?.url
      : video.snippet.thumbnails?.medium?.url
      ? video.snippet.thumbnails.medium.url
      : "/placeholder.svg";

    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const width = compact ? 190 : isMobile ? 280 : 320;
      const height = width / aspectRatio;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, [video, compact, isMobile]);

  return (
    <Link href={`/watch/${videoId}`}>
      <div
        className={`group cursor-pointer ${
          compact ? "flex items-start space-x-2" : roboto.className
        }`}
      >
        <div
          className={`overflow-hidden rounded-lg relative ${
            compact ? "w-40 flex-shrink-0 mb-2" : "aspect-video"
          }`}
        >
          <canvas
            ref={canvasRef}
            className="object-cover transition-transform group-hover:scale-110 w-full"
          />
          {video.contentDetails && (
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
              {formatDuration(video.contentDetails.duration)}
            </div>
          )}
        </div>
        <div className={compact ? "flex-grow" : "mt-2"}>
          <h3
            className={`font-semibold line-clamp-2 ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            {video.snippet.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {video.snippet.channelTitle}
          </p>
          <p className="text-xs text-muted-foreground">
            {video.statistics
              ? `${formatViews(
                  Number.parseInt(video.statistics.viewCount)
                )} views • `
              : ""}
            {formatPublishedDate(new Date(video.snippet.publishedAt))}
          </p>
        </div>
      </div>
    </Link>
  );
}
