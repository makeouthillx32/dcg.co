"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MdExpandMore,
  MdChevronRight,
  MdArrowForwardIos,
} from "react-icons/md";
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
    }, 400); // Match the animation duration
  };

  const handleClickAndClose = (key: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    navigateTo(key)(e);
    handleClose();
  };

  return (
    /* Remove the backdrop completely - let the drawer handle everything */
    <div
      ref={menuRef}
      className={`drawer-content md:hidden
        ${isClosing ? "animate-slide-up" : "animate-slide-down"}`}
      style={{
        // Position relative to the header, not fixed to viewport
        position: 'absolute',
        top: '100%', // Position directly below the header
        left: 0,
        right: 0,
        zIndex: 50,
        maxHeight: 'calc(100vh - 4rem)',
        overflowY: 'auto',
        // Ensure no backdrop effects
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none'
      }}
    >
      <div className="mobile-menu-container bg-background border-b border-border shadow-lg rounded-b-xl">
        {navTree.map((node) => (
          <div key={node.key}>
            <div className="mobile-menu-item text-foreground hover:bg-secondary">
              <a
                href="#"
                onClick={handleClickAndClose(node.key)}
                className="menu-link focus:outline-none text-foreground no-underline"
              >
                {node.label}
              </a>
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
                <MdArrowForwardIos
                  size={14}
                  className="ml-2 text-muted-foreground"
                />
              )}
            </div>

            {node.children && expanded === node.key && (
              <div className="mobile-submenu bg-background">
                {node.children.map((child) => (
                  <a
                    key={child.key}
                    href="#"
                    onClick={handleClickAndClose(child.key)}
                    className="submenu-link text-foreground hover:bg-secondary no-underline"
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="mobile-auth-section border-t border-border bg-background">
          {!session ? (
            <a
              href="/sign-in"
              onClick={handleClose}
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