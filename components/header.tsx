import Link from "next/link"
import { Youtube, Bell, User, Menu } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import { Button } from "./ui/button"
import SearchBar from "./search-bar"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            <Youtube className="h-6 w-6 text-red-600" />
            <span className="font-bold hidden sm:inline-block">YouTube</span>
          </Link>
        </div>
        <div className="flex-1 flex justify-center max-w-xl mx-4">
          <SearchBar />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">User account</span>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

