"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/provider";
import Link from "next/link";
import SwitchtoDarkMode from "./SwitchtoDarkMode";
import { CustomDropdown } from "@/components/Layouts/appheader/dropdown-menu";

interface NavProps {
  pageTitle?: string;
}

const Nav: React.FC<NavProps> = ({ pageTitle }) => {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";
  const pathname = usePathname();

  return (
    <nav
      className={`flex justify-between items-center p-4 transition-colors ${
        isDark 
          ? "bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]" 
          : "bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]"
      } shadow-[var(--shadow-sm)]`}
    >
      <div className="flex items-center gap-3">
        {/* Logo - Now clickable and takes you to home */}
        <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
          <img
            src={
              themeType === "dark"
                ? "/images/home/dartlogowhite.svg"
                : "/images/home/dartlogo.svg"
            }
            alt="DART Logo"
            className="h-10 w-auto cursor-pointer"
          />
        </Link>
        
        {/* Page Title Only */}
        {pageTitle && (
          <h1 className="text-lg font-medium font-[var(--font-sans)]">
            {pageTitle}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <SwitchtoDarkMode />
        {/* Dropdown menu */}
        <div className="relative z-10">
          <CustomDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Nav;