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
 * Inventory Manager
 * - Reads inventory rows and joins product + variant to show SKU/title
 * - Lets you toggle track_inventory / backorders / quantity
 * - Provides "Seed Missing" (creates inventory rows for variants that don't have one yet)
 *
 * NOTE:
 * This page assumes these columns exist on public.inventory:
 *  - id, variant_id, quantity, track_inventory, allow_backorder, updated_at
 *
 * And these exist on public.product_variants:
 *  - id, product_id, title, sku
 *
 * And these exist on public.products:
 *  - id, title
 *
 * If any naming differs, tell me your actual column names and I’ll adjust.
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

    // Join chain: inventory -> product_variants -> products
    // Supabase nested select syntax:
    // inventory.select("..., product_variants(..., products(...))")
    const { data, error } = await supabase
      .from("inventory")
      .select(
        `
        id,
        variant_id,
        quantity,
        track_inventory,
        allow_backorder,
        updated_at,
        product_variants (
          id,
          title,
          sku,
          product_id,
          products (
            id,
            title
          )
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
      (data ?? []).map((r: any) => ({
        inventory_id: r.id,
        variant_id: r.variant_id,

        product_title: r.product_variants?.products?.title ?? null,
        variant_title: r.product_variants?.title ?? null,
        sku: r.product_variants?.sku ?? null,

        quantity: r.quantity ?? 0,
        track_inventory: !!r.track_inventory,
        allow_backorder: !!r.allow_backorder,

        updated_at: r.updated_at ?? null,
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
        // If "Low stock" is enabled, we ignore non-tracked items by default
        return false;
      }

      if (!q) return true;

      const hay = [
        r.product_title ?? "",
        r.variant_title ?? "",
        r.sku ?? "",
      ]
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
    inventory_id: string;
    quantity: number;
    track_inventory: boolean;
    allow_backorder: boolean;
  }) => {
    setErr(null);

    const { error } = await supabase
      .from("inventory")
      .update({
        quantity: data.quantity,
        track_inventory: data.track_inventory,
        allow_backorder: data.allow_backorder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.inventory_id);

    if (error) {
      setErr(error.message);
      return;
    }

    // Optimistic update
    setRows((prev) =>
      prev.map((r) =>
        r.inventory_id === data.inventory_id
          ? {
              ...r,
              quantity: data.quantity,
              track_inventory: data.track_inventory,
              allow_backorder: data.allow_backorder,
              updated_at: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const handleReseedMissing = async () => {
    setErr(null);

    // Create inventory rows for variants missing them
    // Default stock = 25, tracked = true, backorder = false
    const { data: variants, error: vErr } = await supabase
      .from("product_variants")
      .select("id");

    if (vErr) {
      setErr(vErr.message);
      return;
    }

    const variantIds: string[] = (variants ?? []).map((v: any) => v.id);
    if (!variantIds.length) return;

    const { data: existing, error: eErr } = await supabase
      .from("inventory")
      .select("variant_id");

    if (eErr) {
      setErr(eErr.message);
      return;
    }

    const existingSet = new Set((existing ?? []).map((x: any) => x.variant_id));
    const missing = variantIds.filter((id) => !existingSet.has(id));

    if (!missing.length) {
      await load();
      return;
    }

    const insertRows = missing.map((id) => ({
      variant_id: id,
      quantity: 25,
      track_inventory: true,
      allow_backorder: false,
    }));

    const { error: iErr } = await supabase.from("inventory").insert(insertRows);

    if (iErr) {
      setErr(iErr.message);
      return;
    }

    await load();
  };

  return (
    <div className="inventory-manager">
      <div className="inventory-header">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">Inventory</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Manage stock per variant. Track inventory, allow backorders, and adjust quantities.
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