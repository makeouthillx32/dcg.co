"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/provider"; // Import theme context
import { FaTrash } from "react-icons/fa"; 

// ✅ Define Types
type Section = {
  Section_ID: number;
  Section_Name: string;
};

export default function SectionManager() {
  const { themeType } = useTheme(); // Use the theme context
  const [sections, setSections] = useState<Section[]>([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Fetch sections on load
  useEffect(() => {
    async function fetchSections() {
      try {
        console.log("📩 Fetching sections...");
        const res = await fetch("/api/catalog?getSections=true");
        if (!res.ok) throw new Error("Failed to fetch sections");
        const data: Section[] = await res.json();
        console.log("✅ Sections Fetched:", data);
        setSections(data);
      } catch (err) {
        console.error("❌ Section Fetch Error:", err);
      }
    }
    fetchSections();
  }, []);

  // ✅ Handle adding a section
  async function handleAddSection() {
    if (!newSectionName.trim()) {
      setMessage("❌ Section Name is required.");
      return;
    }

    const payload = { action: "addSection", Section_Name: newSectionName.trim() };

    console.log("📩 Sending Payload to API:", payload);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("📩 API Response:", data);

      if (response.ok) {
        setMessage(`✅ Section added: ${data.section.Section_Name}`);
        setNewSectionName(""); // Reset input
        setSections([...sections, data.section]); // Update UI
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to add section. Try again.");
    }
  }

  // ✅ Handle removing a section
  async function handleRemoveSection(sectionId: number) {
    console.log("🗑 Deleting section with ID:", sectionId);

    const payload = { action: "removeSection", sectionId };

    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("🗑 API Response:", data);

      if (response.ok) {
        setMessage(`✅ Section removed.`);
        setSections(sections.filter((sec) => sec.Section_ID !== sectionId)); // Remove from UI
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to remove section. Try again.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg shadow bg-card text-card-foreground">
      <h1 className="text-3xl font-bold text-center mb-4">Section Manager</h1>

      {message && (
        <p className="mb-4 text-red-500 text-card-foreground">{message}</p>
      )}

      {/* ✅ Display Sections */}
      {sections.length > 0 ? (
        <ul className="mt-4 list-disc list-inside">
          {sections.map((sec) => (
            <li
              key={`sec_${sec.Section_ID}`}
              className="flex justify-between items-center"
            >
              <span>{sec.Section_Name}</span>
              <button
                onClick={() => handleRemoveSection(sec.Section_ID)}
                className="text-red-500 hover:text-red-700 ml-2"
                title="Remove Section"
              >
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-4">⚠️ No sections found.</p>
      )}

      {/* ✅ Add Section */}
      <>
        <label className="block text-lg font-semibold mt-4">New Section Name:</label>
        <input
          className="w-full p-2 border rounded mt-2 bg-background text-foreground"
          type="text"
          placeholder="Enter section name"
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
        />

        <button
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700 mt-4"
          onClick={handleAddSection}
        >
          Add Section
        </button>
      </>
    </div>
  );
}