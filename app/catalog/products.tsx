"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaTimes, FaCheck } from "react-icons/fa";

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

export default function Products() {
  // ✅ State for sections and subsections
  const [sections, setSections] = useState<Section[]>([]);
  const [subsections, setSubsections] = useState<Subsection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // ✅ Selection state
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedSubsection, setSelectedSubsection] = useState<number | null>(null);
  
  // ✅ New product form state
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  
  // ✅ UI state
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"view" | "add">("view");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch sections on load
  useEffect(() => {
    async function fetchSections() {
      try {
        setLoading(true);
        console.log("📩 Fetching sections...");
        const res = await fetch("/api/catalog?getSections=true");
        if (!res.ok) throw new Error("Failed to fetch sections");
        const data: Section[] = await res.json();
        console.log("✅ Sections Fetched:", data);
        setSections(data);
      } catch (err) {
        console.error("❌ Section Fetch Error:", err);
      } finally {
        setLoading(false);
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
        setLoading(true);
        console.log(`📩 Fetching subsections for Section_ID: ${selectedSection}`);
        const res = await fetch(`/api/catalog?getSubsections=true&sectionId=${selectedSection}`);
        if (!res.ok) throw new Error("Failed to fetch subsections");
        const data: Subsection[] = await res.json();
        console.log("✅ Subsections Fetched:", data);
        setSubsections(data);
      } catch (err) {
        console.error("❌ Subsection Fetch Error:", err);
      } finally {
        setLoading(false);
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

    fetchProducts();
  }, [selectedSubsection]);

  // ✅ Fetch products function (reusable)
  async function fetchProducts() {
    if (!selectedSubsection) return;
    
    try {
      setLoading(true);
      console.log(`📩 Fetching products for Subsection_ID: ${selectedSubsection}`);
      const res = await fetch(`/api/products?subsectionId=${selectedSubsection}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data: Product[] = await res.json();
      console.log("✅ Products Fetched:", data);
      setProducts(data);
    } catch (err) {
      console.error("❌ Product Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }

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
      setLoading(true);
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
        fetchProducts(); // Refresh the product list
        setMode("view"); // Return to view mode
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to add product. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Handle deleting a product
  async function handleRemoveProduct(productId: number) {
    console.log(`🗑 Removing product ID: ${productId}`);

    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  // Clear message after 3 seconds
  useEffect(() => {
    if (!message) return;
    
    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="container mx-auto p-4 bg-card text-card-foreground">
      <h1 className="text-3xl font-bold mb-6">Product Management</h1>
      
      {/* Status message */}
      {message && (
        <div className={`p-3 mb-4 rounded-md 
          ${message.includes("✅") ? "bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-300" 
          : "bg-red-100 dark:bg-red-700 text-red-800 dark:text-red-300"}`}>
          {message}
        </div>
      )}

      {/* ✅ Selection controls */}
      <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* ✅ Select Section */}
          <div>
            <label className="block text-lg font-semibold mb-2">Section:</label>
            <select
              className="w-full p-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground"
              value={selectedSection ?? ""}
              onChange={(e) => setSelectedSection(e.target.value ? parseInt(e.target.value, 10) : null)}
              disabled={loading}
            >
              <option value="" disabled>-- Select Section --</option>
              {sections.map((section) => (
                <option key={section.Section_ID} value={section.Section_ID}>
                  {section.Section_Name}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Select Subsection */}
          <div>
            <label className="block text-lg font-semibold mb-2">Subsection:</label>
            <select
              className="w-full p-2 border rounded-md bg-background text-foreground"
              value={selectedSubsection ?? ""}
              onChange={(e) => setSelectedSubsection(e.target.value ? parseInt(e.target.value, 10) : null)}
              disabled={loading || subsections.length === 0}
            >
              <option value="" disabled>-- Select Subsection --</option>
              {subsections.map((sub) => (
                <option key={`sub_${sub.Subsection_ID}`} value={sub.Subsection_ID}>
                  {sub.Subsection_Name || "⚠️ Undefined Name"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {subsections.length === 0 && selectedSection && (
          <p className="text-amber-600 mt-2"><FaTimes className="inline mr-1" /> No subsections found for this section.</p>
        )}
      </div>

      {/* ✅ Action buttons */}
      {selectedSubsection && (
        <div className="flex justify-end mb-4">
          {mode === "view" ? (
            <button
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              onClick={() => setMode("add")}
              disabled={loading}
            >
              <FaPlus className="mr-2" /> Add New Product
            </button>
          ) : (
            <button
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => {
                setMode("view");
                setProductName("");
                setPrice("");
              }}
              disabled={loading}
            >
              <FaTimes className="mr-2" /> Cancel
            </button>
          )}
        </div>
      )}

      {/* ✅ Add product form */}
      {mode === "add" && selectedSubsection && (
        <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaPlus className="mr-2 text-blue-500" /> Add New Product
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Product Name:</label>
              <input
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Enter product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-1">Price:</label>
              <input
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            className="w-full mt-4 p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
            onClick={handleAddProduct}
            disabled={loading}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <FaCheck className="mr-2" /> Submit Product
              </>
            )}
          </button>
        </div>
      )}

      {/* ✅ Product List with Remove Buttons */}
      {selectedSubsection && mode === "view" && (
        <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaEdit className="mr-2 text-blue-500" /> Products in Subsection
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading products...</p>
          ) : products.length > 0 ? (
            <ul className="divide-y">
              {products.map((product) => (
                <li key={product.Product_ID} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{product.Product_Name}</span>
                    <span className="ml-2 text-muted-foreground">${product.Price.toFixed(2)}</span>
                  </div>
                  <button
                    className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-700 rounded-full transition-colors"
                    onClick={() => handleRemoveProduct(product.Product_ID)}
                    disabled={loading}
                    title="Remove Product"
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No products found in this subsection.</p>

          )}
        </div>
      )}
    </div>
  );
}