// components/shop/Home.tsx
"use client";

import React, { useEffect } from "react";
import Header from "@/components/Layouts/shop/Header";
import Footer from "@/components/Layouts/footer";
import useThemeCookie from "@/lib/useThemeCookie";

import Landing from "@/components/shop/Landing";

export default function Home() {
  useThemeCookie();

  // Optional: if user hits /#something, smoothly scroll (ONLY for sections on Landing)
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace("#", "");
      if (!id) return;

      // Let layout render first
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-primary-foreground text-foreground">
      <Header />

      <main className="flex-grow">
        <Landing />
      </main>

      <Footer />
    </div>
  );
}