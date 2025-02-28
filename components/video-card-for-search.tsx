import Link from "next/link";
import Image from "next/image";
import { formatViews, formatPublishedDate, formatDuration } from "@/lib/utils";
import OptimizedImage from "@/lib/OptimizedImage";

interface Video {
  id: { videoId: string } | string;
  snippet: {
    title: string;
    thumbnails: { medium: { url: string }; default: { url: string } };
    channelTitle: string;
    publishedAt: string;
    description: string;
  };
  statistics?: { viewCount: string };
}

interface SearchResultCardProps {
  video: Video;
}

export default function SearchResultCard({ video }: SearchResultCardProps) {
  const videoId = typeof video.id === "string" ? video.id : video.id.videoId;

  return (
    <Link href={`/watch/${videoId}`} className="block">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
        <div className="relative overflow-hidden rounded-lg sm:col-span-4 aspect-video">
          <OptimizedImage
            src={video.snippet.thumbnails.medium.url}
            alt={video.snippet.title}
            loading="eager"
            className="transition-transform w-full group-hover:scale-110"
          />
        </div>
        <div className="sm:col-span-8">
          <h3 className="font-semibold line-clamp-2 text-base sm:text-lg mb-1">
            {video.snippet.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-1">
            {video.statistics &&
              `${formatViews(
                Number.parseInt(video.statistics.viewCount)
              )} views • `}
            {formatPublishedDate(new Date(video.snippet.publishedAt))}
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            {video.snippet.channelTitle}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2 hidden sm:block">
            {video.snippet.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
