import Image from "next/image";
import Link from "next/link";
import { formatViews, formatPublishedDate, formatDuration } from "@/lib/utils";

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

export default function VideoCard({ video, compact = false }: VideoCardProps) {
  if (video.snippet?.resourceId?.videoId) {
    videoId = video.snippet.resourceId.videoId;
  } else if (typeof video.id === "string") {
    videoId = video.id;
  } else if (video.id?.videoId) {
    videoId = video.id.videoId;
  }

  const isWindowAvailable = typeof window !== "undefined";
  const isMobile =
    isWindowAvailable && window.matchMedia("(max-width: 640px)").matches;

  return (
    <Link href={`/watch/${videoId}`}>
      <div
        className={`group cursor-pointer ${
          compact ? "flex items-start space-x-2" : ""
        }`}
      >
        <div
          className={`overflow-hidden rounded-lg relative ${
            compact ? "w-40 flex-shrink-0 mb-2" : "aspect-video"
          }`}
        >
          <Image
            src={
              compact
                ? video.snippet.thumbnails?.default?.url
                : video.snippet.thumbnails?.medium?.url
                ? video.snippet.thumbnails.medium.url
                : "/placeholder.svg"
            }
            alt={video.snippet.title}
            width={compact ? 190 : isMobile ? 500 : 320}
            height={compact ? 90 : 180}
            priority
            quality={compact ? 70 : 100}
            layout="responsive"
            className="object-cover transition-transform group-hover:scale-110"
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
