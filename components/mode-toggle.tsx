"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setTheme("light")}
        className="cursor-pointer"
      >
        <Sun className="h-4 w-4 mr-2 text-yellow-500" />
        Light {theme === "light" && "✓"}
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setTheme("dark")}
        className="cursor-pointer"
      >
        <Moon className="h-4 w-4 mr-2 text-gray-400" />
        Dark {theme === "dark" && "✓"}
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setTheme("system")}
        className="cursor-pointer"
      >
        <Monitor className="h-4 w-4 mr-2 text-blue-500" />
        System {theme === "system" && "✓"}
      </DropdownMenuItem>
    </>
  );
}
