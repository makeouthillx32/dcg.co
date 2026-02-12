"use client";

import React from "react";
import Image from "next/image";
import "@/app/globals.css";

export default function LearnAndConnect() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
      <h1 className="text-3xl font-bold mb-4">Learn & Connect</h1>
      <p className="text-lg mb-8">
        Helpful resources for people with developmental and intellectual disabilities and their caregivers.
      </p>

      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 flex-shrink-0">
          <Image
            src="/images/home/advocacy.jpg"
            alt="Advocacy and Resources"
            width={96}
            height={96}
            className="w-full h-full object-cover rounded"
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[var(--foreground)]">Advocacy & Resources</h3>
          <p className="text-sm mt-1">
            There are many resources available to help you with any questions you have, from legal aid to community support.
          </p>
        </div>
      </div>
    </div>
  );
}