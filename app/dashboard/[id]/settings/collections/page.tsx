// app/dashboard/[id]/settings/collections/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

import "./_components/collections.scss";

import { LoadingState } from "./_components/LoadingState";
import { ErrorAlert } from "./_components/ErrorAlert";
import { CollectionsActionBar } from "./_components/CollectionsActionBar";
import { CollectionsTable, type CollectionRow } from "./_components/CollectionsTable";
import CreateCollectionModal from "./_components/CreateCollectionModal"; // ✅ Changed to default import
import { EditCollectionForm } from "./_components/EditCollectionForm";
import { DeleteConfirmModal } from "./_components/DeleteConfirmModal";

export default function CollectionsPage() {
  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const [rows, setRows] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selected, setSelected] = useState<CollectionRow | null>(null);

  const load = async () => {
    setErr(null);
    setLoading(true);

    const { data, error } = await supabase
      .from("collections")
      .select("id,name,slug,description,position,is_home_section,cover_image_bucket,cover_image_path,cover_image_alt") // ✅ Added cover image fields
      .order("position", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      setErr(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data as CollectionRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      return (
        r.name.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  // ✅ Create
  const handleCreate = async (data: {
    name: string;
    slug: string;
    description: string | null;
    is_home_section: boolean;
  }) => {
    setErr(null);

    // Put new collection at end
    const maxPos = Math.max(-1, ...rows.map((r) => r.position ?? 0));
    const nextPos = maxPos + 1;

    const { error } = await supabase.from("collections").insert({
      name: data.name,
      slug: data.slug,
      description: data.description,
      is_home_section: data.is_home_section,
      position: nextPos,
    });

    if (error) {
      setErr(error.message);
      return;
    }

    await load();
    setCreateOpen(false); // ✅ Close modal after success
  };

  // ✅ Edit
  const handleEdit = (row: CollectionRow) => {
    setSelected(row);
    setEditOpen(true);
  };

  const handleSave = async (data: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_home_section: boolean;
  }) => {
    setErr(null);

    const { error } = await supabase
      .from("collections")
      .update({
        name: data.name,
        slug: data.slug,
        description: data.description,
        is_home_section: data.is_home_section,
      })
      .eq("id", data.id);

    if (error) {
      setErr(error.message);
      return;
    }

    await load();
    setEditOpen(false); // ✅ Close modal after success
  };

  // ✅ Delete
  const handleDelete = (row: CollectionRow) => {
    setSelected(row);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async (row: CollectionRow) => {
    setErr(null);

    const { error } = await supabase.from("collections").delete().eq("id", row.id);

    if (error) {
      setErr(error.message);
      return;
    }

    await load();
    setDeleteOpen(false); // ✅ Close modal after success
  };

  return (
    <div className="collections-manager">
      <div className="collections-header">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">Collections</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Manage storefront collections (used in /collections/* and footer links).
          </p>
        </div>

        <CollectionsActionBar
          search={search}
          onSearchChange={setSearch}
          onCreate={() => setCreateOpen(true)}
        />
      </div>

      {err ? <ErrorAlert message={err} onRetry={load} /> : null}

      {loading ? (
        <LoadingState />
      ) : (
        <div className="collections-table">
          <CollectionsTable collections={filtered} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      )}

      <CreateCollectionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      <EditCollectionForm
        open={editOpen}
        collection={selected}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        collection={selected}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}