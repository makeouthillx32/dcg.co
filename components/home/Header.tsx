"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTheme } from "@/app/provider";
import SwitchtoDarkMode from "@/components/SwitchtoDarkMode";
import useLoginSession from "@/lib/useLoginSession";
import MobileDrawer from "@/components/home/MobileDrawer";
import DesktopNav from "@/components/home/DesktopNav";

interface HeaderProps {
  theme: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navigateTo: (key: string) => (e?: React.MouseEvent) => void;
}

const Header: React.FC<HeaderProps> = ({ navigateTo }) => {
  const session = useLoginSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { themeType } = useTheme();

  return (
    <div className="relative"> {/* Add relative positioning container */}
      <header className="header-container bg-background text-foreground border-border">
        <div className="header-content">
          {/* Left: Logo */}
          <div className="header-logo">
            <a 
              href="#" 
              onClick={navigateTo("home")} 
              className="logo-link focus:ring-primary"
            >
              <img
                src={
                  themeType === "dark"
                    ? "/images/home/dartlogowhite.svg"
                    : "/images/home/dartlogo.svg"
                }
                alt="DART Logo"
                className="logo-image"
              />
            </a>
          </div>

          {/* Center: Desktop Nav */}
          <div className="header-nav">
            <DesktopNav navigateTo={navigateTo} />
          </div>

          {/* Right: Auth + Dark mode + Hamburger */}
          <div className="header-actions">
            {/* Desktop Auth */}
            <div className="header-auth">
              {!session ? (
                <a
                  href="/sign-in"
                  className="auth-button text-accent hover:text-accent focus:ring-accent"
                >
                  Sign In
                </a>
              ) : (
                <button
                  onClick={() => (window.location.href = "/auth/logout")}
                  className="auth-button text-destructive hover:text-destructive focus:ring-destructive"
                >
                  Log Out
                </button>
              )}
            </div>

            {/* Theme Switcher */}
            <div className="theme-switcher">
              <SwitchtoDarkMode />
            </div>

            {/* Mobile Hamburger */}
            <button
              className={`mobile-hamburger text-foreground focus:ring-primary ${
                mobileMenuOpen ? "menu-open" : ""
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="hamburger-icon" />
              ) : (
                <Menu className="hamburger-icon" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer - positioned relative to this container */}
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