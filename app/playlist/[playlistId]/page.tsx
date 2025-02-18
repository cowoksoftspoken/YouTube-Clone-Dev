import { Suspense } from "react";
import PlaylistView from "@/components/playlist-view";
import { Skeleton } from "@/components/ui/skeleton";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ playlistId: string }>;
}) {
  const { playlistId } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<PlaylistViewSkeleton />}>
        <PlaylistView playlistId={playlistId} />
      </Suspense>
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
