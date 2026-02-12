"use client";

import { PromoPanel } from "./PromoPanel";

export function PromoRowSection() {
  return (
    <section id="new-releases" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-14">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PromoPanel title="New Releases" desc="Fresh drops and latest arrivals." href="#new-releases" badge="New" />
        <PromoPanel title="Restocks" desc="Back in stock—grab it before it’s gone." href="#restocks" badge="Restock" />
        <PromoPanel title="Cowkids" desc="Kid styles, minis, and western-inspired accessories." href="#cowkids" badge="Kids" />
      </div>
    </section>
  );
}
