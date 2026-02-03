"use client";

import { useState, useEffect } from "react";

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

export default function AddProduct() {
  const [sections, setSections] = useState<Section[]>([]);
  const [subsections, setSubsections] = useState<Subsection[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedSubsection, setSelectedSubsection] = useState<number | null>(null);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
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

  // ✅ Handle adding a product
  async function handleAddProduct() {
    if (!selectedSubsection || !productName.trim() || !price.trim()) {
      setMessage("❌ All fields are required.");
      return;
    }

    console.log("🔍 Selected Sub_Section_ID:", selectedSubsection);
    const payload = {
      Product_Name: productName,
      Price: parseFloat(price),
      Sub_Section_ID: selectedSubsection,
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
        setMessage(`✅ Product added: ${data.product.Product_Name}`);
        setProductName("");
        setPrice("");
        setSelectedSubsection(null);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to add product. Try again.");
    }
  }

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-semibold mb-2">Add New Product</h2>

      {message && <p className="mb-4 text-red-500">{message}</p>}

      {/* ✅ Select Section */}
      <label className="block text-lg font-semibold">Select a Section:</label>
      <select
        className="w-full p-2 border rounded-md mt-2"
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

      {/* ✅ Select Subsection */}
      {subsections.length > 0 ? (
        <>
          <label className="block text-lg font-semibold mt-4">Select a Subsection:</label>
          <select
            className="w-full p-2 border rounded-md mt-2"
            value={selectedSubsection ?? ""}
            onChange={(e) => setSelectedSubsection(e.target.value ? parseInt(e.target.value, 10) : null)}
          >
            <option value="" disabled>-- Select Subsection --</option>
            {subsections.map((sub) => (
              <option key={`sub_${sub.Subsection_ID}`} value={sub.Subsection_ID}>
                {sub.Subsection_Name || "⚠️ Undefined Name"}
              </option>
            ))}
          </select>
        </>
      ) : (
        selectedSection && <p className="text-gray-600 mt-4">⚠️ No subsections found for this section.</p>
      )}

      {/* ✅ Product Input Fields */}
      {selectedSubsection && (
        <>
          <label className="block text-lg font-semibold mt-4">Product Name:</label>
          <input
            className="w-full p-2 border rounded mt-2"
            type="text"
            placeholder="Enter product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />

          <label className="block text-lg font-semibold mt-4">Price:</label>
          <input
            className="w-full p-2 border rounded mt-2"
            type="number"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <button
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-700 mt-4"
            onClick={handleAddProduct}
          >
            Submit Product
          </button>
        </>
      )}
    </div>
  );
}