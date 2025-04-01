"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Bell, Menu, Plus, Search, User, Video } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import AccountDropdown from "./dropdown-menu";
import SearchBar from "./search-bar";
import Sidebar from "./sidebar";
import { Button } from "./ui/button";
import { DropdownMenu } from "./ui/dropdown-menu";

const YoutubeC = "/YoutubeC.svg";
const YoutubeCWhite = "/YoutubeCWhite.svg";

export default function Header() {
  const { data: session } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [DinamicYoutubeIcon, setDinamicYoutubeIcon] = useState(YoutubeC);
  const { theme } = useTheme();

  const handleLogin = async () => {
    await signIn("google");
  };

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const icon =
      theme === "dark"
        ? YoutubeCWhite
        : theme === "light"
        ? YoutubeC
        : prefersDark
        ? YoutubeCWhite
        : YoutubeC;
    setDinamicYoutubeIcon(icon);
  }, [theme]);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:p-2 p-0 py-1">
      <div className="flex h-14 items-center px-3 justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen((state) => !state)}
            className="mr-2"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            <div className="layer pointer-none">
              <img
                src={DinamicYoutubeIcon}
                alt="YouTube"
                className="h-24 w-24 text-white dark:text-black"
              />
            </div>
            <span className="font-bold sm:inline-block sr-only">YouTube</span>
          </Link>
        </div>
        <div className="flex-1 flex justify-center max-w-2xl mx-4">
          <div className="hidden md:flex md:w-full lg:w-[600px]">
            <SearchBar />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex dark:bg-[#272829] dark:text-white w-8 h-8 rounded-full justify-center items-center bg-slate-100 hover:bg-slate-950 hover:text-white"
            title="Create Video"
          >
            <Link href="/create/upload">
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" title="Notifications">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" role="link" size="icon">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <img
                    src={session?.user?.image as string}
                    alt={session?.user?.name as string}
                    className="h-7 w-7 rounded-full"
                    loading="eager"
                  />
                </DropdownMenuTrigger>
                <AccountDropdown />
              </DropdownMenu>
            ) : (
              <User className="h-5 w-5" onClick={() => handleLogin()} />
            )}
            <span className="sr-only">{session ? "Logout" : "Login"}</span>
          </Button>
        </div>
      </div>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed top-0 left-0 right-0 p-4 bg-background border-b">
            <SearchBar onCloseAction={() => setIsSearchOpen(false)} />
          </div>
        </div>
      )}
      <Sidebar
        isOpen={isSidebarOpen}
        className="block"
        onCloseAction={() => setIsSidebarOpen(false)}
      />
    </header>
  );
}
