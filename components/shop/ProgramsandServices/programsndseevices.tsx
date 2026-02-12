// components/home/ProgramsAndServices.tsx
"use client";

import React from "react";
import Image from "next/image";
import "@/app/globals.css";
import AnchorSection from "@/components/home/_components/AnchorSection";

interface ProgramsAndServicesProps {
  /** navigateTo expects a key string and returns a click handler */
  navigateTo: (key: string) => (e?: React.MouseEvent) => void;
}

const ProgramsAndServices: React.FC<ProgramsAndServicesProps> = ({ navigateTo }) => {
  const services: [string, string, string][] = [
    ["Transportation", "transportation", "Transportation.jpg"],
    ["Early Childhood Services", "early-childhood", "Early Childhood Services.jpg"],
    ["Supported Living Services", "supported-living", "Supported Living Services.jpg"],
    ["Artists on the Edge", "artists-edge", "Artists on the Edge.jpg"],
    ["Autism Day Camp", "autism-day-camp", "Autism Day Camp.png"],
    ["Employment Services", "employment", "Employment Services.jpg"],
    ["CARF Accreditation", "carf", "Commission for the Accreditation.jpg"],
    ["DART Thrift Store", "thrift-store", "DART Thrift Store.jpg"],
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
      {/* Top‑level anchor for /#programs */}
      <AnchorSection id="programs" />

      <h1 className="text-3xl font-bold mb-4">Programs & Services</h1>
      <p className="text-lg mb-8">
        Desert Area Resources and Training specializes in a variety of services to empower
        people with intellectual and developmental disabilities. Explore each program below.
      </p>

      {/* Services Grid */}
      <div className="flex flex-col items-center mt-12 space-y-6">
        {services.map(([title, anchor, filename]) => (
          <button
            key={anchor}
            onClick={(e) => navigateTo(`programs/${anchor}`)(e)}
            className="flex items-center space-x-4 hover:opacity-80 transition text-left w-full"
          >
            <div className="w-24 h-24 flex-shrink-0">
              <Image
                src={`/images/home/${filename}`}
                alt={title}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProgramsAndServices;
