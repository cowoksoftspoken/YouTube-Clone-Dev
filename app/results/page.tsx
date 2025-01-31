"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import VideoCard from "@/components/video-card";
import VideoCardSkeleton from "@/components/video-card-skeleton";
import { searchVideos } from "@/lib/youtube-api";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("search_query") || "";
  const sid = searchParams.get("sid") || "";

  const [videos, setVideos] = useState<any[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView();

  const loadMoreVideos = async () => {
    setLoading(true);
    try {
      const { items, nextPageToken: newNextPageToken } = await searchVideos(
        query,
        nextPageToken
      );
      setVideos((prevVideos) => [...prevVideos, ...items]);
      setNextPageToken(newNextPageToken);
    } catch (error) {
      console.error("Error searching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setVideos([]);
    setNextPageToken(null);
    setLoading(true);
    loadMoreVideos();
  }, []);

  useEffect(() => {
    if (inView) {
      loadMoreVideos();
    }
  }, [inView, loadMoreVideos]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video, index) => (
          <VideoCard key={index + 2} index={index} video={video} />
        ))}
        {loading && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </>
        )}
        <div ref={ref} className="col-span-full h-1" />
      </div>
    </div>
  );
}
