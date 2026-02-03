"use client";

import { useState } from "react";
import { useTheme } from "@/app/provider"; // Import theme context
import Products from "@/app/catalog/products";
import SubsectionManager from "@/app/catalog/subsection";
import SectionManager from "@/app/catalog/section";

export default function ProductManager() {
  const { themeType } = useTheme(); // Get the current theme

  const [showProducts, setShowProducts] = useState(false);
  const [showSubsectionManager, setShowSubsectionManager] = useState(false);
  const [showSectionManager, setShowSectionManager] = useState(false);

  return (
    <div
      className="max-w-2xl mx-auto p-6 rounded-[var(--radius)] shadow-[var(--shadow-md)] 
      bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]"
    >
      <h1 className="text-3xl font-bold text-center mb-4 text-[hsl(var(--foreground))]">Product Manager</h1>

      {/* Toggle Product Management */}
      <button
        className={`w-full p-2 rounded-[calc(var(--radius)*0.5)] mb-2 
          ${showProducts ? "bg-[hsl(var(--sidebar-primary))]" : "bg-[hsl(var(--sidebar-primary))/0.8]"} 
          text-[hsl(var(--sidebar-primary-foreground))] hover:bg-[hsl(var(--sidebar-primary))/0.9]`}
        onClick={() => setShowProducts(!showProducts)}
      >
        {showProducts ? "Close Product Management" : "Manage Products"}
      </button>

      {/* Toggle Subsection Manager */}
      <button
        className={`w-full p-2 rounded-[calc(var(--radius)*0.5)] mb-2 
          ${showSubsectionManager ? "bg-[hsl(var(--chart-2))]" : "bg-[hsl(var(--chart-2))/0.8]"} 
          text-[hsl(var(--background))] hover:bg-[hsl(var(--chart-2))/0.9]`}
        onClick={() => setShowSubsectionManager(!showSubsectionManager)}
      >
        {showSubsectionManager ? "Close Subsection Manager" : "Manage Subsections"}
      </button>

      {/* Toggle Section Manager */}
      <button
        className={`w-full p-2 rounded-[calc(var(--radius)*0.5)]
          ${showSectionManager ? "bg-[hsl(var(--chart-3))]" : "bg-[hsl(var(--chart-3))/0.8]"} 
          text-[hsl(var(--background))] hover:bg-[hsl(var(--chart-3))/0.9]`}
        onClick={() => setShowSectionManager(!showSectionManager)}
      >
        {showSectionManager ? "Close Section Manager" : "Manage Sections"}
      </button>

      {/* Render Components Conditionally */}
      {showProducts && <Products />}
      {showSubsectionManager && <SubsectionManager />}
      {showSectionManager && <SectionManager />}
    </div>
  );
}