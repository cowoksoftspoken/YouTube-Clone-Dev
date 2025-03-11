"use client";

import {
  CreditCard,
  Globe,
  HelpCircle,
  Keyboard,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  User,
  Youtube,
} from "lucide-react";
import * as React from "react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./ui/dropdown-menu";
import { ModeToggle } from "./mode-toggle";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";

interface DropdownItemProps {
  icon: React.ElementType;
  onClick?: () => void;
  text: string;
}

export function AccountDropdown() {
  const { theme } = useTheme();

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const handleLogout = async () => await signOut();
  const { data: session } = useSession();
  return (
    <DropdownMenuContent
      align="end"
      className="w-64 dark:bg-[#202020] bg-white text-black dark:text-white"
    >
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="flex gap-3 items-center px-4 py-2 dark:hover:bg-slate-950 cursor-pointer">
          <User className="h-5 w-5 text-gray-400" />
          <span>Manage Account</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownItem
            icon={User}
            text="Your Channel"
            onClick={() =>
              (window.location.href = `/manage?accountName=${session?.user?.name}&authUser=1`)
            }
          />
          <DropdownItem
            icon={User}
            text="Google Account"
            onClick={() =>
              (window.location.href = "https://myaccount.google.com/")
            }
          />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownItem icon={User} text="Google Account" />
      <DropdownItem icon={User} text="Switch Account" />
      <DropdownItem
        icon={LogOut}
        text="Logout"
        onClick={() => handleLogout()}
      />
      <DropdownItem icon={Youtube} text="YouTube Studio" />
      <DropdownItem icon={CreditCard} text="Purchases and Subscriptions" />
      <DropdownItem icon={User} text="Your data on YouTube" />

      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="flex gap-3 items-center px-4 py-2 dark:hover:bg-slate-950 cursor-pointer">
          <ThemeIcon className="h-5 w-5 text-gray-400" />
          <span>
            Display:{" "}
            {theme === "dark"
              ? "Dark"
              : theme === "light"
              ? "Light"
              : "Device Theme"}
          </span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <ModeToggle />
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownItem icon={Globe} text="Language: English" />
      <DropdownItem icon={Sun} text="Limited mode: Non-active" />
      <DropdownItem icon={Globe} text="Location: Indonesia" />
      <DropdownItem icon={Keyboard} text="Keyboard Shortcuts" />
      <DropdownItem icon={Settings} text="Settings" />
      <DropdownItem icon={HelpCircle} text="Help" />
    </DropdownMenuContent>
  );
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  icon: Icon,
  text,
  onClick,
}) => (
  <DropdownMenuItem
    className="flex gap-3 items-center px-4 py-2 dark:hover:bg-slate-950 dark:text-white text-black cursor-pointer hover:bg-slate-100"
    onClick={onClick}
  >
    <Icon className="h-5 w-5 text-gray-400" />
    <span>{text}</span>
  </DropdownMenuItem>
);

export default AccountDropdown;
