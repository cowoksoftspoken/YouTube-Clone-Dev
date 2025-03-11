"use client";

import { useEffect, useState } from "react";
import { Camera, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDuration, formatPublishedDate, formatViews } from "@/lib/utils";
import { fetchChannelDetails } from "@/lib/youtube-api";
import Link from "next/link";
import { Tabs, TabsList } from "@radix-ui/react-tabs";
import { TabsContent, TabsTrigger } from "@/components/ui/tabs";
import VideoModal from "@/components/modal-box";
import Notification from "@/components/notification";

export default function ManageChannel() {
  const { data: session } = useSession();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelData, setChannel] = useState<any>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<"edit" | "delete">("edit");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [status, setStatus] = useState<{
    type: "success" | "info" | "error";
    text: string;
  }>({
    type: "info",
    text: "",
  });

  const displayDescription = (text: string, limit: number) =>
    text.length > limit ? text.slice(0, limit) + "..." : text;

  useEffect(() => {
    if (!session?.accessToken) return;

    const fetchVideos = async () => {
      try {
        const res = await fetch(
          `/api/manage?accessToken=${session.accessToken}`
        );
        const data = await res.json();
        setVideos(data);

        if (data.length === 0) {
          setLoading(false);
          return;
        }

        setChannelId(data[0]?.snippet?.channelId || null);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [session?.accessToken]);

  useEffect(() => {
    if (!channelId) return;

    const fetchChannel = async () => {
      try {
        const channel = await fetchChannelDetails(channelId);
        setChannel(channel);
      } catch (error) {
        console.error("Error fetching channel details:", error);
      }
    };

    fetchChannel();
  }, [channelId]);

  const openEditModal = (video: any) => {
    setSelectedVideo(video);
    setModalType("edit");
    setModalOpen(true);
  };

  const openDeleteModal = (video: any) => {
    setSelectedVideo(video);
    setModalType("delete");
    setModalOpen(true);
  };

  const handleEdit = async (
    videoId: string,
    newTitle: string,
    newDescription: string
  ) => {
    try {
      await fetch("/api/manage", {
        method: "PATCH",
        body: JSON.stringify({
          videoId,
          title: newTitle,
          description: newDescription,
          accessToken: session?.accessToken,
        }),
      });

      setVideos((prevVideos) =>
        prevVideos.map((v) =>
          v.id === videoId
            ? {
                ...v,
                snippet: {
                  ...v.snippet,
                  title: newTitle,
                  description: newDescription,
                },
              }
            : v
        )
      );
      setStatus({
        type: "success",
        text: "Edited Successfully",
      });
      setModalOpen(false);
    } catch (error) {
      console.error("Error updating video:", error);
      setStatus({
        type: "error",
        text: "Edit failed, Something went wrong.",
      });
    }
  };

  const handleDelete = async (videoId: string) => {
    try {
      await fetch("/api/manage", {
        method: "DELETE",
        body: JSON.stringify({ videoId, accessToken: session?.accessToken }),
      });

      setVideos(videos.filter((video) => video.id !== videoId));
      setModalOpen(false);
      setStatus({
        type: "success",
        text: "Deleted Successfully",
      });
    } catch (error) {
      console.error("Error deleting video:", error);
      setStatus({
        type: "error",
        text: "Delete failed, Something went wrong.",
      });
    }
  };

  return (
    <div className="p-4 flex flex-col">
      {status && (
        <Notification type={status.type} text={status.text} duration={3000} />
      )}
      <div className="flex items-center md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6 md:mb-2 mb-4">
        <div className="relative group">
          <div className="absolute justify-center items-center flex bg-gradient-to-t from-gray-900 to-transparent top-0 left-0 w-full h-full rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Camera className="w-6 h-6" />
          </div>
          <div
            className="layer rounded-full overflow-hidden"
            style={{ pointerEvents: "none" }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <img
              src={
                channelData?.snippet?.thumbnails?.default?.url ??
                session?.user?.image ??
                "/placeholder.avif"
              }
              alt={channelData?.snippet?.title ?? session?.user?.name ?? "User"}
              loading="eager"
              className="rounded-full w-[100px] h-[100px] md:w-[150px] md:h-[150px]"
            />
          </div>
        </div>
        <div className="flex-1 ml-3">
          <h1 className="text-base md:text-2xl font-bold">
            {channelData?.snippet?.title ?? session?.user?.name ?? "User"}
          </h1>
          {channelData && (
            <div className="text-sm text-muted-foreground mt-1 flex">
              <div className="flex flex-col md:flex-row font-extralight gap-1 md:items-center">
                <strong className="text-muted-foreground text-sm md:text-base dark:text-white text-black">
                  {channelData?.snippet?.customUrl ?? "No custom URL"}
                </strong>
                <div className="hidden md:flex">{" • "}</div>
                <p className="text-slate-800 dark:text-slate-200">
                  {formatViews(
                    Number(channelData?.statistics?.subscriberCount || 0)
                  )}{" "}
                  subscribers • {channelData?.statistics?.videoCount || 0}{" "}
                  videos
                </p>
              </div>
            </div>
          )}
          <p className="mt-2 text-sm dark:text-[#aba396] text-slate-700 line-clamp-2 md:flex hidden">
            {displayDescription(
              channelData?.snippet?.description ?? "No description available.",
              200
            )}
          </p>
          <div className="flex gap-2 mt-3">
            <button className="rounded-full text-xs p-3 bg-[#272829] text-white">
              Adjust Channels
            </button>
            <button className="rounded-full text-xs px-3 py-1 bg-[#272829] text-white">
              Manage Videos
            </button>
          </div>
        </div>
      </div>
      <Tabs defaultValue="videos" className="mt-8">
        <TabsList className="flex justify-start w-full bg-transparent mb-4 border-b-2 border-gray-500">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>
        <TabsContent value="videos">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {videos.map((video, index) => (
              <VideoCard
                key={index}
                video={video}
                openEditModal={openEditModal}
                openDeleteModal={openDeleteModal}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="community">
          <h1>Coming soon</h1>
        </TabsContent>
      </Tabs>
      {modalOpen && selectedVideo && (
        <VideoModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
          }}
          type={modalType}
          video={selectedVideo}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {loading && (
        <div className="flex justify-between items-center mx-auto h-full mt-4">
          <span className="loader"></span>
        </div>
      )}
    </div>
  );
}

function VideoCard({
  video,
  openEditModal,
  openDeleteModal,
}: {
  video: any;
  openEditModal: (video: any) => void;
  openDeleteModal: (video: any) => void;
}) {
  return (
    <div className="relative group">
      <Link
        href={`/watch/${video?.snippet?.resourceId?.videoId}`}
        className="block"
      >
        <div className="overflow-hidden rounded-lg relative aspect-video">
          <img
            src={video.snippet.thumbnails.medium.url}
            alt={video.snippet.title}
            className="object-cover w-full"
          />
          {video.contentDetails && (
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
              {formatDuration(video.contentDetails.duration)}
            </div>
          )}
        </div>
      </Link>

      <div className="mt-2 py-1 flex justify-between items-center">
        <h3 className="font-semibold text-base line-clamp-2">
          {video.snippet.title}
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="bg-transparent rounded-full outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setTimeout(() => {
                  openEditModal(video);
                }, 50);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setTimeout(() => {
                  openDeleteModal(video);
                }, 50);
              }}
              className="text-red-500"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-sm text-muted-foreground">
        {video.snippet.channelTitle}
      </p>
      <p className="text-xs text-muted-foreground">
        {video.statistics
          ? `${formatViews(Number(video.statistics.viewCount))} views • `
          : ""}
        {formatPublishedDate(new Date(video.snippet.publishedAt))}
      </p>
    </div>
  );
}
