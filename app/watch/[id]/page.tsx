import { Suspense } from "react";
import { fetchVideoDetails, fetchChannelDetails } from "@/lib/youtube-api";
import VideoPlayer from "./video-player";
import { Skeleton } from "@/components/ui/skeleton";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const videoData = await fetchVideoDetails(resolvedParams.id);
  const channelData = await fetchChannelDetails(videoData.snippet.channelId);

  return (
    <div className="md:max-w-7xl max-w-[100vw] mx-auto md:px-4 px-0 py-3">
      <Suspense fallback={<LoadingSkeleton />}>
        <VideoPlayer
          initialVideo={videoData}
          channelDetails={channelData}
          videoId={resolvedParams.id}
        />
      </Suspense>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-2/3">
        <Skeleton className="aspect-video w-full rounded-lg bg-[#222222]" />
        <Skeleton className="h-8 w-3/4 mt-4 bg-[#222222]" />
        <div className="flex items-center justify-between mt-2 bg-[#222222]">
          <div>
            <Skeleton className="h-6 w-48 bg-[#222222]" />
            <Skeleton className="h-4 w-32 mt-1 bg-[#222222]" />
          </div>
          <Skeleton className="h-6 w-24 bg-[#222222]" />
        </div>
        <Skeleton className="h-24 w-full mt-4 bg-[#222222]" />
      </div>
      <div className="lg:w-1/3">
        <Skeleton className="h-[calc(100vh-200px)] w-full bg-[#222222]" />
      </div>
    </div>
  );
}
