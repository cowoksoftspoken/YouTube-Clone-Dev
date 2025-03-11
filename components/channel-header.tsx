"use client";

import { formatViews } from "@/lib/utils";
import { BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  subscribeChannel,
  checkSubscription,
  unsubscribeChannel,
} from "@/lib/youtube-api";

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
  banner?: string;
  channelId: string;
}

export default function ChannelHeader({
  channel,
  banner,
  channelId,
}: ChannelHeaderProps) {
  const displayDescription = (text: string, limit: number) =>
    text.length > limit ? text.slice(0, limit) + "..." : text;
  const { data: session } = useSession();
  const [isSubs, setIsSubs] = useState<boolean>(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    if (session && session.accessToken) {
      checkSubscription(channelId, session.accessToken).then((subId) => {
        if (subId) {
          setIsSubs(true);
          setSubscriptionId(subId);
        }
      });
    }
  }, [session, channelId]);

  const handleSubscribeToggle = async (): Promise<void> => {
    if (!session || !session.accessToken) return;

    if (isSubs && subscriptionId) {
      const success = await unsubscribeChannel(
        subscriptionId,
        session.accessToken
      );
      if (success) {
        setIsSubs(false);
        setSubscriptionId(null);
      }
    } else {
      const newSubId = await subscribeChannel(channelId, session.accessToken);
      if (newSubId) {
        setIsSubs(true);
        setSubscriptionId(newSubId);
      }
    }
  };

  return (
    <>
      <div
        className="bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden mb-4"
        style={{ pointerEvents: "none" }}
      >
        <img
          src={banner ?? "/background-default.avif"}
          loading="eager"
          className="w-full max-h-[150px] md:max-h-[200px] object-cover"
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
          <h1
            className="text-base md:text-2xl font-bold flex items-center gap-2"
            title={
              Number.parseInt(channel.statistics.subscriberCount)
                ? "Verified"
                : channel.snippet.title
            }
          >
            {channel.snippet.title}
            {Number.parseInt(channel.statistics.subscriberCount) >= 100000 && (
              <BadgeCheck className="md:w-6 md:h-6 w-5 h-5 text-black dark:text-blue-500" />
            )}
          </h1>
          <div className="text-sm text-muted-foreground mt-1 flex">
            <div className="flex flex-col md:flex-row font-extralight gap-1 md:items-center">
              <strong className="text-muted-foreground text-sm md:text-base dark:text-white text-black">
                {channel.snippet.customUrl}
              </strong>
              <div className="hidden md:flex">{" • "}</div>
              <p className="text-slate-950 dark:text-slate-200 font-light">
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
            className={` px-4 py-2 rounded-full  items-center space-x-2 text-sm mt-2 hidden md:flex ${
              isSubs
                ? "bg-gray-800 text-white"
                : "bg-[#060606] dark:bg-white text-white dark:text-black"
            }`}
            onClick={handleSubscribeToggle}
          >
            {isSubs ? "Subscribed" : "Subscribe"}
          </button>
        </div>
      </div>
      <p className="flex text-sm md:hidden line-clamp-1 dark:text-gray-400 text-slate-700 w-full mb-3 font-extralight">
        {displayDescription(channel.snippet.description, 100) ||
          "No Description Available."}
      </p>
      <button
        className={`px-4 py-2 rounded-full flex items-center space-x-2 text-sm justify-center mt-2 w-full md:hidden ${
          isSubs
            ? "bg-gray-800 text-white"
            : "bg-[#060606] dark:bg-white text-white dark:text-black"
        }`}
        onClick={handleSubscribeToggle}
      >
        {isSubs ? "Subscribed" : "Subscribe"}
      </button>
    </>
  );
}
