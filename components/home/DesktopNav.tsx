"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { navTree } from "@/lib/navTree";
import "./_components/Desktop.scss";

type NavNode = {
  key: string;
  label: string;
  href: string;
  children?: readonly NavNode[];
};

interface DesktopNavProps {
  // legacy prop from hash-navigation (keep so header doesn’t break)
  navigateTo: (key: string) => (e?: React.MouseEvent) => void;
}

export default function DesktopNav(_: DesktopNavProps) {
  const router = useRouter();

  const [openKey, setOpenKey] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // refs for alignment + outside click
  const navRefs = useRef<(HTMLElement | null)[]>([]);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  const tree = useMemo(() => navTree as unknown as readonly NavNode[], []);

  // Smart dropdown positioning
  const getDropdownAlignment = (index: number) => {
    if (typeof window === "undefined") return "dcg-dropdown-align-center";

    const navItem = navRefs.current[index];
    if (!navItem) return "dcg-dropdown-align-center";

    const rect = navItem.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    if (rect.right > viewportWidth - 240) return "dcg-dropdown-align-right";
    if (rect.left < 240) return "dcg-dropdown-align-left";
    return "dcg-dropdown-align-center";
  };

  // Close dropdown when clicking outside
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

  const goHref = useCallback(
    (href: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      router.push(href);
      setOpenKey(null);
    },
    [router]
  );

  // Hover open/close (prevents flicker)
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

  // Click behavior:
  // - if has children: toggle dropdown (don’t navigate)
  // - if no children: navigate immediately
  const handleTopClick = (node: NavNode) => (e: React.MouseEvent) => {
    if (node.children?.length) {
      e.preventDefault();
      setOpenKey(openKey === node.key ? null : node.key);
      return;
    }
    goHref(node.href)(e);
  };

  // Keyboard navigation (top-level only)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const node = tree[index];

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
        const nextIndex = index < tree.length - 1 ? index + 1 : 0;
        navRefs.current[nextIndex]?.focus();
        break;
      }

      case "ArrowLeft": {
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : tree.length - 1;
        navRefs.current[prevIndex]?.focus();
        break;
      }

      case "Escape":
        e.preventDefault();
        setOpenKey(null);
        break;

      case "Enter":
      case " ": {
        if (node.children?.length) {
          e.preventDefault();
          setOpenKey(openKey === node.key ? null : node.key);
        } else {
          // navigate on Enter for leaf nodes
          // (space should still toggle only if it has children)
          if (e.key === "Enter") {
            router.push(node.href);
            setOpenKey(null);
          }
        }
        break;
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  // --- 2-level dropdown layout renderer (Shopify-like) ---
  // 1st level: dropdown shows category list
  // 2nd level: if child has children, show flyout panel to the right
  const renderDropdown = (parent: NavNode, parentIndex: number) => {
    if (!parent.children?.length) return null;

    return (
      <div
        ref={(el) => {
          dropdownRefs.current[parentIndex] = el;
        }}
        className={`dcg-nav-dropdown ${getDropdownAlignment(parentIndex)} ${
          openKey === parent.key ? "dcg-open" : "dcg-closed"
        }`}
        data-parent={parent.key}
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleDropdownMouseLeave}
        role="menu"
        aria-label={`${parent.label} submenu`}
      >
        <div className="dcg-dropdown-inner">
          <ul className="dcg-dropdown-col" role="none">
            {parent.children.map((child) => {
              const hasFlyout = !!child.children?.length;

              return (
                <li
                  key={child.key}
                  className={`dcg-dropdown-item ${hasFlyout ? "dcg-has-flyout" : ""}`}
                  role="none"
                >
                  <a
                    href={child.href}
                    onClick={goHref(child.href)}
                    className="dcg-sub-link"
                    role="menuitem"
                    tabIndex={openKey === parent.key ? 0 : -1}
                    onMouseEnter={() => {
                      // only open flyouts on hover for items that have children
                      // keep parent dropdown open
                    }}
                  >
                    {child.label}
                  </a>

                  {hasFlyout ? (
                    <div className="dcg-flyout" role="menu" aria-label={`${child.label} flyout`}>
                      <div className="dcg-flyout-inner">
                        {child.children!.map((grand) => (
                          <a
                            key={grand.key}
                            href={grand.href}
                            onClick={goHref(grand.href)}
                            className="dcg-flyout-link"
                            role="menuitem"
                            tabIndex={openKey === parent.key ? 0 : -1}
                          >
                            {grand.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <nav className="dcg-nav-container">
      <div className="dcg-nav-menu">
        {tree.map((node, index) => {
          const hasChildren = !!node.children?.length;

          return (
            <div
              key={node.key}
              className="dcg-nav-item"
              onMouseEnter={() => (hasChildren ? handleMouseEnter(node.key) : undefined)}
              onMouseLeave={hasChildren ? handleMouseLeave : undefined}
            >
              {hasChildren ? (
                <>
                  <button
                    ref={(el) => {
                      navRefs.current[index] = el;
                    }}
                    className="dcg-nav-top-link"
                    onClick={handleTopClick(node)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    aria-expanded={openKey === node.key}
                    aria-haspopup="true"
                    tabIndex={0}
                    data-state={openKey === node.key ? "open" : "closed"}
                    type="button"
                  >
                    {node.label}
                    <span className={`dcg-caret ${openKey === node.key ? "dcg-rot" : ""}`}>
                      ▼
                    </span>
                  </button>

                  {renderDropdown(node, index)}
                </>
              ) : (
                <a
                  ref={(el) => {
                    navRefs.current[index] = el;
                  }}
                  href={node.href}
                  onClick={goHref(node.href)}
                  className="dcg-nav-top-link dcg-as-link"
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  tabIndex={0}
                >
                  {node.label}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}