"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// ✅ fallback to old dummy nav so UI always shows something
import { navTree as fallbackNavTree } from "@/lib/navTree";

import "./_components/Desktop.scss";

type NavNode = {
  key: string;
  label: string;
  children?: NavNode[];
};

interface DesktopNavProps {
  navigateTo: (key: string) => (e?: React.MouseEvent) => void;
}

function mapDbTreeToNavNodes(dbNodes: any[]): NavNode[] {
  return (dbNodes ?? []).map((n: any) => ({
    key: n.slug,
    label: n.name,
    children: (n.children ?? []).map((c: any) => ({
      key: c.slug,
      label: c.name,
      children: (c.children ?? []).map((cc: any) => ({
        key: cc.slug,
        label: cc.name,
      })),
    })),
  }));
}

export default function DesktopNav({ navigateTo }: DesktopNavProps) {
  // ✅ start with fallback so it renders immediately
  const [navTree, setNavTree] = useState<NavNode[]>(
    (fallbackNavTree as any[]).map((n) => ({
      key: n.key,
      label: n.label,
      children: n.children?.map((c: any) => ({ key: c.key, label: c.label })) ?? undefined,
    }))
  );

  const [openKey, setOpenKey] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const navRefs = useRef<(HTMLElement | null)[]>([]);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ✅ Fetch DB-backed nav (and swap in if it works)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/nav", { cache: "no-store" });

        if (!res.ok) {
          console.error("Nav fetch failed:", res.status);
          return;
        }

        const json = await res.json();

        if (!json?.ok) {
          console.error("Nav API returned error:", json?.error);
          return;
        }

        const mapped = mapDbTreeToNavNodes(json.data);
        if (!cancelled && mapped.length) setNavTree(mapped);
      } catch (e) {
        console.error("Nav fetch exception:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const getDropdownAlignment = (index: number) => {
    if (typeof window === "undefined") return "dropdown-align-center";
    const navItem = navRefs.current[index];
    if (!navItem) return "dropdown-align-center";

    const rect = navItem.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    if (rect.right > viewportWidth - 200) return "dropdown-align-right";
    if (rect.left < 200) return "dropdown-align-left";
    return "dropdown-align-center";
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isClickInsideNav = navRefs.current.some((ref) =>
        ref?.contains(event.target as Node)
      );
      const isClickInsideDropdown = dropdownRefs.current.some((ref) =>
        ref?.contains(event.target as Node)
      );

      if (!isClickInsideNav && !isClickInsideDropdown) {
        setOpenKey(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = (key: string) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setOpenKey(key);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setOpenKey(null), 150);
    setHoverTimeout(timeout);
  };

  const handleDropdownMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
  };

  const handleDropdownMouseLeave = () => {
    const timeout = setTimeout(() => setOpenKey(null), 100);
    setHoverTimeout(timeout);
  };

  const handleNavClick =
    (key: string, hasChildren: boolean) => (e: React.MouseEvent) => {
      if (hasChildren) {
        e.preventDefault();
        setOpenKey(openKey === key ? null : key);
      } else {
        navigateTo(key)(e);
        setOpenKey(null);
      }
    };

  const handleSubmenuClick = (key: string) => (e: React.MouseEvent) => {
    navigateTo(key)(e);
    setOpenKey(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const node = navTree[index];
    if (!node) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (node.children?.length) {
          setOpenKey(node.key);
          setTimeout(() => {
            const firstItem = document.querySelector(
              `[data-parent="${node.key}"] a`
            ) as HTMLElement | null;
            firstItem?.focus();
          }, 10);
        }
        break;

      case "ArrowRight": {
        e.preventDefault();
        const nextIndex = index < navTree.length - 1 ? index + 1 : 0;
        navRefs.current[nextIndex]?.focus();
        break;
      }

      case "ArrowLeft": {
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : navTree.length - 1;
        navRefs.current[prevIndex]?.focus();
        break;
      }

      case "Escape":
        e.preventDefault();
        setOpenKey(null);
        break;

      case "Enter":
      case " ":
        if (node.children?.length) {
          e.preventDefault();
          setOpenKey(openKey === node.key ? null : node.key);
        }
        break;
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  return (
    <nav className="nav-container" aria-label="Primary">
      <div className="nav-menu">
        {navTree.map((node, index) => (
          <div
            key={node.key}
            className="nav-item relative"
            onMouseEnter={() => node.children?.length && handleMouseEnter(node.key)}
            onMouseLeave={node.children?.length ? handleMouseLeave : undefined}
          >
            {node.children?.length ? (
              <>
                <button
                  ref={(el) => {
                    navRefs.current[index] = el;
                  }}
                  className="nav-top-link text-foreground hover:text-primary bg-transparent border-none cursor-pointer transition-colors duration-200 px-4 py-2 rounded-md hover:bg-muted/50"
                  onClick={handleNavClick(node.key, true)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  aria-expanded={openKey === node.key}
                  aria-haspopup="true"
                  tabIndex={0}
                  data-state={openKey === node.key ? "open" : "closed"}
                  type="button"
                >
                  {node.label}
                  <span
                    className={`ml-1 inline-flex items-center transition-transform duration-200 ${
                      openKey === node.key ? "rotate-180" : "rotate-0"
                    }`}
                    aria-hidden="true"
                  >
                    <ChevronDown size={14} strokeWidth={1.75} />
                  </span>
                </button>

                <div
                  ref={(el) => {
                    dropdownRefs.current[index] = el;
                  }}
                  className={`nav-dropdown bg-popover border border-border shadow-lg rounded-md ${getDropdownAlignment(
                    index
                  )} ${openKey === node.key ? "block animate-fade-in" : "hidden"}`}
                  data-state={openKey === node.key ? "open" : "closed"}
                  data-parent={node.key}
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                  role="menu"
                  aria-label={`${node.label} submenu`}
                >
                  <div className="p-2">
                    {node.children.map((child) => (
                      <a
                        key={child.key}
                        href={`#${child.key}`}
                        onClick={handleSubmenuClick(child.key)}
                        className="nav-sub-link block text-popover-foreground hover:text-primary hover:bg-muted/50 no-underline px-3 py-2 rounded-sm transition-colors duration-150 text-sm"
                        role="menuitem"
                        tabIndex={openKey === node.key ? 0 : -1}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <a
                ref={(el) => {
                  navRefs.current[index] = el;
                }}
                href={`#${node.key}`}
                onClick={handleNavClick(node.key, false)}
                className="nav-top-link text-foreground hover:text-primary no-underline transition-colors duration-200 px-4 py-2 rounded-md hover:bg-muted/50 inline-block"
                onKeyDown={(e) => handleKeyDown(e, index)}
                tabIndex={0}
              >
                {node.label}
              </a>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
