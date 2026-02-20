// components/Layouts/shop/Header.tsx
"use client";

import React from "react";
import { Menu, User } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/app/provider";
import SwitchtoDarkMode from "@/components/Layouts/SwitchtoDarkMode";
import useLoginSession from "@/lib/useLoginSession";
import DesktopNav from "@/components/Layouts/shop/DesktopNav";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps = {}) {
  const session = useLoginSession();
  const { themeType } = useTheme();

  const handleAccountClick = () => {
    window.location.href = "/profile/me";
  };

  return (
    <header 
      data-layout="shop"
      className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--lt-border)] bg-[var(--lt-bg)] px-4 py-5 shadow-[var(--lt-shadow)] text-[var(--lt-fg)] md:px-5 2xl:px-10"
    >
      {/* LEFT (Mobile): Hamburger */}
      <button
        className="mobile-hamburger rounded-[var(--radius)] border border-[hsl(var(--border))] px-1.5 py-1 dark:border-[hsl(var(--sidebar-border))] dark:bg-[hsl(var(--background))] hover:dark:bg-[hsla(var(--background),0.1)] lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
        type="button"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </button>

      {/* CENTER: Logo */}
      <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
        <img
          src={
            themeType === "dark"
              ? "/images/home/dartlogowhite.svg"
              : "/images/home/dartlogo.svg"
          }
          alt="DART Logo"
          className="h-12 w-auto md:h-14"
        />
      </Link>

      {/* CENTER (Desktop): Desktop Nav */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <DesktopNav />
      </div>

      {/* RIGHT: Auth + Theme */}
      <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4">
        {/* Desktop Auth */}
        {!session ? (
          <Link
            href="/sign-in"
            className="font-medium text-sm whitespace-nowrap hover:underline transition-colors"
            aria-label="Sign in"
          >
            <span className="md:hidden">Sign In</span>
            <span className="hidden md:inline-flex items-center">
              <User className="w-5 h-5" aria-hidden="true" />
            </span>
          </Link>
        ) : (
          <button
            onClick={handleAccountClick}
            className="font-medium text-sm whitespace-nowrap hover:underline transition-colors"
            type="button"
            aria-label="Account"
          >
            <span className="md:hidden">Account</span>
            <span className="hidden md:inline-flex items-center">
              <User className="w-5 h-5" aria-hidden="true" />
            </span>
          </button>
        )}

        {/* Theme Switcher */}
        <div className="flex items-center justify-center">
          <SwitchtoDarkMode />
        </div>
      </div>
    </header>
  );
}