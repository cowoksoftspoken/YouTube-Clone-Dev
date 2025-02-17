import { formatViews, formatDate } from "@/lib/utils";
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
      <h2 className="text-2xl font-bold mb-4">About</h2>
      <div className="bg-card p-6 rounded-lg">
        <div className="mb-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {channel.snippet.description}
          </ReactMarkdown>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Stats</h3>
            <p>Joined {formatDate(new Date(channel.snippet.publishedAt))}</p>
            <p>{formatViews(Number(channel.statistics.viewCount))} views</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Details</h3>
            {channel.snippet.country ? (
              <p>Location: {channel.snippet.country}</p>
            ) : (
              <p>No Description.</p>
            )}
          </div>
        </div>
        {channel.brandingSettings.channel.keywords && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Keywords</h3>
            <p>{channel.brandingSettings.channel.keywords}</p>
          </div>
        )}
      </div>
    </div>
  );
}
