// app/dashboard/[id]/settings/products/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { toast } from "react-hot-toast";

import LoadingState from "./_components/LoadingState";
import ErrorAlert from "./_components/ErrorAlert";
import ProductsSearchBar from "./_components/ProductsSearchBar";
import ProductActionBar from "./_components/ProductActionBar";
import ProductsTable, { ProductRow } from "./_components/ProductsTable";

// ✅ create modal (we’ll add this next)
import CreateProductModal from "./_components/CreateProductModal";

// ✅ manage modal (the big one you pasted)
import ProductModal from "./_components/ProductModal";

import "./_components/products.scss";

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: { code: "NON_JSON_RESPONSE", message: text.slice(0, 300) } };
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Create modal open
  const [createOpen, setCreateOpen] = useState(false);

  // ✅ Manage modal open + selected product
  const [manageOpen, setManageOpen] = useState(false);
  const [manageProductId, setManageProductId] = useState<string | null>(null);

  const fetchProducts = async (mode: "initial" | "refresh" = "refresh") => {
    mode === "initial" ? setIsLoading(true) : setIsRefreshing(true);

    try {
      const url = new URL("/api/products/admin", window.location.origin);
      url.searchParams.set("limit", "50");
      url.searchParams.set("offset", "0");
      url.searchParams.set("status", "all");
      if (searchQuery.trim()) url.searchParams.set("q", searchQuery.trim());

      const res = await fetch(url.toString(), { cache: "no-store" });
      const json = await safeReadJson(res);

      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? `Failed: ${res.status}`);

      setProducts((json.data ?? []) as ProductRow[]);
      setError(null);

      if (mode !== "initial") toast.success("Products refreshed");
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to load products.");
    } finally {
      mode === "initial" ? setIsLoading(false) : setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts("initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return products;

    return products.filter((p) =>
      [p.title, p.slug, p.badge ?? "", p.status ?? ""].join(" ").toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  return (
    <ShowcaseSection title="Products">
      <div className="products-page space-y-6">
        <div className="products-header flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <ProductsSearchBar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSubmitSearch={() => fetchProducts("refresh")}
          />

          <ProductActionBar
            isRefreshing={isRefreshing}
            onRefresh={() => fetchProducts("refresh")}
            onCreateProduct={() => setCreateOpen(true)}
          />
        </div>

        {isLoading && <LoadingState message="Loading products..." />}
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {!isLoading && !error && (
          <ProductsTable
            products={filtered}
            isRefreshing={isRefreshing}
            onManage={(p) => {
              setManageProductId(p.id);
              setManageOpen(true);
            }}
            onArchive={async (p) => {
              if (!confirm(`Archive "${p.title}"?`)) return;
              try {
                const res = await fetch(`/api/products/admin/${p.id}`, { method: "DELETE" });
                const json = await safeReadJson(res);
                if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Archive failed");
                toast.success("Archived");
                fetchProducts("refresh");
              } catch (e: any) {
                toast.error(e?.message ?? "Archive failed");
              }
            }}
          />
        )}

        {/* ✅ Create */}
        <CreateProductModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={(newProductId) => {
            setCreateOpen(false);
            toast.success("Product created");
            fetchProducts("refresh");

            // optional: immediately open manage
            setManageProductId(newProductId);
            setManageOpen(true);
          }}
        />

        {/* ✅ Manage */}
        <ProductModal
          open={manageOpen}
          onOpenChange={(v) => setManageOpen(v)}
          productId={manageProductId}
          onChanged={() => fetchProducts("refresh")}
        />
      </div>
    </ShowcaseSection>
  );
}
