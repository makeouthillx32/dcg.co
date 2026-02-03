"use client";

import React, { useState, useRef, useEffect } from "react";
import { navTree } from "@/lib/navTree";
import "./_components/Desktop.scss";

interface DesktopNavProps {
  navigateTo: (key: string) => (e?: React.MouseEvent) => void;
}

export default function DesktopNav({ navigateTo }: DesktopNavProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const navRefs = useRef<(HTMLElement | null)[]>([]);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Smart dropdown positioning
  const getDropdownAlignment = (index: number) => {
    if (typeof window === 'undefined') return 'dropdown-align-center';
    
    const navItem = navRefs.current[index];
    if (!navItem) return 'dropdown-align-center';
    
    const rect = navItem.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    // If we're close to the right edge, right-align
    if (rect.right > viewportWidth - 200) {
      return 'dropdown-align-right';
    }
    
    // If we're close to the left edge, left-align
    if (rect.left < 200) {
      return 'dropdown-align-left';
    }
    
    // Otherwise, center-align
    return 'dropdown-align-center';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isClickInsideNav = navRefs.current.some(ref => 
        ref?.contains(event.target as Node)
      );
      const isClickInsideDropdown = dropdownRefs.current.some(ref => 
        ref?.contains(event.target as Node)
      );
      
      if (!isClickInsideNav && !isClickInsideDropdown) {
        setOpenKey(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle mouse enter with slight delay to prevent flicker
  const handleMouseEnter = (key: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setOpenKey(key);
  };

  // Handle mouse leave with delay to allow moving to dropdown
  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setOpenKey(null);
    }, 150); // Small delay to allow moving to dropdown
    setHoverTimeout(timeout);
  };

  // Handle dropdown mouse enter to cancel closing
  const handleDropdownMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
  };

  // Handle dropdown mouse leave
  const handleDropdownMouseLeave = () => {
    const timeout = setTimeout(() => {
      setOpenKey(null);
    }, 100);
    setHoverTimeout(timeout);
  };

  // Handle main nav click - close dropdown if open, open if closed
  const handleNavClick = (key: string, hasChildren: boolean) => (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setOpenKey(openKey === key ? null : key);
    } else {
      navigateTo(key)(e);
      setOpenKey(null);
    }
  };

  // Handle submenu item click
  const handleSubmenuClick = (key: string) => (e: React.MouseEvent) => {
    navigateTo(key)(e);
    setOpenKey(null); // Always close after selection
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const node = navTree[index];
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (node.children) {
          setOpenKey(node.key);
          // Focus first dropdown item
          setTimeout(() => {
            const firstItem = document.querySelector(`[data-parent="${node.key}"] a`) as HTMLElement;
            firstItem?.focus();
          }, 10);
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        const nextIndex = index < navTree.length - 1 ? index + 1 : 0;
        navRefs.current[nextIndex]?.focus();
        break;
      case "ArrowLeft":
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : navTree.length - 1;
        navRefs.current[prevIndex]?.focus();
        break;
      case "Escape":
        e.preventDefault();
        setOpenKey(null);
        break;
      case "Enter":
      case " ":
        if (node.children) {
          e.preventDefault();
          setOpenKey(openKey === node.key ? null : node.key);
        }
        break;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <nav className="nav-container">
      <div className="nav-menu">
        {navTree.map((node, index) => (
          <div
            key={node.key}
            className="nav-item relative"
            onMouseEnter={() => node.children && handleMouseEnter(node.key)}
            onMouseLeave={node.children ? handleMouseLeave : undefined}
          >
            {node.children ? (
              <>
                <button
                  ref={el => { navRefs.current[index] = el; }}
                  className="nav-top-link text-foreground hover:text-primary bg-transparent border-none cursor-pointer transition-colors duration-200 px-4 py-2 rounded-md hover:bg-muted/50"
                  onClick={handleNavClick(node.key, true)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  aria-expanded={openKey === node.key}
                  aria-haspopup="true"
                  tabIndex={0}
                  data-state={openKey === node.key ? "open" : "closed"}
                >
                  {node.label}
                  <span className={`ml-1 inline-block transition-transform duration-200 ${
                    openKey === node.key ? 'rotate-180' : 'rotate-0'
                  }`}>
                    ▼
                  </span>
                </button>
                
                <div
                  ref={el => { dropdownRefs.current[index] = el; }}
                  className={`nav-dropdown bg-popover border border-border shadow-lg rounded-md ${getDropdownAlignment(index)} ${
                    openKey === node.key ? "block animate-fade-in" : "hidden"
                  }`}
                  data-state={openKey === node.key ? "open" : "closed"}
                  data-parent={node.key}
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                  role="menu"
                  aria-label={`${node.label} submenu`}
                >
                  <div className="p-2 min-w-[12rem]">
                    {node.children.map((child, childIndex) => (
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
                ref={el => { navRefs.current[index] = el; }}
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