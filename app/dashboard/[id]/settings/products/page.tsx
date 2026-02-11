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

import CreateProductModal from "./_components/CreateProductModal";
import ProductModal from "./_components/ProductModal";

import "./_components/products.scss";

/* ---------------- helpers ---------------- */

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return {
      ok: false,
      error: { code: "NON_JSON_RESPONSE", message: text.slice(0, 300) },
    };
  }
}

function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0;
}

/* ---------------- page ---------------- */

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [createOpen, setCreateOpen] = useState(false);

  const [manageOpen, setManageOpen] = useState(false);
  const [manageProductId, setManageProductId] = useState<string | null>(null);

  /* ---------------- fetch ---------------- */

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

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message ?? `Failed: ${res.status}`);
      }

      setProducts((json.data ?? []) as ProductRow[]);
      setError(null);

      if (mode !== "initial") toast.success("Products refreshed");
    } catch (e: any) {
      console.error("❌ fetchProducts failed:", e);
      setError(e?.message ?? "Failed to load products.");
    } finally {
      mode === "initial" ? setIsLoading(false) : setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts("initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- filter ---------------- */

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return products;

    return products.filter((p) =>
      [p.title, p.slug, p.badge ?? "", p.status ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [products, searchQuery]);

  /* ---------------- render ---------------- */

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
              if (!isValidId(p.id)) {
                console.error("🚨 Product missing id:", p);
                toast.error("This product is missing an ID. Refresh the page.");
                return;
              }

              setManageProductId(p.id);
              setManageOpen(true);
            }}
            onArchive={async (p) => {
              if (!isValidId(p.id)) {
                toast.error("Cannot archive product with missing ID.");
                return;
              }

              if (!confirm(`Archive "${p.title}"?`)) return;

              try {
                const res = await fetch(`/api/products/admin/${p.id}`, {
                  method: "DELETE",
                });
                const json = await safeReadJson(res);

                if (!res.ok || !json?.ok) {
                  throw new Error(json?.error?.message ?? "Archive failed");
                }

                toast.success("Archived");
                fetchProducts("refresh");
              } catch (e: any) {
                toast.error(e?.message ?? "Archive failed");
              }
            }}
          />
        )}

        {/* Create */}
        <CreateProductModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={(newProductId) => {
            if (!isValidId(newProductId)) {
              console.error("🚨 Created product missing id:", newProductId);
              toast.error("Product created but ID missing. Refresh required.");
              return;
            }

            setCreateOpen(false);
            toast.success("Product created");
            fetchProducts("refresh");

            setManageProductId(newProductId);
            setManageOpen(true);
          }}
        />

        {/* Manage */}
        <ProductModal
          open={manageOpen}
          onOpenChange={(v) => {
            if (!v) setManageProductId(null);
            setManageOpen(v);
          }}
          productId={manageProductId}
          onChanged={() => fetchProducts("refresh")}
        />
      </div>
    </ShowcaseSection>
  );
}