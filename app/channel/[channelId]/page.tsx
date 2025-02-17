import { notFound } from "next/navigation";
import {
  fetchChannelDetails,
  fetchChannelVideos,
  fetchChannelPlaylists,
  fetchChannelAbout,
} from "@/lib/youtube-api";
import ChannelHeader from "@/components/channel-header";
import VideoGrid from "@/components/video-grid";
import ChannelPlaylists from "@/components/channel-playlists";
import ChannelAbout from "@/components/channel-about";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  try {
    const resolvedParams = await params;
    const [channelDetails, channelVideos, channelPlaylists, channelAbout] =
      await Promise.all([
        fetchChannelDetails(resolvedParams.channelId),
        fetchChannelVideos(resolvedParams.channelId),
        fetchChannelPlaylists(resolvedParams.channelId),
        fetchChannelAbout(resolvedParams.channelId),
      ]);

    return (
      <div className="container mx-auto px-4 py-8">
        <ChannelHeader channel={channelDetails} />
        <Tabs defaultValue="videos" className="mt-8">
          <TabsList className="flex justify-start w-full bg-transparent mb-4 border-b-2 border-gray-500">
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="videos">
            <VideoGrid videos={channelVideos.items} />
          </TabsContent>
          <TabsContent value="playlists">
            <ChannelPlaylists playlists={channelPlaylists.items} />
          </TabsContent>
          <TabsContent value="about">
            <ChannelAbout channel={channelAbout} />
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error("Error fetching channel data:", error);
    notFound();
  }
}
