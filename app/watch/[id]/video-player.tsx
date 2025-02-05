"use client";

import { useState } from "react";
import { formatViews, formatPublishedDate } from "@/lib/utils";
import RelatedVideos from "@/components/related-videos";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Heart } from "lucide-react";

interface VideoDetails {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
  };
}

interface VideoPlayerProps {
  initialVideo: VideoDetails;
  videoId: string;
}

export default function VideoPlayer({
  initialVideo,
  videoId,
}: VideoPlayerProps) {
  const [video] = useState<VideoDetails>(initialVideo);
  if (typeof window !== "undefined") document.title = video.snippet.title;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-2/3">
        <div className="aspect-video overflow-hidden rounded-lg">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
        <h1 className="text-2xl font-bold mt-4">{video.snippet.title}</h1>
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-lg font-semibold">
              {video.snippet.channelTitle}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatViews(Number.parseInt(video.statistics.viewCount))} views •{" "}
              {formatPublishedDate(new Date(video.snippet.publishedAt))}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="h-5" fill="current" />
            <p className="text-sm font-semibold">
              {formatViews(Number.parseInt(video.statistics.likeCount))}{" "}
            </p>
          </div>
        </div>
        <div className="mt-4 text-sm whitespace-pre-wrap">
          <ReactMarkdown
            rehypePlugins={[remarkGfm]}
            children={video.snippet.description}
          />
        </div>
      </div>
      <div className="lg:w-1/3">
        <RelatedVideos currentVideoTitle={video.snippet.title} />
      </div>
    </div>
  );
}
