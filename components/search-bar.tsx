"use client";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function SearchBar() {
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    const query = searchRef.current?.value.trim();
    if (!query) return;
    router.push(`/search?query=${query}`);
    searchRef.current!.value = ""; 
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); 
      handleSearchSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="search"
        placeholder="Search"
        className="flex-1"
        ref={searchRef}
        onKeyDown={handleKeyDown}
      />
      <Button type="submit" size="icon">
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
}
