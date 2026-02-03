"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa"; // Importing delete icon

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

type Product = {
  Product_ID: number;
  Product_Name: string;
  Price: number;
  Sub_Section_ID: number;
};

export default function RemoveProduct() {
  const [sections, setSections] = useState<Section[]>([]);
  const [subsections, setSubsections] = useState<Subsection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedSubsection, setSelectedSubsection] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  // ✅ Fetch sections on load
  useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch("/api/catalog?getSections=true");
        if (!res.ok) throw new Error("Failed to fetch sections");
        const data: Section[] = await res.json();
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
      setProducts([]);
      return;
    }

    async function fetchSubsections() {
      try {
        const res = await fetch(`/api/catalog?getSubsections=true&sectionId=${selectedSection}`);
        if (!res.ok) throw new Error("Failed to fetch subsections");
        const data: Subsection[] = await res.json();
        setSubsections(data);
      } catch (err) {
        console.error("❌ Subsection Fetch Error:", err);
      }
    }

    fetchSubsections();
  }, [selectedSection]);

  // ✅ Fetch products when a subsection is selected
  useEffect(() => {
    if (!selectedSubsection) {
      setProducts([]);
      return;
    }

    async function fetchProducts() {
      try {
        const res = await fetch(`/api/products?subsectionId=${selectedSubsection}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("❌ Product Fetch Error:", err);
      }
    }

    fetchProducts();
  }, [selectedSubsection]);

  // ✅ Handle deleting a product
  async function handleRemoveProduct(productId: number) {
    console.log(`🗑 Removing product ID: ${productId}`);

    try {
      const response = await fetch(`/api/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();
      console.log("🗑 API Response:", data);

      if (response.ok) {
        setMessage(`✅ Removed product: ${data.deletedProduct.Product_Name}`);
        setProducts(products.filter((p) => p.Product_ID !== productId)); // ✅ Remove from state
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to remove product. Try again.");
    }
  }

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-semibold mb-2">Remove Product</h2>

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
      {subsections.length > 0 && (
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
      )}

      {/* ✅ Product List with Remove Buttons */}
      {products.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Products in Subsection:</h3>
          <ul className="list-disc list-inside">
            {products.map((product) => (
              <li key={product.Product_ID} className="flex justify-between items-center">
                {product.Product_Name} - ${product.Price.toFixed(2)}
                <button
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveProduct(product.Product_ID)}
                >
                  <FaTimes />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}