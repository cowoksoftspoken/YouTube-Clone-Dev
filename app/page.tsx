"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import VideoCard from "@/components/video-card";
import VideoCardSkeleton from "@/components/video-card-skeleton";
import { fetchVideos } from "@/lib/youtube-api";

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView();

  const loadMoreVideos = async () => {
    setLoading(true);
    try {
      const { items, nextPageToken: newNextPageToken } = await fetchVideos(
        nextPageToken
      );
      setVideos((prevVideos) => [...prevVideos, ...items]);
      setNextPageToken(newNextPageToken);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoreVideos();
  }, []);

  useEffect(() => {
    if (inView) {
      loadMoreVideos();
    }
  }, [inView, loadMoreVideos]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video, index) => (
        <VideoCard key={index + 2} video={video} />
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
  );
}
