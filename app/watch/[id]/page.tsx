"use client"

import { useState, useEffect } from "react"
import { formatViews, formatPublishedDate } from "@/lib/utils"
import { fetchVideoDetails } from "@/lib/youtube-api"
import { use } from "react"
import ReactMarkdown from "react-markdown"

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { id } = use(params)

  useEffect(() => {
    async function loadVideo() {
      try {
        const videoData = await fetchVideoDetails(id)
        setVideo(videoData)
      } catch (error) {
        console.error("Error fetching video details:", error)
      } finally {
        setLoading(false)
      }
    }
    loadVideo()
  }, [id])

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  if (!video) {
    return <div>Video not found</div>
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="aspect-video overflow-hidden rounded-lg">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${id}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <h1 className="text-xl font-bold mt-4">{video.snippet.title}</h1>
      <div className="flex items-center mt-2">
        <p className="text-sm text-muted-foreground">{video.snippet.channelTitle}</p>
        <span className="mx-2 text-sm text-muted-foreground">•</span>
        <p className="text-sm text-muted-foreground">
          {formatViews(Number.parseInt(video.statistics.viewCount))} views
        </p>
        <span className="mx-2 text-sm text-muted-foreground">•</span>
        <p className="text-sm text-muted-foreground">{formatPublishedDate(new Date(video.snippet.publishedAt))}</p>
      </div>
      <div className="mt-4 text-sm prose  dark:prose-invert dark:bg-slate-700 bg-slate-400 w-full p-4 rounded-md h-auto">
        <ReactMarkdown>
          {video.snippet.description}
        </ReactMarkdown>
      </div>
    </div>
  )
}

