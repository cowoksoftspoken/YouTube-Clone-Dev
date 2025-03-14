import { formatViews, formatDate } from "@/lib/utils";
import { Activity, Earth, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChannelAboutProps {
  channel: {
    snippet: {
      description: string;
      publishedAt: string;
      country: string;
    };
    statistics: {
      viewCount: string;
    };
    brandingSettings: {
      channel: {
        keywords: string;
      };
    };
  };
}

export default function ChannelAbout({ channel }: ChannelAboutProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">About Channel</h2>
      <div className="bg-card p-2 rounded-lg">
        <div className="mb-4 max-w-full prose dark:prose-invert prose-p:m-0 prose-h1:m-0 prose-h2:m-0 prose-h3:m-0 prose-h4:m-0 prose-h5:m-0 prose-h6:m-0 prose-a:m-0 prose-ul:m-0 prose-li:m-0 prose-ol:m-0 overflow-hidden word-break break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {channel.snippet.description}
          </ReactMarkdown>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-xl mb-2">Stats</h3>
            <div className="flex items-center gap-2">
              {" "}
              <Info className="w-5 h-5" /> Joined{" "}
              {formatDate(new Date(channel.snippet.publishedAt))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Activity className="w-5 h-5" />{" "}
              {/* {formatViews(Number(channel.statistics.viewCount))} views */}
              {Number.parseInt(channel.statistics.viewCount).toLocaleString(
                "id-ID"
              )}{" "}
              x views
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-xl">Details</h3>
            {channel.snippet.country ? (
              <div className="flex items-center gap-2">
                <Earth className="h-5 w-5" /> Location:{" "}
                {channel.snippet.country}
              </div>
            ) : (
              <p>No Description.</p>
            )}
          </div>
        </div>
        {channel.brandingSettings.channel.keywords && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Keywords</h3>
            <p className="underline">
              {channel.brandingSettings.channel.keywords}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
