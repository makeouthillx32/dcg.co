// app/dashboard/[id]/settings/products/_components/ProductsTable.tsx
"use client";

import React from "react";
import { Trash2, Loader2, Settings2, Image as ImageIcon, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ProductRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  currency: string;
  badge: string | null;
  is_featured: boolean;
  status?: string;
  created_at: string;
  product_images?: { storage_path: string; alt: string | null; position: number }[];
};

interface ProductsTableProps {
  products: ProductRow[];
  allProductsCount?: number;
  isRefreshing?: boolean;

  // Opens your Manage modal/dialog for this product
  onManage: (product: ProductRow) => void;

  // Archive/delete action (admin route)
  onArchive: (product: ProductRow) => void;
}

function centsToMoney(cents: number, currency: string = "USD") {
  const amt = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amt);
  } catch {
    return `$${amt.toFixed(2)}`;
  }
}

function statusBadgeVariant(status?: string) {
  const s = (status ?? "draft").toLowerCase();
  if (s === "active") return "default";
  if (s === "archived") return "destructive";
  return "secondary"; // draft, etc
}

export default function ProductsTable({
  products,
  allProductsCount,
  isRefreshing = false,
  onManage,
  onArchive,
}: ProductsTableProps) {
  if (!products || products.length === 0) {
    return (
      <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">
        No products found.
      </p>
    );
  }

  return (
    <div className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow-sm)]">
      {/* Column headers */}
      <div className="grid grid-cols-12 p-4 bg-[hsl(var(--muted))] font-medium text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider">
        <div className="col-span-6 md:col-span-4">Product</div>
        <div className="hidden md:block md:col-span-2">Status</div>
        <div className="col-span-3 md:col-span-2">Price</div>
        <div className="hidden md:block md:col-span-2">Badge</div>
        <div className="col-span-3 md:col-span-2 text-right">Actions</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[hsl(var(--border))]">
        {products.map((p) => {
          const imgCount = p.product_images?.length ?? 0;

          return (
            <div
              key={p.id}
              className="product-item grid grid-cols-12 gap-y-2 p-4 hover:bg-[hsl(var(--accent))] transition-colors"
            >
              {/* Product (title + slug + meta) */}
              <div className="col-span-12 md:col-span-4 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                    <ImageIcon size={16} className="text-[hsl(var(--muted-foreground))]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-[hsl(var(--foreground))] truncate">
                        {p.title}
                      </span>
                      {p.is_featured ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]">
                          Featured
                        </span>
                      ) : null}
                    </div>

                    <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                      {p.slug}
                    </div>

                    {/* Mobile-only meta row */}
                    <div className="mt-2 flex flex-wrap items-center gap-2 md:hidden">
                      <Badge variant={statusBadgeVariant(p.status)}>
                        {p.status ?? "draft"}
                      </Badge>

                      {p.badge ? <Badge variant="secondary">{p.badge}</Badge> : null}

                      <span className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                        <ImageIcon size={14} /> {imgCount}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                        <TagIcon size={14} /> tags in Manage
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status (desktop) */}
              <div className="hidden md:flex md:col-span-2 items-center">
                <Badge variant={statusBadgeVariant(p.status)}>
                  {p.status ?? "draft"}
                </Badge>
              </div>

              {/* Price */}
              <div className="col-span-6 md:col-span-2 flex items-center">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {centsToMoney(p.price_cents, p.currency)}
                </span>
              </div>

              {/* Badge (desktop) */}
              <div className="hidden md:flex md:col-span-2 items-center">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  {p.badge ?? "—"}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-6 md:col-span-2 flex items-center justify-end">
                <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onManage(p)}
                    className="w-[110px] sm:w-auto"
                  >
                    <Settings2 size={16} className="mr-2" />
                    Manage
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onArchive(p)}
                    className="w-[110px] sm:w-auto"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Archive
                  </Button>
                </div>
              </div>

              {/* Desktop-only small info strip */}
              <div className="hidden md:flex md:col-span-12 items-center justify-between pt-2 text-xs text-[hsl(var(--muted-foreground))]">
                <span>
                  Created: {new Date(p.created_at).toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ImageIcon size={14} /> {imgCount} image{imgCount === 1 ? "" : "s"}
                  <span className="mx-2">•</span>
                  <TagIcon size={14} /> tags via Manage
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div className="p-4 text-sm text-[hsl(var(--muted-foreground))] flex items-center justify-between">
        <span>
          Showing {products.length}
          {typeof allProductsCount === "number" ? ` of ${allProductsCount}` : ""} products
        </span>

        {isRefreshing ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Refreshing…
          </span>
        ) : null}
      </div>
    </div>
  );
}
