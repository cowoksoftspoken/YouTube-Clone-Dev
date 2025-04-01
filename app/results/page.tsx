"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import VideoCardSkeleton from "@/components/video-card-skeleton";
import { searchVideos } from "@/lib/youtube-api";
import { Roboto } from "next/font/google";
import VideoCardForSearch from "@/components/video-card-for-search";
import { FilterIcon } from "lucide-react";

const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500"] });

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("search_query") || "";

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

  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        let r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  useEffect(() => {
    setVideos([]);
    setNextPageToken(null);
    setLoading(true);
    loadMoreVideos();
    document
      .getElementById("search-results")
      ?.setAttribute(`data-v-${generateUUID()}`, "");
  }, [query]);

  useEffect(() => {
    if (inView) {
      loadMoreVideos();
    }
  }, [inView, loadMoreVideos]);

  return (
    <div className={roboto.className} id="search-results">
      <span className="sr-only">Penelusuran untuk {query}</span>
      <div className="flex items-center justify-between mb-4 md:px-8 px-0">
        <div className="flex items-center gap-2 cursor-pointer" role="button">
          <FilterIcon className="h-5 w-5" />
          Filter
        </div>
        <div className="flex items-center gap-2 cursor-pointer" role="button">
          <svg
            height="48"
            viewBox="0 0 48 48"
            className="h-4 w-4 text-black dark:text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M6 36h12v-4h-12v4zm0-24v4h36v-4h-36zm0 14h24v-4h-24v4z" />
            <path d="M0 0h48v48h-48z" fill="none" />
          </svg>
          Sort
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:px-8 px-0">
        {videos.map((video, index) => (
          <VideoCardForSearch key={index + 2} video={video} />
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
