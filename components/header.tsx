"use client";

import Link from "next/link";
import { Youtube, Bell, User, Menu, Search } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import SearchBar from "./search-bar";
import { useState } from "react";

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  return (
    <header className="sticky top-0 z-50 w-full  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-3 justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            <Youtube className="h-6 w-6 text-red-600" />
            <span className="font-bold sm:inline-block">YouTube</span>
          </Link>
        </div>
        <div className="flex-1 flex justify-center max-w-2xl md:max-w-sm mx-4">
          <div className="hidden md:flex md:w-[400px] lg:w-[600px]">
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
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed top-0 left-0 right-0 p-4 bg-background border-b">
            <SearchBar onCloseAction={() => setIsSearchOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
