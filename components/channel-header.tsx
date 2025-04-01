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

  const hasVevo = channel.snippet.title.endsWith("VEVO");

  return (
    <>
      <div
        className="bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden mb-4"
        style={{ pointerEvents: "none" }}
      >
        <img
          src={banner ?? "/background-default.avif"}
          srcSet={`${
            banner
              ? `${banner}=w768 768w, ${banner}=w1200 1200w, ${banner}=w1920 1920w`
              : "/background-default.avif"
          }`}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 768px, 1200px"
          alt={`${channel.snippet.title}'s Banner`}
          className="w-full max-h-[150px] md:max-h-[200px] object-cover"
          crossOrigin="anonymous"
          loading="eager"
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
            aria-label="Channel Name"
          >
            {hasVevo
              ? channel.snippet.title.replace(/VEVO$/, "")
              : channel.snippet.title}
            {hasVevo && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 dark:text-white text-black"
                viewBox="0 0 1508.2414 380"
                fill="currentColor"
              >
                <path d="M1318.241 0a190 190 0 1 0 190 190 190 190 0 0 0-190-190Zm0 278.667c-47.504 0-82.333-38-82.333-88.667s34.859-88.667 82.333-88.667 82.333 38.008 82.333 88.667-34.833 88.667-82.333 88.667Zm-557.333-88.667c0-104.935-82.23-190-183.667-190s-183.667 85.065-183.667 190 82.321 190 186.833 190c83.477 0 148.939-50.454 170.716-120.333H640.575c-15.337 22.692-37.888 28.5-60.167 28.5-42.728 0-69.955-29.41-78.499-69.667h256.936a198 198 0 0 0 2.063-28.5ZM577.242 88.667c36.647 0 65.049 25.245 73.756 63.333H503.34c9.857-39.593 36.098-63.333 73.902-63.333ZM209.908 376.833 0 11.083h123.586l86.322 166.25 86.323-166.25h123.586Zm734.667 0L734.667 11.083h123.587l86.321 166.25 86.323-166.25h123.587Z" />
              </svg>
            )}
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
            className={`px-4 py-2 rounded-full 
               items-center space-x-2 text-sm mt-2 hidden md:flex ${
                 isSubs
                   ? "bg-[#272829] text-white"
                   : "text-white bg-[#060606] dark:bg-white dark:text-black"
               }`}
            title={
              isSubs
                ? `Unsubscribe ${channel.snippet.title}`
                : `Subscribe ${channel.snippet.title}`
            }
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
        className={`px-4 py-2 rounded-full flex items-center space-x-2 text-sm justify-center mt-2 w-full md:hidden  ${
          isSubs
            ? "bg-[#272829] text-white"
            : "text-white bg-[#060606] dark:bg-white  dark:text-black"
        }`}
        onClick={handleSubscribeToggle}
      >
        {isSubs ? "Subscribed" : "Subscribe"}
      </button>
    </>
  );
}
