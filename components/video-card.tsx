import Image from "next/image"
import Link from "next/link"
import { formatViews, formatPublishedDate } from "@/lib/utils"

interface Video {
  id: { videoId: string }
  snippet: {
    title: string
    thumbnails: { medium: { url: string } }
    channelTitle: string
    publishedAt: string
  }
  statistics?: { viewCount: string }
}

export default function VideoCard({ video, index }: { video: Video, index: number }) {
  return (
    <Link href={`/watch/${video.id}`} key={index}>
      <div className="group cursor-pointer">
        <div className="aspect-video overflow-hidden rounded-lg">
          <Image
            src={video.snippet.thumbnails.medium.url || "/placeholder.svg"}
            alt={video.snippet.title}
            width={320}
            height={180}
            priority
            className="object-cover transition-transform group-hover:scale-110"
          />
        </div>
        <div className="mt-2">
          <h3 className="text-base font-semibold line-clamp-2">{video.snippet.title}</h3>
          <p className="text-sm text-muted-foreground">{video.snippet.channelTitle}</p>
          <p className="text-xs text-muted-foreground">
            {video.statistics ? `${formatViews(Number.parseInt(video.statistics.viewCount))} views • ` : ""}
            {formatPublishedDate(new Date(video.snippet.publishedAt))}
          </p>
        </div>
      </div>
    </Link>
  )
}

