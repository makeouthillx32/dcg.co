"use client";

import { useState } from "react";
import { useTheme } from "@/app/provider"; // Import theme context
import Products from "./products"; 
import SubsectionManager from "./subsection"; 
import SectionManager from "./section"; 

export default function ProductManager() {
  const { themeType } = useTheme(); // Get the current theme

  const [showProducts, setShowProducts] = useState(false);
  const [showSubsectionManager, setShowSubsectionManager] = useState(false);
  const [showSectionManager, setShowSectionManager] = useState(false);

  return (
    <div
      className={`max-w-2xl mx-auto p-6 rounded-lg shadow 
      bg-card text-card-foreground`}
    >
      <h1 className="text-3xl font-bold text-center mb-4">Product Manager</h1>

      {/* ✅ Toggle Product Management */}
      <button
        className={`w-full p-2 rounded mb-2 
          ${showProducts ? "bg-blue-700" : "bg-blue-500"} 
          text-white hover:bg-blue-600`}
        onClick={() => setShowProducts(!showProducts)}
      >
        {showProducts ? "Close Product Management" : "Manage Products"}
      </button>

      {/* ✅ Toggle Subsection Manager */}
      <button
        className={`w-full p-2 rounded mb-2 
          ${showSubsectionManager ? "bg-green-700" : "bg-green-500"} 
          text-white hover:bg-green-600`}
        onClick={() => setShowSubsectionManager(!showSubsectionManager)}
      >
        {showSubsectionManager ? "Close Subsection Manager" : "Manage Subsections"}
      </button>

      {/* ✅ Toggle Section Manager */}
      <button
        className={`w-full p-2 rounded 
          ${showSectionManager ? "bg-purple-700" : "bg-purple-500"} 
          text-white hover:bg-purple-600`}
        onClick={() => setShowSectionManager(!showSectionManager)}
      >
        {showSectionManager ? "Close Section Manager" : "Manage Sections"}
      </button>

      {/* ✅ Render Components Conditionally */}
      {showProducts && <Products />}
      {showSubsectionManager && <SubsectionManager />}
      {showSectionManager && <SectionManager />}
    </div>
  );
}