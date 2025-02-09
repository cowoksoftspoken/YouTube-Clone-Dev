"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { generateSessionId } from "@/lib/utils";

export default function SearchBar({
  onCloseAction,
}: {
  onCloseAction?: () => void;
}) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const sid = generateSessionId();
      router.push(
        `/results?search_query=${encodeURIComponent(
          query
        )}&sid=${sid}&sort=relevance&date=${Date.now()}`
      );
      router.refresh();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm relative items-center space-x-2"
    >
      <Input
        type="search"
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 outline-none rounded-full"
      />
      <Button
        type="submit"
        size="icon"
        className="absolute right-0"
        variant="ghost"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
      {onCloseAction && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onCloseAction}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      )}
    </form>
  );
}
