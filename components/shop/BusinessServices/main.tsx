"use client";

import React from "react";
import Image from "next/image";
import "@/app/globals.css";

interface BusinessServicesProps {
  navigateTo: (key: string) => void;
}

const BusinessServices: React.FC<BusinessServicesProps> = ({ navigateTo }) => {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
      <h1 className="text-3xl font-bold mb-6">Business Services</h1>
      <p className="text-lg mb-8">
        Allow Desert Area Resources and Training to handle a variety of business services for your organization,
        including commercial cleaning, paper shredding, and document imaging.
      </p>

      {/* Business Services Grid */}
      <div className="flex flex-col items-center mt-8 space-y-6">
        {[
          ["Commercial Cleaning Services", "cms", "Commercial Cleaning.jpg"],
          ["Secure Document Shredding", "shredding", "Secure Document Shredding.jpg"],
        ].map(([title, key, filename]) => (
          <button
            key={key}
            onClick={() => navigateTo(key as string)}
            className="flex items-center space-x-4 hover:opacity-80 transition text-left w-full"
          >
            <div className="w-24 h-24 flex-shrink-0">
              <Image
                src={`/images/home/${filename}`}
                alt={title as string}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div>
              <h3 className="font-semibold text-[var(-foreground)]">{title}</h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BusinessServices;