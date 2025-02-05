import { Suspense } from "react";
import { fetchVideoDetails } from "@/lib/youtube-api";
import VideoPlayer from "./video-player";
import { Skeleton } from "@/components/ui/skeleton";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const videoData = await fetchVideoDetails(resolvedParams.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <Suspense fallback={<LoadingSkeleton />}>
        <VideoPlayer initialVideo={videoData} videoId={resolvedParams.id} />
      </Suspense>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-2/3">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="h-8 w-3/4 mt-4" />
        <div className="flex items-center justify-between mt-2">
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-24 w-full mt-4" />
      </div>
      <div className="lg:w-1/3">
        <Skeleton className="h-[calc(100vh-200px)] w-full" />
      </div>
    </div>
  );
}
