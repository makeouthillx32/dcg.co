// app/settings/top-banner/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

import "./_components/top-banner.scss";

import { LoadingState } from "./_components/LoadingState";
import { ErrorAlert } from "./_components/ErrorAlert";
import { BannerActionBar } from "./_components/BannerActionBar";
import { BannerItemsTable, type BannerItemRow } from "./_components/BannerItemsTable";
import { BannerItemModal } from "./_components/BannerItemModal";
import { DeleteConfirmModal } from "./_components/DeleteConfirmModal";

type BannerRow = {
  id: string;
  key: string;
  is_enabled: boolean;
};

export default function TopBannerSettingsPage() {
  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [banner, setBanner] = useState<BannerRow | null>(null);
  const [items, setItems] = useState<BannerItemRow[]>([]);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BannerItemRow | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<BannerItemRow | null>(null);

  const BANNER_KEY = "top_banner";

  const load = async () => {
    setErr(null);
    setLoading(true);

    // 1) Ensure banner row exists
    const { data: upserted, error: upsertErr } = await supabase
      .from("site_banners")
      .upsert({ key: BANNER_KEY, is_enabled: true }, { onConflict: "key" })
      .select("id,key,is_enabled")
      .single();

    if (upsertErr) {
      setErr(upsertErr.message);
      setLoading(false);
      return;
    }

    setBanner(upserted as BannerRow);

    // 2) Load items
    const { data: itemRows, error: itemsErr } = await supabase
      .from("site_banner_items")
      .select("id,text,position,is_enabled")
      .eq("banner_id", upserted.id)
      .order("position", { ascending: true });

    if (itemsErr) {
      setErr(itemsErr.message);
      setItems([]);
      setLoading(false);
      return;
    }

    setItems((itemRows as BannerItemRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewText = useMemo(() => {
    const enabledItems = items
      .filter((i) => i.is_enabled)
      .sort((a, b) => a.position - b.position);

    if (!banner?.is_enabled || enabledItems.length === 0) return "Banner is disabled.";

    return enabledItems.map((i) => i.text).join(" • ");
  }, [banner?.is_enabled, items]);

  // -----------------------
  // Banner enabled toggle
  // -----------------------
  const setBannerEnabled = async (enabled: boolean) => {
    if (!banner) return;
    setErr(null);

    const { error } = await supabase
      .from("site_banners")
      .update({ is_enabled: enabled })
      .eq("id", banner.id);

    if (error) {
      setErr(error.message);
      return;
    }

    setBanner({ ...banner, is_enabled: enabled });
  };

  // -----------------------
  // Items CRUD
  // -----------------------
  const openAddItem = () => {
    setEditingItem(null);
    setItemModalOpen(true);
  };

  const openEditItem = (item: BannerItemRow) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const saveItem = async ({ text }: { text: string }) => {
    if (!banner) return;
    setErr(null);

    if (editingItem) {
      const { error } = await supabase
        .from("site_banner_items")
        .update({ text })
        .eq("id", editingItem.id);

      if (error) {
        setErr(error.message);
        return;
      }
    } else {
      const nextPos = items.length ? Math.max(...items.map((i) => i.position)) + 1 : 0;

      const { error } = await supabase.from("site_banner_items").insert({
        banner_id: banner.id,
        text,
        position: nextPos,
        is_enabled: true,
      });

      if (error) {
        setErr(error.message);
        return;
      }
    }

    await load();
  };

  const toggleItemEnabled = async (item: BannerItemRow, enabled: boolean) => {
    setErr(null);

    const { error } = await supabase
      .from("site_banner_items")
      .update({ is_enabled: enabled })
      .eq("id", item.id);

    if (error) {
      setErr(error.message);
      return;
    }

    setItems((prev) =>
      prev.map((x) => (x.id === item.id ? { ...x, is_enabled: enabled } : x))
    );
  };

  const openDelete = (item: BannerItemRow) => {
    setDeletingItem(item);
    setDeleteOpen(true);
  };

  const confirmDelete = async (item: BannerItemRow) => {
    setErr(null);

    const { error } = await supabase
      .from("site_banner_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      setErr(error.message);
      return;
    }

    await load();
  };

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="top-banner-manager">
      <div className="top-banner-header">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">Top Banner</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Manage the message bar shown above the header.
          </p>
        </div>

        <div className="top-banner-preview">
          <div className="top-banner-preview-bar">{previewText}</div>
        </div>

        <BannerActionBar
          enabled={!!banner?.is_enabled}
          onToggleEnabled={setBannerEnabled}
          onAddItem={openAddItem}
        />
      </div>

      {err ? <ErrorAlert message={err} onRetry={load} /> : null}

      {loading ? (
        <LoadingState />
      ) : (
        <BannerItemsTable
          items={items}
          onEdit={openEditItem}
          onDelete={openDelete}
          onToggleEnabled={toggleItemEnabled}
        />
      )}

      <BannerItemModal
        open={itemModalOpen}
        item={editingItem}
        onClose={() => setItemModalOpen(false)}
        onSave={saveItem}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        item={deletingItem}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}