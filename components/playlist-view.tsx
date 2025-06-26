"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoCard from "@/components/video-card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPlaylistDetails, fetchPlaylistVideos } from "@/lib/youtube-api";
import OptimizedImage from "@/lib/OptimizedImage";

interface PlaylistViewProps {
  playlistId: string;
}

export default function PlaylistView({ playlistId }: PlaylistViewProps) {
  const [playlist, setPlaylist] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadPlaylistData() {
      try {
        const [playlistData, videosData] = await Promise.all([
          fetchPlaylistDetails(playlistId),
          fetchPlaylistVideos(playlistId),
        ]);
        setPlaylist(playlistData);
        setVideos(videosData.items);
      } catch (error) {
        console.error("Error fetching playlist data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPlaylistData();
  }, [playlistId]);

  if (loading) {
    return <PlaylistViewSkeleton />;
  }

  if (!playlist) {
    return <div>Playlist not found</div>;
  }

  const handlePlayAll = () => {
    if (videos.length > 0) {
      router.push(
        `/watch?v=${videos[0].snippet.resourceId.videoId}?playlist=${playlistId}`
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/3">
        <div className="relative aspect-video mb-4">
          <OptimizedImage
            src={playlist.snippet.thumbnails.medium.url || "/placeholder.svg"}
            alt={playlist.snippet.title}
            className="rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 shadow-md flex items-center justify-center">
            <Button
              onClick={handlePlayAll}
              className="text-white bg-red-600 hover:bg-red-700"
            >
              <Play className="mr-2 h-4 w-4" /> Play
            </Button>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">{playlist.snippet.title}</h1>
        <p className="text-sm text-muted-foreground mb-2">
          {playlist.contentDetails.itemCount} videos
        </p>
        <p className="text-sm mb-4">{playlist.snippet.description}</p>
        <Link
          href={`/channel/${playlist.snippet.channelId}`}
          className="text-sm text-blue-500 hover:underline"
        >
          {playlist.snippet.channelTitle}
        </Link>
      </div>
      <div className="md:w-2/3">
        {videos.map((video, index) => (
          <div key={video.id} className="mb-4">
            <VideoCard key={index} video={video} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaylistViewSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/3">
        <Skeleton className="aspect-video w-full mb-4 rounded-lg" />
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="md:w-2/3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="mb-4">
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
