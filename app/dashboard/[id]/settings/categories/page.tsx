// app/settings/categories/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

import "./_components/categories.scss";

import { CategoryActionBar } from "./_components/CategoryActionBar";
import { CategoriesTable, type CategoryRow } from "./_components/CategoriesTable";
import { LoadingState } from "./_components/LoadingState";
import { ErrorAlert } from "./_components/ErrorAlert";
import { CreateCategoryModal } from "./_components/CreateCategoryModal";
import { EditCategoryForm } from "./_components/EditCategoryForm";
import { DeleteConfirmModal } from "./_components/DeleteConfirmModal";

type DbCategory = CategoryRow & {
  position?: number; // exists now after your ALTER, but keep optional for safety
};

export default function CategoriesPage() {
  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const [rows, setRows] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selected, setSelected] = useState<CategoryRow | null>(null);

  const load = async () => {
    setErr(null);
    setLoading(true);

    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug,parent_id,position")
      .order("position", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      setErr(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data as DbCategory[]) ?? []);
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
        r.slug.toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  // ✅ Create
  const handleCreate = async (data: { name: string; slug: string; parent_id: string | null }) => {
    setErr(null);

    // choose a "position" at end of the chosen parent group
    const siblings = rows.filter((r) => (r.parent_id ?? null) === (data.parent_id ?? null));
    const maxPos = Math.max(-1, ...siblings.map((s) => (s.position ?? 0)));
    const nextPos = maxPos + 1;

    const { error } = await supabase.from("categories").insert({
      name: data.name,
      slug: data.slug,
      parent_id: data.parent_id,
      position: nextPos,
    });

    if (error) {
      setErr(error.message);
      return;
    }

    await load();
  };

  // ✅ Edit
  const handleEdit = (cat: CategoryRow) => {
    setSelected(cat);
    setEditOpen(true);
  };

  const handleSave = async (data: { id: string; name: string; slug: string; parent_id: string | null }) => {
    setErr(null);

    // prevent self-parenting (extra guard)
    if (data.parent_id && data.parent_id === data.id) {
      setErr("A category cannot be its own parent.");
      return;
    }

    const { error } = await supabase
      .from("categories")
      .update({
        name: data.name,
        slug: data.slug,
        parent_id: data.parent_id,
      })
      .eq("id", data.id);

    if (error) {
      setErr(error.message);
      return;
    }

    await load();
  };

  // ✅ Delete
  const handleDelete = (cat: CategoryRow) => {
    setSelected(cat);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async (cat: CategoryRow) => {
    setErr(null);

    const { error } = await supabase.from("categories").delete().eq("id", cat.id);

    if (error) {
      // common case: FK block because children exist
      setErr(error.message);
      return;
    }

    await load();
  };

  return (
    <div className="categories-manager">
      <div className="categories-header">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">Categories</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Manage your storefront category tree (header + shop navigation).
          </p>
        </div>

        <CategoryActionBar
          search={search}
          onSearchChange={setSearch}
          onCreate={() => setCreateOpen(true)}
        />
      </div>

      {err ? (
        <ErrorAlert message={err} onRetry={load} />
      ) : null}

      {loading ? (
        <LoadingState />
      ) : (
        <div className="categories-table">
          <CategoriesTable categories={filtered} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      )}

      <CreateCategoryModal
        open={createOpen}
        categories={rows}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      <EditCategoryForm
        open={editOpen}
        category={selected}
        categories={rows}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        category={selected}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}