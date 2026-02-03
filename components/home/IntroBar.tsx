"use client";

import React from "react";
import styles from "./_components/IntroBar.module.scss";


const labels: Record<string, string> = {
  about:             "About Us",
  board:             "Board of Directors",
  title9:            "Title 9 Information",
  careers:           "Careers",
  jobs:              "Jobs",
  programs:          "Programs & Services",
  transportation:    "Transportation",
  employment:        "Employment Services",
  "early-childhood": "Early Childhood Services",
  autismdaycamp:     "Autism Day Camp",
  artists:           "Artists Guild",
  "supported-living":"Supported Living Services",
  business:          "Business Services",
  commercial:        "Commercial Services",
  pickup:            "Donations & Pick‑Up",
  donate:            "Donate Now",
  involved:          "Get Involved",
  learn:             "Learn & Connect",
  carf:              "CARF Accreditation",
  thriftstore:       "DART Thrift Store",
  shredding:         "Secure Document Shredding",
}as const;

/* ------------------------------------------------------------------ */
/* 2.  Props                                                          */
/* ------------------------------------------------------------------ */
type PageKey = keyof typeof labels | "home";

interface IntroBarProps {
  currentPage: PageKey;
}

/* ------------------------------------------------------------------ */
/* 3.  Component                                                      */
/* ------------------------------------------------------------------ */
export default function IntroBar({ currentPage }: IntroBarProps) {
  // never render on the home page
  if (currentPage === "home") return null;

  const label = labels[currentPage];
  if (!label) return null;        // guard against unknown keys

  return (
    <div className={styles.ribbonContainer}>
      <h2 className={styles.ribbon}>
        <span className={styles.content}>{label}</span>
      </h2>
    </div>
  );
}
