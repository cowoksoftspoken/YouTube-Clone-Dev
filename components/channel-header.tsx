"use client";

import { formatViews } from "@/lib/utils";

interface ChannelHeaderProps {
  channel: {
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        medium: {
          url: string;
        };
      };
      customUrl: string;
    };
    statistics: {
      subscriberCount: string;
      videoCount: string;
    };
  };
}

export default function ChannelHeader({ channel }: ChannelHeaderProps) {
  const displayDescription = (text: string, limit: number) =>
    text.length > limit ? text.slice(0, limit) + "..." : text;

  return (
    <>
      <div
        aria-hidden="true"
        aria-disabled="true"
        className="bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden mb-4"
      >
        <img
          src="/background-default.avif"
          decoding="async"
          loading="lazy"
          className="w-full max-h-[120px] md:max-h-[200px] object-cover"
        />
      </div>
      <div className="flex items-center md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6 md:mb-8 mb-4">
        <div
          className="layer rounded-full overflow-hidden w-[75px] h-[75px] md:w-[120px] md:h-[120px]"
          style={{ pointerEvents: "none" }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <img
            src={channel.snippet.thumbnails.medium.url}
            alt={channel.snippet.title}
            loading="eager"
            className="rounded-full w-[75px] h-[75px] md:w-[120px] md:h-[120px]"
          />
        </div>

        <div className="flex-1 ml-3">
          <h1 className="text-base md:text-2xl font-bold">
            {channel.snippet.title}
          </h1>
          <div className="text-sm text-muted-foreground mt-1 flex">
            <div className="flex flex-col md:flex-row font-extralight gap-1 md:items-center">
              <strong className="text-muted-foreground text-sm md:text-base dark:text-white text-black">
                {channel.snippet.customUrl}
              </strong>
              <div className="hidden md:flex">{" • "}</div>
              <p className="text-slate-800 dark:text-slate-200">
                {formatViews(
                  Number.parseInt(channel.statistics.subscriberCount)
                )}{" "}
                subscribers • {channel.statistics.videoCount} videos
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm dark:text-[#aba396] text-slate-700 line-clamp-2 md:flex hidden">
            {displayDescription(channel.snippet.description, 200) ||
              "No description available."}
          </p>
          <button
            className="bg-[#060606] dark:bg-white text-white dark:text-black px-4 py-2 rounded-full  items-center space-x-2 text-sm mt-2 hidden md:flex"
            onClick={() => console.log("Subscribed!")}
          >
            Subscribe
          </button>
        </div>
      </div>
      <p className="flex text-sm md:hidden line-clamp-1 dark:text-gray-400 text-slate-700 w-full mb-3 font-extralight">
        {displayDescription(channel.snippet.description, 100) ||
          "No Description Available."}
      </p>
      <button
        className="bg-[#060606] dark:bg-white text-white dark:text-black px-4 py-2 rounded-full flex items-center space-x-2 text-sm justify-center mt-2 w-full md:hidden"
        onClick={() => console.log("Subscribed!")}
      >
        Subscribe
      </button>
    </>
  );
}
