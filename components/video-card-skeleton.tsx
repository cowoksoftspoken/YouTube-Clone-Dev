import { Skeleton } from "./ui/skeleton";

export default function VideoCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-video w-full rounded-lg bg-[#222222]" />
      <div className="mt-2 space-y-2">
        <Skeleton className="h-4 w-full bg-[#222222]" />
        <Skeleton className="h-4 w-2/3 bg-[#222222]" />
        <Skeleton className="h-4 w-1/2 bg-[#222222]" />
      </div>
    </div>
  );
}
