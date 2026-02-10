// app/dashboard/[id]/settings/products/_components/ProductModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { X, Image as ImageIcon, Tag as TagIcon, Settings2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { createBrowserClient } from "@/utils/supabase/client";

// ✅ use your new helpers
import {
  PRODUCT_IMAGE_BUCKET,
  supabasePublicUrlFromImage,
  toNextOptimizedImageUrl,
} from "@/lib/images";

/* ---------------- Types ---------------- */

export type ProductImageRow = {
  id?: string;
  bucket_name: string | null;
  object_path: string | null;
  alt_text?: string | null;
  sort_order?: number | null;
  position?: number | null;
  is_primary?: boolean | null;
  is_public?: boolean | null;
  created_at?: string;
};

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
  product_images?: ProductImageRow[];
  tags?: { id: string; slug: string; name: string }[];
};

type TabType = "details" | "media" | "tags";

/* ---------------- Helpers ---------------- */

function centsToMoney(cents: number, currency: string = "USD") {
  const amt = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amt);
  } catch {
    return `$${amt.toFixed(2)}`;
  }
}

function moneyToCents(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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

function fileExt(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "jpg";
}
function randId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

/* ---------------- Component ---------------- */

export default function ProductModal({
  open,
  onOpenChange,
  productId,
  title = "Manage Product",
  onChanged,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId: string | null;
  title?: string;
  onChanged: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("details");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<ProductRow | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formStatus, setFormStatus] = useState<"draft" | "active" | "archived">("draft");

  const [files, setFiles] = useState<File[]>([]);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);

  const [tagInput, setTagInput] = useState("");

  const load = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/admin/${productId}`, { cache: "no-store" });
      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed to load product");

      const data = json.data as ProductRow;
      setDetail(data);

      setFormTitle(data.title ?? "");
      setFormSlug(data.slug ?? "");
      setFormPrice(((data.price_cents ?? 0) / 100).toFixed(2));
      setFormDesc(data.description ?? "");
      setFormBadge(data.badge ?? "");
      setFormFeatured(Boolean(data.is_featured));
      setFormStatus((data.status as any) ?? "draft");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && productId) {
      setActiveTab("details");
      load();
    } else {
      setFiles([]);
      setAlt("");
      setTagInput("");
      setDetail(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, productId]);

  const onAutoSlug = () => {
    const next = slugify(formTitle);
    setFormSlug(next);
    if (next) toast.success("Slug generated");
  };

  const saveDetails = async () => {
    if (!productId) return;
    if (!formTitle.trim()) return toast.error("Title is required");
    if (!formSlug.trim()) return toast.error("Slug is required");

    const cents = moneyToCents(formPrice);
    if (cents === null || cents < 0) return toast.error("Price must be valid");

    setSaving(true);
    try {
      const res = await fetch(`/api/products/admin/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          slug: formSlug.trim(),
          price_cents: cents,
          description: formDesc.trim() ? formDesc.trim() : null,
          badge: formBadge.trim() ? formBadge.trim() : null,
          is_featured: Boolean(formFeatured),
          status: formStatus,
        }),
      });

      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed to save");

      toast.success("Saved");
      await load();
      onChanged();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadAll = async () => {
    if (!productId) return;
    if (!files.length) return toast.error("Choose images first");

    setUploading(true);
    try {
      const supabase = createBrowserClient();

      for (const file of files) {
        const object_path = `products/${productId}/${randId()}.${fileExt(file.name)}`;

        const up = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(object_path, file, {
          upsert: false,
          cacheControl: "3600",
          contentType: file.type || "image/*",
        });

        if (up.error) throw new Error(up.error.message);

        // ✅ Insert DB row using bucket_name + object_path
        const res = await fetch(`/api/products/admin/${productId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bucket_name: PRODUCT_IMAGE_BUCKET,
            object_path,
            alt_text: alt.trim() ? alt.trim() : null,
          }),
        });

        const json = await safeReadJson(res);
        if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed to add image row");
      }

      toast.success(`Uploaded ${files.length} image(s)`);
      setFiles([]);
      setAlt("");

      await load();
      onChanged();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addTag = async () => {
    if (!productId) return;
    const raw = tagInput.trim();
    if (!raw) return;

    const slug = slugify(raw);

    try {
      const res = await fetch(`/api/products/admin/${productId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name: raw }),
      });

      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed to add tag");

      toast.success("Tag added");
      setTagInput("");

      await load();
      onChanged();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to add tag");
    }
  };

  const removeTag = async (tagIdOrSlug: string) => {
    if (!productId) return;

    try {
      const res = await fetch(`/api/products/admin/${productId}/tags`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: tagIdOrSlug }),
      });

      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed to remove tag");

      toast.success("Tag removed");

      await load();
      onChanged();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to remove tag");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]">
          <DialogHeader className="px-5 py-4">
            <DialogTitle className="flex items-center justify-between gap-3">
              <span className="truncate">{title}</span>
              <div className="flex items-center gap-2">
                {detail?.status ? <Badge variant="secondary">{detail.status}</Badge> : null}
                <button
                  onClick={() => onOpenChange(false)}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex border-t border-[hsl(var(--border))]">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "details"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              }`}
              onClick={() => setActiveTab("details")}
              disabled={!productId}
            >
              <span className="inline-flex items-center gap-2">
                <Settings2 size={16} /> Details
              </span>
            </button>

            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "media"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              }`}
              onClick={() => setActiveTab("media")}
              disabled={!productId}
            >
              <span className="inline-flex items-center gap-2">
                <ImageIcon size={16} /> Photos
              </span>
            </button>

            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "tags"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              }`}
              onClick={() => setActiveTab("tags")}
              disabled={!productId}
            >
              <span className="inline-flex items-center gap-2">
                <TagIcon size={16} /> Tags
              </span>
            </button>
          </div>
        </div>

        <div className="max-h-[75vh] overflow-auto p-5">
          {!productId ? (
            <div className="text-sm text-[hsl(var(--muted-foreground))]">Select a product to manage.</div>
          ) : loading ? (
            <div className="text-sm text-[hsl(var(--muted-foreground))]">Loading…</div>
          ) : !detail ? (
            <div className="text-sm text-[hsl(var(--muted-foreground))]">Couldn’t load product.</div>
          ) : activeTab === "details" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Title</label>
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Slug</label>
                <div className="flex gap-2">
                  <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} />
                  <Button type="button" variant="secondary" onClick={onAutoSlug}>
                    Auto
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Price (USD)</label>
                <Input value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Current: {centsToMoney(detail.price_cents, detail.currency)}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Badge (optional)</label>
                <Input value={formBadge} onChange={(e) => setFormBadge(e.target.value)} />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold">Description</label>
                <Textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="featured"
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                />
                <label htmlFor="featured" className="text-sm font-semibold">
                  Featured
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {(["draft", "active", "archived"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`px-3 py-1 rounded-full border text-sm ${
                        formStatus === s
                          ? "border-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      }`}
                      onClick={() => setFormStatus(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === "media" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                <h3 className="font-semibold">Upload Photos</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  Multi-upload supported. Bucket: <code>{PRODUCT_IMAGE_BUCKET}</code>
                </p>

                <div className="mt-3 space-y-2">
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
                  <Button onClick={uploadAll} disabled={!files.length || uploading}>
                    {uploading ? "Uploading…" : `Upload ${files.length ? `(${files.length})` : ""}`}
                  </Button>
                </div>
              </div>

              {/* ✅ Render existing images properly */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {(detail.product_images ?? [])
                  .slice()
                  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                  .map((img, idx) => {
                    const publicUrl = supabasePublicUrlFromImage(img);
                    // ✅ Force Next optimizer => browser receives webp/avif when possible
                    const url = publicUrl
                      ? toNextOptimizedImageUrl(publicUrl, { width: 800, quality: 82 })
                      : null;

                    return (
                      <div
                        key={`${img.bucket_name ?? "bucket"}:${img.object_path ?? "path"}:${idx}`}
                        className="rounded-lg border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--background))]"
                      >
                        {url ? (
                          <img
                            src={url}
                            alt={img.alt_text ?? "product image"}
                            className="w-full aspect-square object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full aspect-square flex items-center justify-center text-xs text-[hsl(var(--muted-foreground))]">
                            Missing URL
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                <h3 className="font-semibold">Add Tag</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  Use tags as subcategories (ex: <code>tops</code>, <code>denim</code>,{" "}
                  <code>accessories</code>).
                </p>

                <div className="mt-3 flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag… (ex: Date Night)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addTag();
                    }}
                  />
                  <Button variant="secondary" onClick={addTag}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(detail.tags ?? []).length === 0 ? (
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">No tags yet.</span>
                ) : (
                  (detail.tags ?? []).map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-3 py-1 bg-[hsl(var(--background))]"
                    >
                      <span className="text-sm font-semibold">{t.name}</span>
                      <button
                        className="text-xs text-[hsl(var(--muted-foreground))] hover:opacity-80"
                        onClick={() => removeTag(t.id)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                Tip: keep tags consistent. Enter “Date Night” once, then reuse it everywhere.
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4">
          <Button variant="secondary" onClick={load} disabled={loading || !productId}>
            Refresh
          </Button>

          {activeTab === "details" ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={saveDetails} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}