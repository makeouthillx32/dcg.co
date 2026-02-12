// components/home/Home.tsx or wherever it lives
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Layouts/shop/Header";
import SectionPanel from "@/components/shop/SectionPanel";
import BackButton from "@/components/shop/BackButton";
import AnchorSection from "@/components/shop/AnchorSection";
import { pageTree, sectionId } from "@/components/shop/pageTree";
import Footer from "@/components/footer";
import useThemeCookie from "@/lib/useThemeCookie";

export default function Home() {
  useThemeCookie();
  const [currentPage, setCurrentPage] = useState<string>("home");

  const goTo = useCallback((hash: string) => {
    const [base, sub] = hash.split("/");
    const pageKey = sub && sectionId[sub] ? sub : base;
    const target = sectionId[pageKey] ?? pageKey;
    
    if (pageTree[target]) {
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
      setCurrentPage("home");
    }
  }, []);

  const navigateTo = (page: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    history.pushState(null, "", `#${page}`);
    goTo(page);
  };

  useEffect(() => {
    const sync = () => {
      const hash = location.hash.replace("#", "") || "home";
      goTo(hash);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [goTo]);

  const config = pageTree[currentPage];
  if (!config) return null;
  
  const { Component, backKey, backLabel, anchorId } = config;

  return (
    <div className="flex min-h-screen flex-col bg-primary-foreground text-foreground">
      {/* ✅ No props needed */}
      <Header />

      <main className="flex-grow">
        <SectionPanel currentPage={currentPage}>
          {backKey && <BackButton navigateTo={navigateTo} backKey={backKey} label={backLabel} />}
          {anchorId && <AnchorSection id={anchorId} />}
          <Component navigateTo={navigateTo} />
        </SectionPanel>
      </main>

      {/* ✅ No props needed */}
      <Footer />
    </div>
  );
}