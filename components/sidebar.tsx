"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  Film,
  Flame,
  Gamepad2,
  Newspaper,
  Music2,
  Clapperboard,
  Podcast,
  Lightbulb,
  Shirt,
  Trophy,
  X,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";

const sidebarItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Compass, label: "Explore", href: "/explore" },
  { icon: Clapperboard, label: "Shorts", href: "/shorts" },
  { icon: PlaySquare, label: "Subscriptions", href: "/subscriptions" },
  { divider: true },
  { icon: Film, label: "Library", href: "/library" },
  { icon: Clock, label: "History", href: "/history" },
  { icon: PlaySquare, label: "Your videos", href: "/your-videos" },
  { icon: Clock, label: "Watch later", href: "/playlist?list=WL" },
  { icon: ThumbsUp, label: "Liked videos", href: "/playlist?list=LL" },
  { divider: true },
  { heading: "Subscriptions" },
  { icon: Flame, label: "Trending", href: "/trending" },
  { icon: Music2, label: "Music", href: "/music" },
  { icon: Gamepad2, label: "Gaming", href: "/gaming" },
  { icon: Newspaper, label: "News", href: "/news" },
  { icon: Trophy, label: "Sports", href: "/sports" },
  { divider: true },
  { heading: "Explore" },
  { icon: Film, label: "Movies & TV", href: "/movies-tv" },
  { icon: Podcast, label: "Podcasts", href: "/podcasts" },
  { icon: Lightbulb, label: "Learning", href: "/learning" },
  { icon: Shirt, label: "Fashion & Beauty", href: "/fashion-beauty" },
];

interface SidebarProps {
  className?: string;
  isOpen: boolean;
  onCloseAction: () => void;
}

const YoutubeC = "/YoutubeC.svg";
const YoutubeCWhite = "/YoutubeCWhite.svg";

export default function Sidebar({
  className,
  isOpen,
  onCloseAction,
}: SidebarProps) {
  const { theme } = useTheme();
  const [mediaTheme, setMediaTheme] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseAction();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onCloseAction]);

  useEffect(() => {
    const prefersTheme = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setMediaTheme(prefersTheme);
  }, [theme]);

  const DinamicYoutubeIcon =
    theme === "dark"
      ? YoutubeCWhite
      : theme === "light"
      ? YoutubeC
      : mediaTheme
      ? YoutubeCWhite
      : YoutubeC;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onCloseAction}
      />
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-64 bg-background transition-transform duration-300 ease-in-out transform  h-[100vh] overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex justify-between items-center p-4">
          <span className="font-semibold flex items-center max-h-8">
            <img
              src={DinamicYoutubeIcon}
              alt="YouTube"
              className={`text-white dark:text-black w-24 h-auto`}
            />
          </span>
          <Button variant="ghost" size="icon" onClick={onCloseAction}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
        <div className="space-y-4 py-4 pb-20">
          {sidebarItems.map((item, index) => {
            if (item.divider) {
              return (
                <hr
                  key={index}
                  className="my-2 border-t border-gray-200 dark:border-gray-700"
                />
              );
            }
            if ("heading" in item) {
              return (
                <h3
                  key={index}
                  className="px-4 text-sm font-semibold text-gray-500"
                >
                  {item.heading}
                </h3>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href!}
                className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272829]"
                onClick={onCloseAction}
              >
                {item.icon && <item.icon className="h-5 w-5" />}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
