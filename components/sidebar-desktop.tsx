import Link from "next/link";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

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

export default function SidebarDesktop({ className }: { className?: string }) {
  return (
    <>
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-64 bg-background transition-transform duration-300 ease-in-out transform md:translate-x-0 md:static h-full overflow-y-auto md:flex hidden",
          className
        )}
      >
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
                className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
