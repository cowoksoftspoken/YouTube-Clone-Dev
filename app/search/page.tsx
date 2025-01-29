"use client"
import VideoCard from "@/components/video-card";
import { searchVideos } from "@/lib/youtube-api";
import { useEffect, useState } from "react";
import { use } from "react"

export default function Page({
  searchParams
}: {
  searchParams: Promise<{query: string}>;
}) {

    const [video, setVideo] = useState<any[]>([]);
    const { query } = use(searchParams)    

    const loadMoreVideos = async () => {
        try {
          const response = await searchVideos(query)
          console.log(response)
          setVideo(response)
        } catch (error) {
          console.error("Error fetching videos:", error)
        } 
      }

    console.log(query)

    useEffect(()=>{
        loadMoreVideos();
    }, [query])

    return (
        <div className="ytc_results_search">
            <h1>Search Results for: {query}</h1>

            <div className="container">
              {video.map((items: any, index: number) => (
                <VideoCard key={index + 2} index={index} video={items} />
              ))}
            </div>
        </div>
    )
}
