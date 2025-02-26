"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { generateSessionId } from "@/lib/utils";
import { fetchSearchSuggestions } from "@/lib/youtube-api";

export default function SearchBar({
  onCloseAction,
}: {
  onCloseAction?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async () => {
    if (query.trim()) {
      const fetchedSuggestions = await fetchSearchSuggestions(query);
      setSuggestions(fetchedSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  useEffect(() => {
    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent, submittedQuery: string = query) => {
    e.preventDefault();
    if (submittedQuery.trim()) {
      const sid = generateSessionId();
      router.push(
        `/results?search_query=${encodeURIComponent(
          submittedQuery
        )}&sid=${sid}&sort=relevance&date=${Date.now()}`
      );
      router.refresh();
      if (onCloseAction) onCloseAction();
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSubmit(new Event("submit") as unknown as React.FormEvent, suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm relative items-center space-x-2"
      >
        <Input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 outline-none rounded-full"
          ref={inputRef}
          onFocus={() => setShowSuggestions(true)}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute md:right-0 right-12"
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
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5"
        >
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex items-center px-4 py-2 text-sm hover:bg-accent cursor-pointer flex-shrink-0"
              >
                <Search className="h-4 w-4 mr-2 text-gray-500" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
