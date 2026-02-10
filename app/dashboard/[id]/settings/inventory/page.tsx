// app/settings/inventory/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

import "./_components/inventory.scss";

import { LoadingState } from "./_components/LoadingState";
import { ErrorAlert } from "./_components/ErrorAlert";
import { InventoryActionBar } from "./_components/InventoryActionBar";
import { InventoryTable, type InventoryRow } from "./_components/InventoryTable";
import { EditInventoryForm } from "./_components/EditInventoryForm";

/**
 * Inventory Manager (PRODUCT_VARIANTS-BASED)
 *
 * Your schema stores inventory on public.product_variants:
 * - track_inventory (boolean NOT NULL)
 * - inventory_qty (integer NOT NULL)
 * - allow_backorder (boolean NOT NULL)
 * - updated_at (timestamptz NOT NULL)
 *
 * We join product_variants -> products to show product title.
 */
export default function InventoryPage() {
  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [showOnlyTracked, setShowOnlyTracked] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<InventoryRow | null>(null);

  const load = async () => {
    setErr(null);
    setLoading(true);

    // product_variants -> products join
    const { data, error } = await supabase
      .from("product_variants")
      .select(
        `
        id,
        product_id,
        title,
        sku,
        track_inventory,
        inventory_qty,
        allow_backorder,
        updated_at,
        products (
          id,
          title
        )
      `
      )
      .order("updated_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    const mapped: InventoryRow[] =
      (data ?? []).map((v: any) => ({
        // Inventory UI expects an inventory_id; we use variant id as the "row id"
        inventory_id: v.id,
        variant_id: v.id,

        product_title: v.products?.title ?? null,
        variant_title: v.title ?? null,
        sku: v.sku ?? null,

        quantity: v.inventory_qty ?? 0,
        track_inventory: !!v.track_inventory,
        allow_backorder: !!v.allow_backorder,

        updated_at: v.updated_at ?? null,
      })) ?? [];

    setRows(mapped);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((r) => {
      if (showOnlyTracked && !r.track_inventory) return false;

      if (showLowStock && r.track_inventory) {
        const qty = r.quantity ?? 0;
        if (qty > lowStockThreshold) return false;
      } else if (showLowStock && !r.track_inventory) {
        return false;
      }

      if (!q) return true;

      const hay = [r.product_title ?? "", r.variant_title ?? "", r.sku ?? ""]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [rows, search, showOnlyTracked, showLowStock, lowStockThreshold]);

  const handleEdit = (row: InventoryRow) => {
    setSelected(row);
    setEditOpen(true);
  };

  const handleSave = async (data: {
    inventory_id: string; // variant id
    quantity: number;
    track_inventory: boolean;
    allow_backorder: boolean;
  }) => {
    setErr(null);

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("product_variants")
      .update({
        inventory_qty: data.quantity,
        track_inventory: data.track_inventory,
        allow_backorder: data.allow_backorder,
        updated_at: now,
      })
      .eq("id", data.inventory_id);

    if (error) {
      setErr(error.message);
      return;
    }

    // Optimistic update
    setRows((prev) =>
      prev.map((r) =>
        r.variant_id === data.inventory_id
          ? {
              ...r,
              quantity: data.quantity,
              track_inventory: data.track_inventory,
              allow_backorder: data.allow_backorder,
              updated_at: now,
            }
          : r
      )
    );
  };

  const handleReseedMissing = async () => {
    // No separate inventory table in your schema — inventory lives on product_variants.
    // Keeping the button so the UI doesn’t break; it just refreshes.
    await load();
  };

  return (
    <div className="inventory-manager">
      <div className="inventory-header">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Manage stock per variant (stored on product_variants). Track inventory,
            allow backorders, and adjust quantities.
          </p>
        </div>

        <InventoryActionBar
          search={search}
          onSearchChange={setSearch}
          showOnlyTracked={showOnlyTracked}
          onShowOnlyTrackedChange={setShowOnlyTracked}
          showLowStock={showLowStock}
          onShowLowStockChange={setShowLowStock}
          lowStockThreshold={lowStockThreshold}
          onLowStockThresholdChange={setLowStockThreshold}
          onRefresh={load}
          onReseedMissing={handleReseedMissing}
        />
      </div>

      {err ? <ErrorAlert message={err} onRetry={load} /> : null}

      {loading ? (
        <LoadingState />
      ) : (
        <div className="inventory-table">
          <InventoryTable
            rows={filtered}
            lowStockThreshold={lowStockThreshold}
            onEdit={handleEdit}
          />
        </div>
      )}

      <EditInventoryForm
        open={editOpen}
        row={selected}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
