//app\dashboard\[id]\settings\products\_components\CreateProductModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createBrowserClient } from "@/utils/supabase/client";
import { PRODUCT_IMAGE_BUCKET } from "@/lib/images";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function safeExtFromFile(file: File) {
  const type = (file.type || "").toLowerCase();
  if (type.includes("jpeg")) return "jpg";
  if (type.includes("jpg")) return "jpg";
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("gif")) return "gif";
  if (type.includes("avif")) return "avif";
  if (type.includes("heic") || type.includes("heif")) return "heic";

  const name = file.name || "";
  const i = name.lastIndexOf(".");
  const ext = i >= 0 ? name.slice(i + 1).toLowerCase() : "jpg";
  return ext || "jpg";
}

function buildObjectPath(productId: string, index1Based: number, ext: string) {
  return `products/${productId}/${index1Based}.${ext}`;
}

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: { code: "NON_JSON_RESPONSE", message: text.slice(0, 300) } };
  }
}

function moneyToCents(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
  description,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))]">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {description ? (
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{description}</div>
          ) : null}
        </div>
        <span className="text-[hsl(var(--muted-foreground))]">
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>
      </button>

      {open ? <div className="px-4 pb-4 pt-1">{children}</div> : null}
    </div>
  );
}

type CategoryNode = {
  id: string;
  name?: string;
  title?: string;
  label?: string;
  slug?: string;
  children?: CategoryNode[];
};

type CollectionRow = {
  id: string;
  name?: string;
  title?: string;
  label?: string;
  slug?: string;
  is_home_section?: boolean;
  is_homepage?: boolean;
};

