"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/provider"; // Importing the theme context

// Define types for sections, subsections, and products
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

export default function ProductCatalog() {
  const { themeType } = useTheme(); // Use the theme hook

  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [subsections, setSubsections] = useState<Subsection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch("/api/catalog?getSections=true");
        if (!res.ok) throw new Error("Failed to fetch sections");
        const data: Section[] = await res.json();
        setSections(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    }

    fetchSections();
  }, []);

  async function handleSectionChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const sectionId = event.target.value ? parseInt(event.target.value, 10) : null;
    setSelectedSection(sectionId);
    setProducts([]); // Reset products when switching sections

    try {
      const res = await fetch(`/api/catalog?getSubsections=true&sectionId=${sectionId}`);
      if (!res.ok) throw new Error("Failed to fetch subsections");
      const subsectionData: Subsection[] = await res.json();
      setSubsections(subsectionData);

      let allProducts: Product[] = [];
      for (const subsection of subsectionData) {
        const productRes = await fetch(`/api/catalog?getProducts=true&subsectionId=${subsection.Subsection_ID}`);
        if (productRes.ok) {
          const productData: Product[] = await productRes.json();
          allProducts = [...allProducts, ...productData];
        }
      }
      setProducts(allProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  }

  return (
    <div
      className={`max-w-2xl mx-auto p-6 rounded-lg shadow 
      bg-card text-card-foreground`}
    >
      <h1 className="text-3xl font-bold text-center mb-4">Product Catalog</h1>

      {error && <p className="text-red-500 text-center">Error: {error}</p>}

      <label className="block text-lg font-semibold">Select a Section:</label>
      <select
        className="w-full p-2 border rounded-md mt-2 bg-background text-foreground"
        onChange={handleSectionChange}
        defaultValue=""
      >
        <option value="" disabled>-- Select Section --</option>
        {sections.map((section) => (
          <option key={section.Section_ID} value={section.Section_ID}>
            {section.Section_Name}
          </option>
        ))}
      </select>

      <h2 className="text-xl font-semibold mt-4">Subsections:</h2>
      {subsections.length === 0 ? (
        <p className="text-muted-foreground">No subsections available for this section.</p>
      ) : (
        <ul className="list-disc list-inside">
          {subsections.map((subsection) => (
            <li key={subsection.Subsection_ID}>{subsection.Subsection_Name}</li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-semibold mt-4">Products:</h2>
      {products.length === 0 ? (
        <p className="text-muted-foreground">No products available for this section.</p>
      ) : (
        <ul className="list-disc list-inside">
          {products.map((product) => (
            <li key={product.Product_ID}>
              {product.Product_Name} - ${product.Price.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}