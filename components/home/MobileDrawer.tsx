"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { MdExpandMore, MdChevronRight, MdArrowForwardIos } from "react-icons/md";
import { useRouter } from "next/navigation";
import { navTree } from "@/lib/navTree";
import "./_components/Mobile.scss";

type NavNode = {
  key: string;
  label: string;
  href: string;
  children?: readonly NavNode[];
};

interface MobileDrawerProps {
  // NOTE: legacy prop from the old single-page hash navigation.
  // We'll keep it so nothing breaks upstream, but we won't use it.
  navigateTo: (id: string) => (e?: React.MouseEvent<HTMLAnchorElement>) => void;

  session: any;
  onClose: () => void;
}

export default function MobileDrawer({ session, onClose }: MobileDrawerProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Track expanded items (supports multi-level)
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const [isClosing, setIsClosing] = useState(false);

  const tree = useMemo(() => navTree as unknown as readonly NavNode[], []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 400);
  }, [onClose]);

  const toggleExpand = useCallback((key: string) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const goHref = useCallback(
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      router.push(href);
      handleClose();
    },
    [router, handleClose]
  );

  const renderNodes = (nodes: readonly NavNode[], depth = 0) => {
    return nodes.map((node) => {
      const hasChildren = !!node.children?.length;
      const isExpanded = !!expandedKeys[node.key];

      return (
        <div key={node.key} className={`dcg-mobile-item dcg-depth-${depth}`}>
          <div className="mobile-menu-item text-foreground hover:bg-secondary">
            <a
              href={node.href}
              onClick={goHref(node.href)}
              className="menu-link focus:outline-none text-foreground no-underline"
            >
              {node.label}
            </a>

            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node.key)}
                className="menu-toggle text-foreground"
                aria-label={`Toggle ${node.label}`}
                aria-expanded={isExpanded}
              >
                {isExpanded ? <MdExpandMore size={20} /> : <MdChevronRight size={20} />}
              </button>
            ) : (
              <MdArrowForwardIos size={14} className="ml-2 text-muted-foreground" />
            )}
          </div>

          {hasChildren && isExpanded && (
            <div className="mobile-submenu bg-background">
              {renderNodes(node.children!, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      ref={menuRef}
      className={`drawer-content md:hidden ${isClosing ? "animate-slide-up" : "animate-slide-down"}`}
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        zIndex: 50,
        maxHeight: "calc(100vh - 4rem)",
        overflowY: "auto",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      }}
    >
      <div className="mobile-menu-container bg-background border-b border-border shadow-lg rounded-b-xl">
        {renderNodes(tree)}

        <div className="mobile-auth-section border-t border-border bg-background">
          {!session ? (
            <a
              href="/sign-in"
              onClick={(e) => {
                e.preventDefault();
                router.push("/sign-in");
                handleClose();
              }}
              className="auth-button text-accent hover:bg-secondary no-underline"
            >
              Sign In
            </a>
          ) : (
            <button
              onClick={() => {
                window.location.href = "/auth/logout";
                handleClose();
              }}
              className="auth-button text-destructive hover:bg-secondary"
            >
              Log Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}