export default function CreateProductModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  // Core fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("0.00");
  const [description, setDescription] = useState("");

  // Images
  const [files, setFiles] = useState<File[]>([]);
  const [alt, setAlt] = useState("");

  // Creation extras (optional)
  const [secVariantOpen, setSecVariantOpen] = useState(false);
  const [secStockOpen, setSecStockOpen] = useState(false);
  const [secCategoriesOpen, setSecCategoriesOpen] = useState(false);
  const [secCollectionsOpen, setSecCollectionsOpen] = useState(false);

  // Default Variant
  const [variantSku, setVariantSku] = useState("");
  const [variantWeightGrams, setVariantWeightGrams] = useState(""); // string input
  const [variantPriceOverride, setVariantPriceOverride] = useState(""); // blank => inherit

  // Initial stock
  const [initialStock, setInitialStock] = useState(""); // string input

  // Categories
  const [availableCategories, setAvailableCategories] = useState<CategoryNode[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Collections
  const [availableCollections, setAvailableCollections] = useState<CollectionRow[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

  const [creating, setCreating] = useState(false);

  const cents = useMemo(() => moneyToCents(price), [price]);

  const autoSlug = () => setSlug(slugify(title));

  const reset = () => {
    setTitle("");
    setSlug("");
    setPrice("0.00");
    setDescription("");
    setFiles([]);
    setAlt("");

    setVariantSku("");
    setVariantWeightGrams("");
    setVariantPriceOverride("");
    setInitialStock("");
    setSelectedCategoryIds([]);
    setSelectedCollectionIds([]);

    setSecVariantOpen(false);
    setSecStockOpen(false);
    setSecCategoriesOpen(false);
    setSecCollectionsOpen(false);
  };

  // Fetch categories/collections when modal opens (only if user might use them)
  useEffect(() => {
    if (!open) return;

    // We fetch once on open so the sections are ready when expanded.
    // If you want lazier loading, we can move these into section toggles.
    (async () => {
      try {
        const catRes = await fetch("/api/categories?include=tree");
        const catJson = await safeReadJson(catRes);
        if (catRes.ok && catJson?.ok) setAvailableCategories(catJson.data || []);
      } catch {}

      try {
        const colRes = await fetch("/api/collections");
        const colJson = await safeReadJson(colRes);
        if (colRes.ok && colJson?.ok) setAvailableCollections(colJson.data || []);
      } catch {}
    })();
  }, [open]);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleCollection = (id: string) => {
    setSelectedCollectionIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const renderCategoryTree = (nodes: CategoryNode[], depth = 0) => {
    return (
      <div className="space-y-1">
        {nodes.map((n) => {
          const label = n.name ?? n.title ?? n.label ?? n.slug ?? "Untitled";
          const hasChildren = (n.children?.length ?? 0) > 0;
          const checked = selectedCategoryIds.includes(n.id);

          return (
            <div key={n.id}>
              <label
                className="flex items-center gap-2 text-sm"
                style={{ paddingLeft: `${depth * 12}px` }}
              >
                <input type="checkbox" checked={checked} onChange={() => toggleCategory(n.id)} />
                <span>{label}</span>
              </label>
              {hasChildren ? <div className="mt-1">{renderCategoryTree(n.children!, depth + 1)}</div> : null}
            </div>
          );
        })}
      </div>
    );
  };

  const create = async () => {
    if (!title.trim()) return toast.error("Title is required");

    const finalSlug = (slug.trim() || slugify(title)).trim();
    if (!finalSlug) return toast.error("Slug is required");

    if (cents === null || cents < 0) return toast.error("Price must be valid");

    // Parse optional values
    const weightGrams =
      variantWeightGrams.trim() === "" ? null : Number(variantWeightGrams.trim());
    if (weightGrams !== null && (!Number.isFinite(weightGrams) || weightGrams < 0)) {
      return toast.error("Weight must be a valid number (grams)");
    }

    const overrideCents =
      variantPriceOverride.trim() === "" ? null : moneyToCents(variantPriceOverride.trim());
    if (overrideCents !== null && (overrideCents === null || overrideCents < 0)) {
      return toast.error("Variant price override must be valid");
    }

    const stockQty =
      initialStock.trim() === "" ? null : Number(initialStock.trim());
    if (stockQty !== null && (!Number.isFinite(stockQty) || stockQty < 0)) {
      return toast.error("Initial stock must be a valid number (>= 0)");
    }

    const wantsVariant =
      !!variantSku.trim() || weightGrams !== null || overrideCents !== null || stockQty !== null;

    setCreating(true);

    try {
      // 1) Create product (draft)
      const res = await fetch("/api/products/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: finalSlug,
          description: description.trim() ? description.trim() : null,
          price_cents: cents,
          status: "draft",
        }),
      });

      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed to create product");

      const productId = json.data?.id as string;
      if (!productId) throw new Error("Create succeeded but no product id returned");

      // 2) Create default variant (optional)
      let createdVariantId: string | null = null;
      if (wantsVariant) {
        const vRes = await fetch(`/api/products/admin/${productId}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Default",
            sku: variantSku.trim() || null,
            weight_grams: weightGrams,
            // If override is blank, let backend inherit or keep null
            price_cents: overrideCents,
          }),
        });

        const vJson = await safeReadJson(vRes);
        if (!vRes.ok || !vJson?.ok) throw new Error(vJson?.error?.message ?? "Failed to create default variant");

        createdVariantId = vJson.data?.id ?? null;

        // 3) Seed initial stock (optional) — requires variant id
        if (createdVariantId && stockQty !== null) {
          const mRes = await fetch("/api/inventory/movements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              variant_id: createdVariantId,
              delta_qty: stockQty,
              reason: "initial",
              note: "Initial stock from product creation",
            }),
          });

          const mJson = await safeReadJson(mRes);
          if (!mRes.ok || !mJson?.ok) {
            throw new Error(mJson?.error?.message ?? "Failed to seed initial stock");
          }
        }
      }

      // 4) Assign categories (optional, parallel)
      if (selectedCategoryIds.length) {
        await Promise.all(
          selectedCategoryIds.map(async (category_id) => {
            const r = await fetch(`/api/products/admin/${productId}/categories`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ category_id }),
            });
            const j = await safeReadJson(r);
            if (!r.ok || !j?.ok) throw new Error(j?.error?.message ?? "Failed to assign category");
          })
        );
      }

      // 5) Assign collections (optional, parallel)
      if (selectedCollectionIds.length) {
        await Promise.all(
          selectedCollectionIds.map(async (collection_id) => {
            const r = await fetch(`/api/products/admin/${productId}/collections`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ collection_id }),
            });
            const j = await safeReadJson(r);
            if (!r.ok || !j?.ok) throw new Error(j?.error?.message ?? "Failed to assign collection");
          })
        );
      }

      // 6) Upload images (optional)
      if (files.length) {
        const supabase = createBrowserClient();

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const ext = safeExtFromFile(file);
          const object_path = buildObjectPath(productId, i + 1, ext);

          const up = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(object_path, file, {
            upsert: false,
            cacheControl: "3600",
            contentType: file.type || "application/octet-stream",
          });

          if (up.error) throw new Error(up.error.message);

          const r2 = await fetch(`/api/products/admin/${productId}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bucket_name: PRODUCT_IMAGE_BUCKET,
              object_path,
              alt_text: alt.trim() ? alt.trim() : null,
              position: i,
            }),
          });

          const j2 = await safeReadJson(r2);
          if (!r2.ok || !j2?.ok) {
            throw new Error(j2?.error?.message ?? `Failed to create image row (${r2.status})`);
          }
        }
      }

      // Success message
      const bits: string[] = [];
      if (wantsVariant) bits.push("default variant");
      if (wantsVariant && stockQty !== null) bits.push("initial stock");
      if (selectedCategoryIds.length) bits.push(`${selectedCategoryIds.length} categor${selectedCategoryIds.length === 1 ? "y" : "ies"}`);
      if (selectedCollectionIds.length) bits.push(`${selectedCollectionIds.length} collection${selectedCollectionIds.length === 1 ? "" : "s"}`);
      if (files.length) bits.push(`${files.length} image${files.length === 1 ? "" : "s"}`);

      toast.success(bits.length ? `Product created with ${bits.join(", ")}` : "Product created");

      onOpenChange(false);
      onCreated();
      reset();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Create failed");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Slug</label>
            <div className="flex gap-2">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              <Button type="button" variant="secondary" onClick={autoSlug}>
                Auto
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Price (USD)</label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Images */}
          <div className="rounded-xl border border-[hsl(var(--border))] p-3">
            <div className="text-sm font-semibold">Images (optional)</div>
            <div className="mt-2 space-y-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
              <Input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Alt text applied to uploaded images (optional)"
              />
              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                Saved as: <code>products/&lt;productId&gt;/1.ext</code>, <code>2.ext</code>,{" "}
                <code>3.ext</code>… in bucket: <code>{PRODUCT_IMAGE_BUCKET}</code>
              </div>
            </div>
          </div>

          {/* New collapsible sections */}
          <CollapsibleSection
            title="Default Variant (optional)"
            description="Seed SKU, weight, and optional price override during creation."
            open={secVariantOpen}
            onToggle={() => setSecVariantOpen((v) => !v)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold">SKU</label>
                <Input value={variantSku} onChange={(e) => setVariantSku(e.target.value)} placeholder="e.g. DES-BOOT-001" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Weight (grams)</label>
                <Input value={variantWeightGrams} onChange={(e) => setVariantWeightGrams(e.target.value)} placeholder="e.g. 1200" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold">Price Override (optional)</label>
                <Input value={variantPriceOverride} onChange={(e) => setVariantPriceOverride(e.target.value)} placeholder="blank = inherit product price" />
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] md:col-span-2">
                If you enter any of these fields, we’ll create a “Default” variant for the product.
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Initial Stock (optional)"
            description="Seed starting inventory for the default variant."
            open={secStockOpen}
            onToggle={() => setSecStockOpen((v) => !v)}
          >
            <div className="space-y-2">
              <label className="text-sm font-semibold">Starting Quantity</label>
              <Input value={initialStock} onChange={(e) => setInitialStock(e.target.value)} placeholder="e.g. 50" />
              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                Requires a variant. If you set stock, we’ll create a Default variant if needed.
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Categories (optional)"
            description="Assign categories now (no category creation here)."
            open={secCategoriesOpen}
            onToggle={() => setSecCategoriesOpen((v) => !v)}
          >
            {!availableCategories.length ? (
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                No categories loaded yet (or none exist).
              </div>
            ) : (
              <div className="max-h-[260px] overflow-auto pr-2">
                {renderCategoryTree(availableCategories)}
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="Collections (optional)"
            description="Assign collections now (no collection creation here)."
            open={secCollectionsOpen}
            onToggle={() => setSecCollectionsOpen((v) => !v)}
          >
            {!availableCollections.length ? (
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                No collections loaded yet (or none exist).
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-auto pr-2">
                {availableCollections.map((c) => {
                  const label = c.name ?? c.title ?? c.label ?? c.slug ?? "Untitled";
                  const checked = selectedCollectionIds.includes(c.id);
                  const home = Boolean((c as any).is_home_section ?? (c as any).is_homepage);
                  return (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={checked} onChange={() => toggleCollection(c.id)} />
                      <span className="flex items-center gap-2">
                        {label}
                        {home ? (
                          <span className="text-xs rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-[hsl(var(--muted-foreground))]">
                            homepage
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </CollapsibleSection>

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={create} disabled={creating}>
              {creating ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
