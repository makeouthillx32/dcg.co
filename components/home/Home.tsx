// app/page.tsx or components/home/Home.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/home/Header";
import SectionPanel from "@/components/home/SectionPanel";
import BackButton from "@/components/home/_components/BackButton";
import AnchorSection from "@/components/home/_components/AnchorSection";
import { pageTree, sectionId } from "@/components/home/_components/pageTree";
import Footer from "@/components/footer"; // Updated import
import useThemeCookie from "@/lib/useThemeCookie";

export default function Home() {
  useThemeCookie(); // Persist theme

  const [currentPage, setCurrentPage] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigate to hash and smooth‑scroll there
  const goTo = useCallback(
    (hash: string) => {
      console.log("🔍 goTo called with hash:", hash);
      
      const [base, sub] = hash.split("/");
      const pageKey = sub && sectionId[sub] ? sub : base;
      const target = sectionId[pageKey] ?? pageKey;
      
      console.log("🔍 Navigation logic:", {
        hash,
        base,
        sub,
        pageKey,
        target,
        sectionIdHasKey: !!sectionId[pageKey],
        availableKeys: Object.keys(sectionId)
      });
      
      // Check if the target page exists in pageTree
      if (pageTree[target]) {
        console.log("✅ Setting current page to:", target);
        setCurrentPage(target);
        
        requestAnimationFrame(() => {
          setTimeout(() => {
            const scrollToId = sub || target;
            const el = document.getElementById(scrollToId);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              document.documentElement.scrollIntoView({ behavior: "smooth" });
            }
          }, 10);
        });
      } else {
        console.warn("❌ Page not found in pageTree:", target, "Available pages:", Object.keys(pageTree));
        // Fallback to home if page doesn't exist
        setCurrentPage("home");
      }
    },
    [sectionId] // ✅ Add sectionId as dependency
  );

  const navigateTo = (page: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    console.log("🔗 navigateTo called with page:", page);
    history.pushState(null, "", `#${page}`);
    goTo(page);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const sync = () => {
      const hash = location.hash.replace("#", "") || "home";
      console.log("🔄 Hash change detected:", hash);
      goTo(hash);
    };
    
    // Initial sync
    sync();
    
    // Listen for hash changes
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [goTo]);

  // Pull component & metadata from pageTree
  const config = pageTree[currentPage];
  console.log("🎯 Current page config:", { currentPage, hasConfig: !!config, availablePages: Object.keys(pageTree) });
  
  if (!config) {
    console.error("❌ No config found for page:", currentPage);
    return null;
  }
  
  const { Component, backKey, backLabel, anchorId } = config;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header
        theme="light"
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navigateTo={navigateTo}
      />

      <main className="flex-grow">
        <SectionPanel currentPage={currentPage}>
          {backKey && <BackButton navigateTo={navigateTo} backKey={backKey} label={backLabel} />}
          {anchorId && <AnchorSection id={anchorId} />}
          <Component navigateTo={navigateTo} />
        </SectionPanel>
      </main>

      <Footer />
    </div>
  );
}