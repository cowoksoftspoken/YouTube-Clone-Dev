"use client";

import Link from "next/link";
import { formatViews, formatPublishedDate, formatDuration } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";
import { Roboto } from "next/font/google";
import { fetchChannelDetails } from "../lib/youtube-api";
import OptimizedImage from "@/lib/OptimizedImage";
import he from "he";

interface Video {
  id: { videoId: string } | string;
  snippet: {
    title: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
      standard?: { url: string };
      maxres?: { url: string };
    };
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

  // const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;

  //   const ctx = canvas.getContext("2d");

  //   if (!ctx) return;

  //   const img = new Image();
  //   img.crossOrigin = "anonymous";
  //   img.src = compact
  //     ? video.snippet.thumbnails?.default?.url
  //     : video.snippet.thumbnails?.medium?.url
  //     ? video.snippet.thumbnails.medium.url
  //     : "/placeholder.svg";

  //   img.onload = () => {
  //     const aspectRatio = img.width / img.height;
  //     const width = compact ? 200 : isMobile ? 280 : 520;
  //     const height = width / aspectRatio;
  //     canvas.width = width;
  //     canvas.height = height;
  //     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  //   };
  // }, [video, compact, isMobile]);

  const hasVevo = video.snippet.channelTitle.endsWith("VEVO");
  const width = compact ? 200 : isMobile ? 280 : 520;

  return (
    <div
      className={`group cursor-pointer ${
        compact ? "flex items-start space-x-2" : roboto.className
      }`}
    >
      <Link href={`/watch?v=${videoId}`}>
        <div
          className={`overflow-hidden rounded-lg relative ${
            compact ? "w-[11rem] flex-shrink-0" : "aspect-video"
          }`}
        >
          <img
            src={video.snippet.thumbnails.medium.url}
            srcSet={`${video.snippet.thumbnails.default.url} 120w, ${
              video.snippet.thumbnails.medium.url
            } 320w, ${video.snippet.thumbnails.high.url} 480w, ${
              video.snippet.thumbnails.standard?.url ||
              video.snippet.thumbnails.high.url
            } 640w, ${
              video.snippet.thumbnails.maxres?.url ||
              video.snippet.thumbnails.high.url
            } 1280w`.trim()}
            sizes="(max-width: 320px) 120px, (max-width: 768px) 320px, (max-width: 1024px) 480px, (max-width: 1280px) 640px, 1280px"
            className="object-cover transition-transform group-hover:scale-110 w-full"
            width={width}
            height={compact ? 120 : 360}
            alt={video.snippet.title}
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
              <Link href={`/watch?v=${videoId}`}>
                <h3 className="font-medium text-sm line-clamp-2 mb-1">
                  {video.snippet.title}
                </h3>
              </Link>
              <div className="flex items-center text-sm text-muted-foreground">
                <Link
                  href={`/channel/${video.snippet.channelId}`}
                  className="hover:text-foreground flex items-center gap-2"
                >
                  {hasVevo
                    ? video.snippet.channelTitle.replace(/VEVO$/, "")
                    : video.snippet.channelTitle}
                  {hasVevo && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-[.5rem] text-black dark:text-white"
                      viewBox="0 0 1508.2414 380"
                      fill="currentColor"
                    >
                      <path d="M1318.241 0a190 190 0 1 0 190 190 190 190 0 0 0-190-190Zm0 278.667c-47.504 0-82.333-38-82.333-88.667s34.859-88.667 82.333-88.667 82.333 38.008 82.333 88.667-34.833 88.667-82.333 88.667Zm-557.333-88.667c0-104.935-82.23-190-183.667-190s-183.667 85.065-183.667 190 82.321 190 186.833 190c83.477 0 148.939-50.454 170.716-120.333H640.575c-15.337 22.692-37.888 28.5-60.167 28.5-42.728 0-69.955-29.41-78.499-69.667h256.936a198 198 0 0 0 2.063-28.5ZM577.242 88.667c36.647 0 65.049 25.245 73.756 63.333H503.34c9.857-39.593 36.098-63.333 73.902-63.333ZM209.908 376.833 0 11.083h123.586l86.322 166.25 86.323-166.25h123.586Zm734.667 0L734.667 11.083h123.587l86.321 166.25 86.323-166.25h123.587Z" />
                    </svg>
                  )}
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
            <Link href={`/watch?v=${videoId}`}>
              <h3 className="font-medium text-sm line-clamp-2">
                {he.decode(video.snippet.title)}
              </h3>
            </Link>
            <Link
              href={`/channel/${video.snippet.channelId}`}
              className="text-sm text-muted-foreground flex items-center gap-2 hover:text-foreground"
            >
              {hasVevo
                ? video.snippet.channelTitle.replace(/VEVO$/, "")
                : video.snippet.channelTitle}
              {hasVevo && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[.5rem] text-black dark:text-white"
                  viewBox="0 0 1508.2414 380"
                  fill="currentColor"
                >
                  <path d="M1318.241 0a190 190 0 1 0 190 190 190 190 0 0 0-190-190Zm0 278.667c-47.504 0-82.333-38-82.333-88.667s34.859-88.667 82.333-88.667 82.333 38.008 82.333 88.667-34.833 88.667-82.333 88.667Zm-557.333-88.667c0-104.935-82.23-190-183.667-190s-183.667 85.065-183.667 190 82.321 190 186.833 190c83.477 0 148.939-50.454 170.716-120.333H640.575c-15.337 22.692-37.888 28.5-60.167 28.5-42.728 0-69.955-29.41-78.499-69.667h256.936a198 198 0 0 0 2.063-28.5ZM577.242 88.667c36.647 0 65.049 25.245 73.756 63.333H503.34c9.857-39.593 36.098-63.333 73.902-63.333ZM209.908 376.833 0 11.083h123.586l86.322 166.25 86.323-166.25h123.586Zm734.667 0L734.667 11.083h123.587l86.321 166.25 86.323-166.25h123.587Z" />
                </svg>
              )}
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
