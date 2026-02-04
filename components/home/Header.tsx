"use client";

import React, { useMemo, useState } from "react";
import { Menu, X, Search, User, ShoppingBag } from "lucide-react";
import { useTheme } from "@/app/provider";
import SwitchtoDarkMode from "@/components/SwitchtoDarkMode";
import useLoginSession from "@/lib/useLoginSession";
import MobileDrawer from "@/components/home/MobileDrawer";
import DesktopNav from "@/components/home/DesktopNav";
import { useRouter } from "next/navigation";

interface HeaderProps {
  navigateTo: (key: string) => (e?: React.MouseEvent) => void;
}

const Header: React.FC<HeaderProps> = ({ navigateTo }) => {
  const router = useRouter();
  const session = useLoginSession();
  const { themeType } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  // TODO later: replace with real cart count from Supabase / context
  const cartCount = 0;

  const brand = useMemo(
    () => ({
      name: "Desert Cowgirl",
      // optional: feels boutique-y without saying “rodeo”
      tagline: "Western-inspired clothing & accessories",
      logoLight: "/images/brand/logo-light.svg", // change when you have it
      logoDark: "/images/brand/logo-dark.svg",   // change when you have it
      fallbackLogo: "/images/brand/logo.svg",    // change when you have it
    }),
    []
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setMobileMenuOpen(false);
  };

  const go = (href: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    router.push(href);
    setMobileMenuOpen(false);
  };

  return (
    <div className="relative">
      {/* Announcement Bar */}
      <div className="dcg-announcement bg-[var(--primary)] text-[var(--primary-foreground)]">
        <div className="dcg-announcement-inner">
          <span>Free shipping over $75 • New drops every week</span>
        </div>
      </div>

      <header className="dcg-header bg-background text-foreground border-border">
        <div className="dcg-header-inner">
          {/* Left: Brand */}
          <div className="dcg-brand">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                // keep your existing flow for now
                navigateTo("home")(e);
                setMobileMenuOpen(false);
              }}
              className="dcg-brand-link"
            >
              <img
                src={
                  themeType === "dark"
                    ? brand.logoDark
                    : brand.logoLight
                }
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = brand.fallbackLogo;
                }}
                alt={`${brand.name} logo`}
                className="dcg-brand-logo"
              />
              <div className="dcg-brand-text">
                <div className="dcg-brand-name">{brand.name}</div>
                <div className="dcg-brand-tagline">{brand.tagline}</div>
              </div>
            </a>
          </div>

          {/* Center: Desktop Nav */}
          <div className="dcg-nav-wrap">
            <DesktopNav navigateTo={navigateTo} />
          </div>

          {/* Right: Search + Actions */}
          <div className="dcg-actions">
            {/* Search (desktop) */}
            <form onSubmit={handleSearchSubmit} className="dcg-search">
              <Search className="dcg-search-icon" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="dcg-search-input"
                aria-label="Search products"
              />
            </form>

            {/* Account */}
            <button
              onClick={() => {
                if (!session) router.push("/sign-in");
                else router.push("/account");
              }}
              className="dcg-icon-btn"
              aria-label={session ? "Account" : "Sign in"}
              title={session ? "Account" : "Sign in"}
            >
              <User className="dcg-icon" />
            </button>

            {/* Cart */}
            <button
              onClick={go("/cart")}
              className="dcg-icon-btn dcg-cart-btn"
              aria-label="Cart"
              title="Cart"
            >
              <ShoppingBag className="dcg-icon" />
              {cartCount > 0 ? <span className="dcg-cart-badge">{cartCount}</span> : null}
            </button>

            {/* Theme */}
            <div className="dcg-theme">
              <SwitchtoDarkMode />
            </div>

            {/* Mobile Hamburger */}
            <button
              className="dcg-mobile-hamburger"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="dcg-hamburger-icon" /> : <Menu className="dcg-hamburger-icon" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <MobileDrawer
          navigateTo={navigateTo}
          session={session}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Header;