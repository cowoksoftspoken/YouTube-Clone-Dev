"use client";

import { useState, useEffect } from "react";
import { searchVideos } from "@/lib/youtube-api";
import VideoCard from "./video-card";
import { Skeleton } from "./ui/skeleton";

interface RelatedVideosProps {
  currentVideoTitle: string;
}

export default function RelatedVideos({
  currentVideoTitle,
}: RelatedVideosProps) {
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedVideos() {
      try {
        const searchQuery = currentVideoTitle.split(" ").slice(0, 3).join(" ");
        const { items } = await searchVideos(searchQuery);
        setRelatedVideos(items.slice(0, 10));
      } catch (error) {
        console.error("Error fetching related videos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedVideos();
  }, [currentVideoTitle]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold mb-4">Related Videos</h2>
      {relatedVideos.map((video, index) => (
        <VideoCard key={index} video={video} compact />
      ))}
    </div>
  );
}
