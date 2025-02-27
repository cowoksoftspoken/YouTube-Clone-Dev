import Link from "next/link";
import OptimizedImage from "@/lib/OptimizedImage";

interface Playlist {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
  contentDetails: {
    itemCount: number;
  };
}

interface ChannelPlaylistsProps {
  playlists: Playlist[];
}

export default function ChannelPlaylists({ playlists }: ChannelPlaylistsProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Playlists</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {playlists.map((playlist) => (
          <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
            <div className="group cursor-pointer">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <OptimizedImage
                  src={
                    playlist.snippet.thumbnails.medium.url || "/placeholder.svg"
                  }
                  alt={playlist.snippet.title}
                  className="transition-transform group-hover:scale-110"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                  {playlist.contentDetails.itemCount} videos
                </div>
              </div>
              <h3 className="mt-2 text-sm font-semibold line-clamp-2">
                {playlist.snippet.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
