"use client";

import React, { useState, useRef, useEffect } from "react";
import { MdExpandMore, MdChevronRight, MdArrowForwardIos } from "react-icons/md";
import { X } from "lucide-react";
import { navTree } from "@/lib/navTree";
import "./_components/Mobile.scss";

interface MobileDrawerProps {
  navigateTo: (id: string) => (e?: React.MouseEvent<HTMLAnchorElement>) => void;
  session: any;
  onClose: () => void;
}

export default function MobileDrawer({
  navigateTo,
  session,
  onClose,
}: MobileDrawerProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => (prev === key ? null : key));
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 400);
  };

  const handleClickAndClose =
    (key: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      navigateTo(key)(e);
      handleClose();
    };

  const handleAccountClick = () => {
    window.location.href = "/profile/me";
    handleClose();
  };

  return (
    <div
      ref={menuRef}
      className={`drawer-content ${
        isClosing ? "animate-slide-up" : "animate-slide-down"
      }`}
    >
      {/* ===== Top Bar ===== */}
      <div className="drawer-topbar">
        <button
          type="button"
          className="drawer-close-button text-foreground"
          onClick={handleClose}
          aria-label="Close menu"
        >
          <X size={22} />
        </button>
      </div>

      {/* ===== Top Divider ===== */}
      <div className="drawer-divider-horizontal" />

      <div className="mobile-menu-container bg-background">
        {navTree.map((node) => (
          <div key={node.key} className="mobile-section">
            {/* Section top divider */}
            <div className="drawer-divider-horizontal" />

            <div className="mobile-menu-item text-foreground">
              <a
                href="#"
                onClick={handleClickAndClose(node.key)}
                className="menu-link text-foreground no-underline"
              >
                {node.label}
              </a>

              {/* Vertical divider before icon */}
              <div className="drawer-divider-vertical" />

              {node.children ? (
                <button
                  onClick={() => toggleExpand(node.key)}
                  className="menu-toggle text-foreground"
                  aria-label={`Toggle ${node.label}`}
                >
                  {expanded === node.key ? (
                    <MdExpandMore size={20} />
                  ) : (
                    <MdChevronRight size={20} />
                  )}
                </button>
              ) : (
                <span className="menu-icon-slot" aria-hidden="true">
                  <MdArrowForwardIos size={14} />
                </span>
              )}
            </div>

            {node.children && expanded === node.key && (
              <div className="mobile-submenu bg-background">
                {node.children.map((child) => (
                  <a
                    key={child.key}
                    href="#"
                    onClick={handleClickAndClose(child.key)}
                    className="submenu-link text-foreground no-underline"
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Auth */}
        <div className="drawer-divider-horizontal" />

        <div className="mobile-auth-section bg-background">
          {!session ? (
            <a
              href="/sign-in"
              onClick={handleClose}
              className="auth-button text-accent no-underline"
            >
              Sign In
            </a>
          ) : (
            <button
              onClick={handleAccountClick}
              className="auth-button text-accent"
            >
              Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
