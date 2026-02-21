// components/Layouts/shop/Header.tsx
"use client";

import React, { useEffect } from "react";
import { Menu, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme, useAuth, useIOSSessionRefresh } from "@/app/provider";
import SwitchtoDarkMode from "@/components/Layouts/SwitchtoDarkMode";
import DesktopNav from "@/components/Layouts/shop/DesktopNav";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps = {}) {
  const pathname = usePathname();

  // ✅ real-time session (but server-action auth needs a refresh trigger)
  const { session } = useAuth();
  const { refreshSession } = useIOSSessionRefresh();
  const { themeType } = useTheme();

  // ✅ KEY FIX:
  // When you come back from /sign-in (server action redirect),
  // force a client-side session refresh so the header updates without hard refresh.
  useEffect(() => {
    refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleAccountClick = () => {
    window.location.href = "/profile/me";
  };

  return (
    <header
      data-layout="shop"
      className="header-container bg-[var(--lt-bg)] text-[var(--lt-fg)] border-b border-[var(--lt-border)]"
    >
      <div className="header-content">
        {/* LEFT (Mobile): Hamburger */}
        <div className="header-left">
          <button
            className="mobile-hamburger text-[var(--lt-fg)] focus:ring-primary"
            onClick={onMenuClick}
            aria-label="Open menu"
            type="button"
          >
            <Menu className="hamburger-icon" />
          </button>
        </div>

        {/* CENTER: Logo */}
        <div className="header-logo">
          <Link href="/" className="logo-link focus:ring-primary">
            <img
              src={themeType === "dark" ? "/images/home/dartlogowhite.svg" : "/images/home/dartlogo.svg"}
              alt="DART Logo"
              className="logo-image"
            />
          </Link>
        </div>

        {/* CENTER (Desktop): Desktop Nav */}
        <div className="header-nav">
          <DesktopNav />
        </div>

        {/* RIGHT: Auth + Theme */}
        <div className="header-actions">
          <div className="header-auth">
            {!session ? (
              <Link
                href="/sign-in"
                className="auth-button text-[var(--lt-fg)] hover:text-[var(--lt-fg)] focus:ring-primary"
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
                className="auth-button text-[var(--lt-fg)] hover:text-[var(--lt-fg)] focus:ring-primary"
                type="button"
                aria-label="Account"
              >
                <span className="md:hidden">Account</span>
                <span className="hidden md:inline-flex items-center text-[var(--lt-fg)] hover:text-primary transition-colors">
                  <User className="w-5 h-5" aria-hidden="true" />
                </span>
              </button>
            )}
          </div>

          <div className="theme-switcher text-[var(--lt-fg)] hover:text-primary transition-colors">
            <SwitchtoDarkMode />
          </div>
        </div>
      </div>
    </header>
  );
}