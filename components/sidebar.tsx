import Link from "next/link"
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
  Radio,
} from "lucide-react"

const sidebarItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Compass, label: "Explore", href: "/explore" },
  { icon: PlaySquare, label: "Subscriptions", href: "/subscriptions" },
  { icon: Clock, label: "History", href: "/history" },
  { icon: ThumbsUp, label: "Liked videos", href: "/liked" },
  { icon: Film, label: "Your videos", href: "/your-videos" },
  { icon: Flame, label: "Trending", href: "/trending" },
  { icon: Gamepad2, label: "Gaming", href: "/gaming" },
  { icon: Newspaper, label: "News", href: "/news" },
  { icon: Music2, label: "Music", href: "/music" },
  { icon: Radio, label: "Live", href: "/live" },
]

export default function Sidebar() {
  return (
    <aside className="w-64 hidden md:block overflow-y-auto border-r bg-background">
      <nav className="space-y-2 p-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

