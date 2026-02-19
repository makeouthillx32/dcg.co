// components/Layouts/shop/Header.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/app/provider";
import SwitchtoDarkMode from "@/components/Layouts/SwitchtoDarkMode";
import useLoginSession from "@/lib/useLoginSession";
import MobileDrawer from "@/components/Layouts/shop/MobileDrawer";
import DesktopNav from "@/components/Layouts/shop/DesktopNav";

const Header: React.FC = () => {
  const session = useLoginSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { themeType } = useTheme();

  const handleAccountClick = () => {
    window.location.href = "/profile/me";
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Prevent background scroll when drawer is open (mobile)
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileMenuOpen]);

  // Force-close mobile drawer when switching to desktop
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleResize = () => {
      if (mediaQuery.matches) {
        setMobileMenuOpen(false);
        document.body.style.overflow = "";
      }
    };

    // Run once on mount (important if page loads wide)
    handleResize();

    // Listen for breakpoint change
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleResize);
    } else {
      mediaQuery.addListener(handleResize); // Safari fallback
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleResize);
      } else {
        mediaQuery.removeListener(handleResize);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* ✅ MOVED data-layout="shop" TO THE HEADER ELEMENT */}
      <header 
        data-layout="shop"
        className="header-container bg-[var(--lt-bg)] text-[var(--lt-fg)] border-[var(--lt-border)]"
      >
        <div className="header-content">
          {/* LEFT (Mobile): Hamburger */}
          <div className="header-left">
            <button
              className={`mobile-hamburger text-[var(--lt-fg)] focus:ring-primary ${
                mobileMenuOpen ? "menu-open" : ""
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              type="button"
            >
              {mobileMenuOpen ? (
                <X className="hamburger-icon" />
              ) : (
                <Menu className="hamburger-icon" />
              )}
            </button>
          </div>

          {/* CENTER: Logo */}
          <div className="header-logo">
            <Link href="/" className="logo-link focus:ring-primary">
              <img
                src={
                  themeType === "dark"
                    ? "/images/home/dartlogowhite.svg"
                    : "/images/home/dartlogo.svg"
                }
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
            {/* Desktop Auth */}
            <div className="header-auth">
              {!session ? (
                <Link
                  href="/sign-in"
                  className="auth-button text-[var(--lt-fg)] hover:text-[var(--lt-fg)] focus:ring-primary"
                  aria-label="Sign in"
                >
                  {/* Mobile: text */}
                  <span className="md:hidden">Sign In</span>

                  {/* Desktop: icon */}
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
                  {/* Mobile: text */}
                  <span className="md:hidden">Account</span>

                  {/* Desktop: icon */}
                  <span className="hidden md:inline-flex items-center text-[var(--lt-fg)] hover:text-primary transition-colors">
                    <User className="w-5 h-5" aria-hidden="true" />
                  </span>
                </button>
              )}
            </div>

            {/* Theme Switcher */}
            <div className="theme-switcher text-[var(--lt-fg)] hover:text-primary transition-colors">
              <SwitchtoDarkMode />
            </div>
          </div>
        </div>
      </header>

      {/* Overlay + Left Drawer Shell (mobile only via SCSS) */}
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-drawer-overlay"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          <div className="mobile-drawer-shell" role="dialog" aria-modal="true">
            <MobileDrawer session={session} onClose={closeMobileMenu} />
          </div>
        </>
      )}
    </div>
  );
};

export default Header;