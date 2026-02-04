"use client";

import React, { useState, useRef, useEffect } from "react";
import { MdExpandMore, MdChevronRight, MdArrowForwardIos } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { navTree } from "@/lib/navTree";
import "./_components/Mobile.scss";

interface MobileDrawerProps {
  // keep it for now so Header doesn't break, but we won't use it here
  navigateTo?: (id: string) => (e?: React.MouseEvent<HTMLAnchorElement>) => void;
  session: any;
  onClose: () => void;
}

export default function MobileDrawer({ session, onClose }: MobileDrawerProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // track expanded keys independently (supports multi-level)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
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
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 400);
  };

  const go = (href: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    router.push(href);
    handleClose();
  };

  const renderNode = (node: any, level: number = 0) => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const isOpen = !!expanded[node.key];

    // styles per level
    const itemClass =
      level === 0
        ? "mobile-menu-item"
        : level === 1
        ? "submenu-link"
        : "submenu-link pl-8";

    const wrapperClass =
      level === 0 ? "" : level === 1 ? "mobile-submenu" : "mobile-submenu";

    return (
      <div key={node.key}>
        <div className={`${itemClass} text-foreground hover:bg-secondary`}>
          {/* Use href now (Shopify-style routing) */}
          <a
            href={node.href}
            onClick={go(node.href)}
            className="menu-link focus:outline-none text-foreground no-underline flex-1"
          >
            {node.label}
          </a>

          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node.key)}
              className="menu-toggle text-foreground"
              aria-label={`Toggle ${node.label}`}
              type="button"
            >
              {isOpen ? <MdExpandMore size={20} /> : <MdChevronRight size={20} />}
            </button>
          ) : (
            <MdArrowForwardIos size={14} className="ml-2 text-muted-foreground" />
          )}
        </div>

        {hasChildren && isOpen && (
          <div className={`${wrapperClass} bg-background`}>
            {node.children.map((child: any) => (
              <div key={child.key}>
                {/* Child row */}
                <div className="submenu-link text-foreground hover:bg-secondary flex items-center justify-between">
                  <a
                    href={child.href}
                    onClick={go(child.href)}
                    className="no-underline text-foreground flex-1"
                  >
                    {child.label}
                  </a>

                  {child.children?.length ? (
                    <button
                      onClick={() => toggleExpand(child.key)}
                      className="menu-toggle text-foreground"
                      aria-label={`Toggle ${child.label}`}
                      type="button"
                    >
                      {!!expanded[child.key] ? (
                        <MdExpandMore size={18} />
                      ) : (
                        <MdChevronRight size={18} />
                      )}
                    </button>
                  ) : null}
                </div>

                {/* Grandchildren */}
                {child.children?.length && expanded[child.key] ? (
                  <div className="mobile-submenu bg-background">
                    {child.children.map((grand: any) => (
                      <a
                        key={grand.key}
                        href={grand.href}
                        onClick={go(grand.href)}
                        className="submenu-link pl-8 text-foreground hover:bg-secondary no-underline block"
                      >
                        {grand.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className={`drawer-content md:hidden ${
        isClosing ? "animate-slide-up" : "animate-slide-down"
      }`}
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
        {navTree.map((node) => renderNode(node, 0))}

        <div className="mobile-auth-section border-t border-border bg-background">
          {!session ? (
            <a
              href="/sign-in"
              onClick={go("/sign-in")}
              className="auth-button text-accent hover:bg-secondary no-underline"
            >
              Sign In
            </a>
          ) : (
            <button
              onClick={() => {
                router.push("/auth/logout");
                handleClose();
              }}
              className="auth-button text-destructive hover:bg-secondary"
              type="button"
            >
              Log Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}