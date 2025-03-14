"use client";

import Link from "next/link";
import { formatViews, formatPublishedDate, formatDuration } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";
import { Roboto } from "next/font/google";
import { fetchChannelDetails } from "../lib/youtube-api";
import OptimizedImage from "@/lib/OptimizedImage";

interface Video {
  id: { videoId: string } | string;
  snippet: {
    title: string;
    thumbnails: { medium: { url: string }; default: { url: string } };
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    resourceId?: { videoId: string };
  };
  contentDetails?: { duration: string };
  statistics?: { viewCount: string };
}

interface VideoCardProps {
  video: Video;
  compact?: boolean;
}

const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500"] });

export default function VideoCard({ video, compact = false }: VideoCardProps) {
  const [channelImage, setChannelImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  let videoId: string | null = null;

  if (video.snippet?.resourceId?.videoId) {
    videoId = video.snippet.resourceId.videoId;
  } else if (typeof video.id === "string") {
    videoId = video.id;
  } else if (video.id?.videoId) {
    videoId = video.id.videoId;
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!compact && video.snippet.channelId) {
      const fetchChannelImage = async () => {
        try {
          const response = await fetchChannelDetails(video.snippet.channelId);
          setChannelImage(response.snippet.thumbnails.default.url);
        } catch (error) {
          console.error("Error fetching channel image:", error);
        }
      };
      fetchChannelImage();
    }
  }, [video.snippet.channelId, compact]);

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
      const width = compact ? 200 : isMobile ? 280 : 520;
      const height = width / aspectRatio;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, [video, compact, isMobile]);

  return (
    <div
      className={`group cursor-pointer ${
        compact ? "flex items-start space-x-2" : roboto.className
      }`}
    >
      <Link href={`/watch/${videoId}`}>
        <div
          className={`overflow-hidden rounded-lg relative ${
            compact ? "w-[11rem] flex-shrink-0" : "aspect-video"
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
      </Link>
      <div className={compact ? "flex-grow" : "mt-2"}>
        {!compact && (
          <div className="flex items-start space-x-3">
            <Link
              href={`/channel/${video.snippet.channelId}`}
              className="flex-shrink-0"
            >
              <OptimizedImage
                src={channelImage || "/placeholder.avif"}
                alt={video.snippet.channelTitle}
                className="rounded-full w-10 h-10"
              />
            </Link>
            <div className="flex-grow">
              <Link href={`/watch/${videoId}`}>
                <h3 className="font-medium text-sm line-clamp-2 mb-1">
                  {video.snippet.title}
                </h3>
              </Link>
              <div className="flex items-center text-sm text-muted-foreground">
                <Link
                  href={`/channel/${video.snippet.channelId}`}
                  className="hover:text-foreground"
                >
                  {video.snippet.channelTitle}
                </Link>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>
                  {video.statistics
                    ? `${formatViews(
                        Number.parseInt(video.statistics.viewCount)
                      )} x views`
                    : ""}
                  {video.statistics ? " • " : ""}
                  {formatPublishedDate(new Date(video.snippet.publishedAt))}
                </span>
              </div>
            </div>
          </div>
        )}
        {compact && (
          <>
            <Link href={`/watch/${videoId}`}>
              <h3 className="font-medium text-sm line-clamp-2">
                {video.snippet.title}
              </h3>
            </Link>
            <Link
              href={`/channel/${video.snippet.channelId}`}
              className="text-sm text-muted-foreground hover:text-foreground block"
            >
              {video.snippet.channelTitle}
            </Link>
            <p className="text-sm text-muted-foreground">
              {video.statistics
                ? `${formatViews(
                    Number.parseInt(video.statistics.viewCount)
                  )} x views • `
                : ""}
              {formatPublishedDate(new Date(video.snippet.publishedAt))}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
