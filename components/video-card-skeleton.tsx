import { Skeleton } from "./ui/skeleton"

export default function VideoCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="mt-2 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

