"use client";

import React, { useState, useRef, useEffect } from "react";
import { MdExpandMore, MdChevronRight, MdArrowForwardIos } from "react-icons/md";
import { X } from "lucide-react";
import Link from "next/link";
import type { NavNode as UnifiedNavNode } from "@/lib/navigation";
import "./_components/Mobile.scss";

// Simplified nav node for mobile rendering
type NavNode = {
  key: string;
  label: string;
  href: string;
  routeType: "real" | "hash";
  children?: NavNode[];
};

interface MobileDrawerProps {
  session: any;
  onClose: () => void;
}

/**
 * Transform unified nav nodes to mobile-friendly format
 * Only keep categories and flatten to 2 levels max
 */
function transformNavTree(nodes: UnifiedNavNode[]): NavNode[] {
  return nodes
    .filter((node) => {
      // Only show categories and collections in mobile nav
      return node.type === "category" || node.type === "collection";
    })
    .map((node) => ({
      key: node.key,
      label: node.label,
      href: node.href,
      routeType: node.routeType,
      children: node.children
        ? node.children
            .filter((child) => child.type === "category" || child.type === "collection")
            .map((child) => ({
              key: child.key,
              label: child.label,
              href: child.href,
              routeType: child.routeType,
              // Don't include grandchildren in mobile for simplicity
            }))
        : undefined,
    }));
}

export default function MobileDrawer({ session, onClose }: MobileDrawerProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [navTree, setNavTree] = useState<NavNode[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch navigation tree from API
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/navigation/tree", { 
          cache: "no-store",
          next: { revalidate: 300 } // 5 minutes
        });
        
        if (!res.ok) {
          console.error("Navigation fetch failed:", res.status);
          setLoading(false);
          return;
        }

        const json = await res.json();
        
        if (!json?.nodes) {
          console.error("Invalid navigation response:", json);
          setLoading(false);
          return;
        }

        const transformed = transformNavTree(json.nodes);

        if (!cancelled) {
          setNavTree(transformed);
          setLoading(false);
        }
      } catch (e) {
        console.error("Navigation fetch error:", e);
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, routeType: string) => {
    if (routeType === "hash") {
      // Hash navigation - let browser handle it
      handleClose();
    } else {
      // Real route - Next.js Link will handle it
      handleClose();
    }
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
          className="drawer-close-button text-[var(--lt-fg)]"
          onClick={handleClose}
          aria-label="Close menu"
        >
          <X size={22} />
        </button>
      </div>

      {/* ===== Top Divider ===== */}
      <div className="drawer-divider-horizontal" />

      {/* ✅ CRITICAL FIX: Ensure mobile menu inherits layout tokens */}
      <div className="mobile-menu-container" style={{
        backgroundColor: 'var(--lt-bg)',
        color: 'var(--lt-fg)'
      }}>
        {loading ? (
          // Loading skeleton
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Loading navigation...
          </div>
        ) : navTree.length === 0 ? (
          // Empty state
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No categories available
          </div>
        ) : (
          // Navigation items
          navTree.map((node) => (
            <div key={node.key} className="mobile-section">
              {/* Section top divider */}
              <div className="drawer-divider-horizontal" />

              <div className="mobile-menu-item" style={{ color: 'var(--lt-fg)' }}>
                {node.routeType === "hash" ? (
                  // Hash navigation (static pages)
                  <a
                    href={node.href}
                    onClick={(e) => handleNavClick(e, node.routeType)}
                    className="menu-link no-underline"
                    style={{ color: 'var(--lt-fg)' }}
                  >
                    {node.label}
                  </a>
                ) : (
                  // Real route (categories/collections)
                  <Link
                    href={node.href}
                    onClick={(e) => handleNavClick(e, node.routeType)}
                    className="menu-link no-underline"
                    style={{ color: 'var(--lt-fg)' }}
                  >
                    {node.label}
                  </Link>
                )}

                {/* Vertical divider before icon */}
                <div className="drawer-divider-vertical" />

                {node.children?.length ? (
                  <button
                    onClick={() => toggleExpand(node.key)}
                    className="menu-toggle"
                    style={{ color: 'var(--lt-fg)' }}
                    aria-label={`Toggle ${node.label}`}
                    type="button"
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

              {/* Submenu */}
              {node.children?.length && expanded === node.key && (
                <div className="mobile-submenu" style={{ backgroundColor: 'var(--lt-bg)' }}>
                  {node.children.map((child) => (
                    <React.Fragment key={child.key}>
                      {child.routeType === "hash" ? (
                        <a
                          href={child.href}
                          onClick={(e) => handleNavClick(e, child.routeType)}
                          className="submenu-link no-underline"
                          style={{ color: 'var(--lt-fg)' }}
                        >
                          {child.label}
                        </a>
                      ) : (
                        <Link
                          href={child.href}
                          onClick={(e) => handleNavClick(e, child.routeType)}
                          className="submenu-link no-underline"
                          style={{ color: 'var(--lt-fg)' }}
                        >
                          {child.label}
                        </Link>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {/* Auth Section */}
        <div className="drawer-divider-horizontal" />

        <div className="mobile-auth-section bg-background">
          {!session ? (
            <Link
              href="/sign-in"
              onClick={handleClose}
              className="auth-button text-accent no-underline"
            >
              Sign In
            </Link>
          ) : (
            <button
              onClick={handleAccountClick}
              className="auth-button text-accent"
              type="button"
            >
              Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}