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
            <h3 className="font-semibold text-base sm:text-lg text-white">
              {video.snippet.title}
            </h3>
            <p className="text-sm text-gray-400">
              {channelDetails?.snippet?.customUrl} {"•"}{" "}
              {formatViews(Number(channelDetails?.statistics?.subscriberCount))}{" "}
              subscribers
            </p>
            <p className="text-sm text-gray-400 line-clamp-2">
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
      <div className="flex gap-4 flex-col md:flex-row">
        <Link
          href={`/watch/${videoId}`}
          className="relative md:w-[320px] h-[180px] rounded-lg overflow-hidden aspect-video"
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
          <Link href={`/watch/${videoId}`}>
            <h3 className="font-semibold text-base line-clamp-2 text-white">
              {he.decode(video.snippet.title)}
            </h3>
            <div className="text-sm text-gray-400 mt-1">
              {viewCount} {viewCount ? "•" : ""} {publishedDate}
            </div>
          </Link>

          <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
            <Link
              href={`/channel/${video.snippet.channelId}`}
              className="flex items-center gap-2 hover:text-white"
            >
              <OptimizedImage
                src={channelImage || "/placeholder.avif"}
                alt={video.snippet.channelTitle}
                className="rounded-full w-6 h-6"
              />
              <span>{video.snippet.channelTitle}</span>
            </Link>
          </div>

          <p className="text-sm text-gray-400 line-clamp-2 hidden sm:block mt-1">
            {video.snippet.description}
          </p>
        </div>
      </div>
    </div>
  );
}
