"use client";

import Link from "next/link";
import { formatViews, formatPublishedDate } from "@/lib/utils";
import OptimizedImage from "@/lib/OptimizedImage";
import { useEffect, useState } from "react";
import { fetchChannelDetails } from "@/lib/youtube-api";
import he from "he";

interface Video {
  id: { videoId?: string; channelId?: string; kind: string } | string;
  snippet: {
    title: string;
    thumbnails: { medium: { url: string }; default: { url: string } };
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    description: string;
  };
  statistics?: { viewCount: string };
}

interface ChannelDetails {
  snippet: {
    customUrl: string;
    thumbnails: { default: { url: string } };
  };
  statistics: {
    subscriberCount: string;
  };
}

interface SearchResultCardProps {
  video: Video;
}

const vevo = "/Vevo_dinamic.svg";

export default function SearchResultCard({ video }: SearchResultCardProps) {
  const isChannel =
    typeof video.id !== "string" && video.id.kind === "youtube#channel";
  const videoId = !isChannel
    ? typeof video.id === "string"
      ? video.id
      : video.id.videoId
    : null;
  const [channelImage, setChannelImage] = useState<string | null>(null);

  const [channelDetails, setChannelDetails] = useState<ChannelDetails | null>(
    null
  );

  useEffect(() => {
    if (video.snippet.channelId) {
      const fetchChannelImage = async () => {
        try {
          const response = await fetchChannelDetails(video.snippet.channelId);
          setChannelDetails(response);
          setChannelImage(response.snippet.thumbnails.default.url);
        } catch (error) {
          console.error("Error fetching channel image:", error);
        }
      };
      fetchChannelImage();
    }
  }, [video.snippet.channelId]);

  const hasVevo = video.snippet.channelTitle.endsWith("VEVO");

  if (isChannel) {
    return (
      <Link href={`/channel/${video.snippet.channelId}`} className="block p-4">
        <div className="flex sm:items-center gap-4 p-4 rounded-lg transition">
          <div className="w-[72px] h-[72px] sm:w-[96px] sm:h-[96px] rounded-full overflow-hidden">
            <OptimizedImage
              src={channelImage || "/placeholder.avif"}
              alt={video.snippet.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-base flex items-center sm:text-lg dark:text-white text-black">
              <span>
                {hasVevo
                  ? video.snippet.title.replace(/VEVO$/, "")
                  : video.snippet.title}
              </span>
              {hasVevo && (
                <img
                  src={vevo}
                  alt="Vevo"
                  className="inline-block ml-2 w-16 h-4"
                />
              )}
            </h3>
            <p className="text-sm dark:text-gray-400 text-gray-600">
              {channelDetails?.snippet?.customUrl} {"•"}{" "}
              {formatViews(Number(channelDetails?.statistics?.subscriberCount))}{" "}
              subscribers
            </p>
            <p className="text-sm dark:text-gray-400 text-gray-600 line-clamp-2">
              {video.snippet.description}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  const viewCount = video.statistics
    ? `${formatViews(Number.parseInt(video.statistics.viewCount))} x views`
    : "";
  const publishedDate = formatPublishedDate(
    new Date(video.snippet.publishedAt)
  );

  return (
    <div>
      <div className="flex gap-2 flex-col md:flex-row">
        <Link
          href={`/watch?v=${videoId}`}
          className="relative md:w-[560px] h-[300px] md:h-[300px] rounded-lg overflow-hidden aspect-video"
        >
          <div style={{ pointerEvents: "none" }}>
            <OptimizedImage
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        <div className="flex flex-col flex-1 space-y-2">
          <Link href={`/watch?v=${videoId}`}>
            <h3 className="font-semibold text-base line-clamp-2 dark:text-white text-black">
              {he.decode(video.snippet.title)}
            </h3>
            <div className="text-sm dark:text-gray-400 text-gray-600 mt-1">
              {viewCount} {viewCount ? "•" : ""} {publishedDate}
            </div>
          </Link>

          <div className="flex items-center space-x-2 text-sm dark:text-gray-400 text-gray-600 mt-1">
            <Link
              href={`/channel/${video.snippet.channelId}`}
              className="flex items-center gap-2 dark:hover:text-white hover:text-black"
            >
              <OptimizedImage
                src={channelImage || "/placeholder.avif"}
                alt={video.snippet.channelTitle}
                className="rounded-full w-6 h-6"
              />
              <span>
                {hasVevo
                  ? video.snippet.channelTitle.replace(/VEVO$/, "")
                  : video.snippet.channelTitle}
              </span>
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

          <p className="text-sm dark:text-gray-400 text-gray-600 line-clamp-2 hidden sm:block mt-1">
            {video.snippet.description}
          </p>
        </div>
      </div>
    </div>
  );
}
