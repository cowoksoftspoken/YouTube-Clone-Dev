"use client";

import { useState } from "react";
import { formatViews, formatPublishedDate } from "@/lib/utils";
import RelatedVideos from "@/components/related-videos";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Share2Icon, ThumbsUp } from "lucide-react";

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

function displayText(text: string, limit: number) {
  if (text) {
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  }
  return "No description available.";
}

export default function VideoPlayer({
  initialVideo,
  videoId,
}: VideoPlayerProps) {
  const [video] = useState<VideoDetails>(initialVideo);
  const [limit, setLimit] = useState<number>(500);
  if (typeof window !== "undefined") document.title = video.snippet.title;

  const handleSetLimit = () => {
    setLimit(limit === 500 ? video.snippet.description.length : 500);
  };

  const handleShare = () => {
    navigator
      .share({
        title: video.snippet.title,
        text: video.snippet.description,
        url: `\n${window.location.href}`,
      })
      .then(() => console.log("Successful share"))
      .catch((error) => console.log("Error sharing:", error));
  };

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
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-5" fill="current" />
              <p className="text-sm font-semibold">
                {formatViews(Number.parseInt(video.statistics.likeCount))}{" "}
              </p>
              <span className="sr-only">Thumbs Up</span>
            </div>

            <div className="flex items-center gap-1">
              <Share2Icon
                fill="current"
                className="cursor-pointer h-5"
                onClick={() => handleShare()}
              />
              <p className="text-sm font-semibold">Share</p>
              <span className="sr-only">Share</span>
            </div>
          </div>
        </div>
        <div
          className="mt-4 text-sm whitespace-pre-wrap dark:bg-[#060606] bg-slate-200 cursor-pointer p-4 rounded-lg"
          onClick={handleSetLimit}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            children={displayText(video.snippet.description, limit)}
          />
        </div>
      </div>
      <div className="lg:w-1/3">
        <RelatedVideos currentVideoTitle={video.snippet.title} />
      </div>
    </div>
  );
}
