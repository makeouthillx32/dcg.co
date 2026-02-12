"use client";

import React from "react";
import { FiDollarSign, FiGift } from "react-icons/fi";

interface DonateNowProps {
  navigateTo: (page: string) => (e?: React.MouseEvent) => void;
}

export default function DonateNow({ navigateTo }: DonateNowProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)]">
      {/* Content wrapper with padding */}
      <div className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Breadcrumb / Nav Links */}
        <nav className="flex flex-wrap gap-4 text-sm mb-6">
          <button onClick={navigateTo("about")} className="hover:underline">About</button>
          <button onClick={navigateTo("programs")} className="hover:underline">Programs & Services</button>
          <button onClick={navigateTo("business")} className="hover:underline">Business Services</button>
          <button onClick={navigateTo("involved")} className="hover:underline">Get Involved</button>
          <button onClick={navigateTo("learn")} className="hover:underline">Learn & Connect</button>
        </nav>

        <h1 className="text-3xl font-bold mb-4">Give</h1>
        <p className="mb-8 text-lg leading-relaxed">
          Opportunity Village relies on community support to continue providing programs and services for over 3,000 individuals with disabilities annually. There are a variety of ways both businesses and individuals can help support our mission.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={navigateTo("donate-money")}
            className="flex items-center p-6 border border-gray-200 rounded-lg hover:shadow transition"
          >
            <FiDollarSign className="h-6 w-6 mr-4 text-[var(--accent)]" />
            <span className="text-xl font-semibold">Make a Monetary Donation</span>
          </button>

          <button
            onClick={navigateTo("donate-goods")}
            className="flex items-center p-6 border border-gray-200 rounded-lg hover:shadow transition"
          >
            <FiGift className="h-6 w-6 mr-4 text-[var(--accent)]" />
            <span className="text-xl font-semibold">Donate Goods</span>
          </button>
        </div>
      </div>

      {/* Push footer to bottom */}
      <div className="mt-auto" />
    </div>
  );
}
