"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/provider"; // Import theme context
import { FaTrash } from "react-icons/fa"; 

// ✅ Define Types
type Section = {
  Section_ID: number;
  Section_Name: string;
};

type Subsection = {
  Subsection_ID: number;
  Subsection_Name: string;
  Parent_Section_ID: number;
};

export default function SubsectionManager() {
  const { themeType } = useTheme(); // Get the current theme

  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [subsections, setSubsections] = useState<Subsection[]>([]);
  const [newSubsectionName, setNewSubsectionName] = useState("");
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

  // ✅ Fetch subsections when a section is selected
  useEffect(() => {
    if (!selectedSection) {
      setSubsections([]);
      return;
    }

    async function fetchSubsections() {
      try {
        console.log(`📩 Fetching subsections for Section_ID: ${selectedSection}`);
        const res = await fetch(`/api/catalog?getSubsections=true&sectionId=${selectedSection}`);
        if (!res.ok) throw new Error("Failed to fetch subsections");
        const data: Subsection[] = await res.json();
        console.log("✅ Subsections Fetched:", data);
        setSubsections(data);
      } catch (err) {
        console.error("❌ Subsection Fetch Error:", err);
      }
    }

    fetchSubsections();
  }, [selectedSection]);

  // ✅ Handle adding a subsection
  async function handleAddSubsection() {
    if (!selectedSection || !newSubsectionName.trim()) {
      setMessage("❌ Section and Subsection Name are required.");
      return;
    }

    const payload = {
      action: "addSubsection",
      Subsection_Name: newSubsectionName.trim(),
      Parent_Section_ID: selectedSection,
    };

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
        setMessage(`✅ Subsection added: ${data.subsection.Subsection_Name}`);
        setNewSubsectionName(""); // Reset input
        setSubsections([...subsections, data.subsection]); // Update UI
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to add subsection. Try again.");
    }
  }

  // ✅ Handle removing a subsection
  async function handleRemoveSubsection(subsectionId: number) {
    console.log("🗑 Deleting subsection with ID:", subsectionId);

    const payload = { action: "removeSubsection", subsectionId };

    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("🗑 API Response:", data);

      if (response.ok) {
        setMessage(`✅ Subsection removed.`);
        setSubsections(subsections.filter((sub) => sub.Subsection_ID !== subsectionId));
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to remove subsection. Try again.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg shadow bg-card text-card-foreground">
      <h1 className="text-3xl font-bold text-center mb-4">Subsection Manager</h1>

      {message && (
        <p className="mb-4 text-red-500 text-card-foreground">{message}</p>
      )}

      {/* ✅ Select Section */}
      <label className="block text-lg font-semibold">Select a Section:</label>
      <select
        className="w-full p-2 border rounded-md mt-2 bg-background text-foreground"
        value={selectedSection ?? ""}
        onChange={(e) => setSelectedSection(e.target.value ? parseInt(e.target.value, 10) : null)}
      >
        <option value="" disabled>-- Select Section --</option>
        {sections.map((section) => (
          <option key={section.Section_ID} value={section.Section_ID}>
            {section.Section_Name}
          </option>
        ))}
      </select>

      {/* ✅ Display Subsections */}
      {subsections.length > 0 ? (
        <ul className="mt-4 list-disc list-inside">
          {subsections.map((sub) => (
            <li key={`sub_${sub.Subsection_ID}`} className="flex justify-between items-center">
              <span className="text-card-foreground">{sub.Subsection_Name}</span>
              <button
                onClick={() => handleRemoveSubsection(sub.Subsection_ID)}
                className="text-red-400 hover:text-red-600 ml-2"
                title="Remove Subsection"
              >
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        selectedSection && (
          <p className="text-muted-foreground mt-4">
            ⚠️ No subsections found for this section.
          </p>
        )
      )}

      {/* ✅ Add Subsection */}
      {selectedSection && (
        <>
          <label className="block text-lg font-semibold mt-4">
            New Subsection Name:
          </label>
          <input
            className="w-full p-2 border rounded mt-2 bg-background text-foreground"
            type="text"
            placeholder="Enter subsection name"
            value={newSubsectionName}
            onChange={(e) => setNewSubsectionName(e.target.value)}
          />

          <button
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700 mt-4"
            onClick={handleAddSubsection}
          >
            Add Subsection
          </button>
        </>
      )}
    </div>
  );
}