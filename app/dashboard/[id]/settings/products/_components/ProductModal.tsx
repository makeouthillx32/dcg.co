// app/dashboard/[id]/settings/products/_components/ProductModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { X, Image as ImageIcon, Tag as TagIcon, Settings2, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createBrowserClient } from "@/utils/supabase/client";
import { PRODUCT_IMAGE_BUCKET, supabasePublicUrlFromImage } from "@/lib/images";

import ProductVariantsInline from "./ProductVariantsInline";
import ProductCategoriesInline from "./ProductCategoriesInline";
import ProductCollectionsInline from "./ProductCollectionsInline";
import ProductInventoryInline from "./ProductInventoryInline";

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
  product_variants?: any[];
  categories?: any[];
  collections?: any[];
  tags?: { id: string; slug: string; name: string }[];
};

type TabType = "details" | "media" | "tags" | "advanced";

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

// Image Editor Component (for inline alt text editing)
function ImageEditor({
  img,
  idx,
  productId,
  onUpdated,
  onDeleted,
}: {
  img: ProductImageRow;
  idx: number;
  productId: string;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [editingAlt, setEditingAlt] = useState(false);
  const [altValue, setAltValue] = useState(img.alt_text || "");
  const [saving, setSaving] = useState(false);

  const url = supabasePublicUrlFromImage(img);

  const saveAlt = async () => {
    if (!img.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products/admin/${productId}/images/${img.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt_text: altValue.trim() || null }),
      });
      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message ?? "Failed to update alt text");
      }
      toast.success("Alt text updated");
      setEditingAlt(false);
      onUpdated();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update alt text");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-3 items-start border border-[hsl(var(--border))] rounded-lg p-3 bg-[hsl(var(--card))]">
      {/* Image Preview */}
      <div className="relative group flex-shrink-0">
        <img
          src={url || "/placeholder.png"}
          alt={img.alt_text || ""}
          className="w-20 h-20 object-cover rounded border border-[hsl(var(--border))]"
        />
        {img.is_primary && (
          <Badge variant="secondary" className="absolute -top-2 -left-2 text-xs bg-blue-500 text-white">
            Primary
          </Badge>
        )}
      </div>

      {/* Alt Text Editor */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            Position: {img.position ?? idx}
          </span>
          {img.is_public && <Badge variant="outline" className="text-xs">Public</Badge>}
        </div>

        {editingAlt ? (
          <div className="space-y-2">
            <Input
              value={altValue}
              onChange={(e) => setAltValue(e.target.value)}
              placeholder={`Alt text for image ${idx + 1}`}
              className="text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") saveAlt();
                if (e.key === "Escape") {
                  setEditingAlt(false);
                  setAltValue(img.alt_text || "");
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveAlt} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingAlt(false);
                  setAltValue(img.alt_text || "");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-[hsl(var(--foreground))] mb-1">
              {img.alt_text || (
                <span className="text-[hsl(var(--muted-foreground))] italic">No alt text</span>
              )}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingAlt(true)}
              className="h-7 px-2 text-xs"
            >
              Edit Alt Text
            </Button>
          </div>
        )}
      </div>

      {/* Delete Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onDeleted}
        className="text-destructive hover:text-destructive flex-shrink-0"
        title="Delete image"
      >
        <X size={16} />
      </Button>
    </div>
  );
}

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

  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [availableCollections, setAvailableCollections] = useState<any[]>([]);

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

      const catRes = await fetch("/api/categories?include=tree");
      const catJson = await safeReadJson(catRes);
      if (catRes.ok && catJson?.ok) {
        setAvailableCategories(catJson.data || []);
      }

      const colRes = await fetch("/api/collections");
      const colJson = await safeReadJson(colRes);
      if (colRes.ok && colJson?.ok) {
        setAvailableCollections(colJson.data || []);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && productId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, productId]);

  const onAutoSlug = () => setFormSlug(slugify(formTitle));

  const onSaveDetails = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      const cents = moneyToCents(formPrice);
      if (cents === null || cents < 0) throw new Error("Invalid price");

      const res = await fetch(`/api/products/admin/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          slug: formSlug.trim(),
          price_cents: cents,
          description: formDesc.trim() || null,
          badge: formBadge.trim() || null,
          is_featured: formFeatured,
          status: formStatus,
        }),
      });
      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed to save");

      toast.success("Details saved");
      await load();
      onChanged();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onUploadImages = async () => {
    if (!detail || files.length === 0) return;
    setUploading(true);
    try {
      const supabase = createBrowserClient();
      const currentImages = detail.product_images ?? [];
      const maxPos = currentImages.reduce((m, img) => Math.max(m, img.position ?? 0), -1);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = fileExt(file.name);
        const object_path = `products/${detail.id}/${randId()}.${ext}`;

        const up = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(object_path, file, {
          upsert: false,
          cacheControl: "3600",
          contentType: file.type || "application/octet-stream",
        });

        if (up.error) throw new Error(up.error.message);

        const r2 = await fetch(`/api/products/admin/${detail.id}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bucket_name: PRODUCT_IMAGE_BUCKET,
            object_path,
            alt_text: alt.trim() || null,
            position: maxPos + i + 1,
          }),
        });

        const j2 = await safeReadJson(r2);
        if (!r2.ok || !j2?.ok) throw new Error(j2?.error?.message ?? "Failed to save image");
      }

      toast.success("Images uploaded");
      setFiles([]);
      setAlt("");
      await load();
      onChanged();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const onDeleteImage = async (imgId: string) => {
    if (!detail || !confirm("Delete this image?")) return;
    try {
      const res = await fetch(`/api/products/admin/${detail.id}/images/${imgId}`, {
        method: "DELETE",
      });
      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed to delete");

      toast.success("Image deleted");
      await load();
      onChanged();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to delete image");
    }
  };

  const addTag = async () => {
    if (!productId || !tagInput.trim()) return;
    try {
      const res = await fetch(`/api/products/admin/${productId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: tagInput.trim() }),
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

            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "advanced"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              }`}
              onClick={() => setActiveTab("advanced")}
              disabled={!productId}
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles size={16} /> Advanced
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
            <div className="text-sm text-[hsl(var(--muted-foreground))]">Couldn't load product.</div>
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
              <div className="md:col-span-2">
                <Button onClick={onSaveDetails} disabled={saving}>
                  {saving ? "Saving…" : "Save Details"}
                </Button>
              </div>
            </div>
          ) : activeTab === "media" ? (
            <div className="space-y-6">
              {/* Upload New Images Section */}
              <div className="border border-[hsl(var(--border))] rounded-lg p-4 bg-[hsl(var(--muted)/0.3)]">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon size={16} />
                  Upload New Images
                </h3>
                <div className="space-y-3">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                  />

                  {files.length > 0 && (
                    <div className="space-y-2">
                      <Input
                        value={alt}
                        onChange={(e) => setAlt(e.target.value)}
                        placeholder="Alt text for all new images (optional)"
                      />
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        This alt text will be applied to all {files.length} selected image(s). You can
                        edit individual alt text after uploading.
                      </p>
                    </div>
                  )}

                  <Button onClick={onUploadImages} disabled={uploading || files.length === 0}>
                    {uploading ? "Uploading…" : `Upload ${files.length} image(s)`}
                  </Button>
                </div>
              </div>

              {/* Existing Images Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  Existing Images ({(detail.product_images ?? []).length})
                </h3>

                {(detail.product_images ?? []).length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-[hsl(var(--border))] rounded-lg">
                    <ImageIcon size={32} className="mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      No images yet. Upload some above to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(detail.product_images ?? []).map((img, idx) => (
                      <ImageEditor
                        key={img.id || idx}
                        img={img}
                        idx={idx}
                        productId={detail.id}
                        onUpdated={() => {
                          load();
                          onChanged();
                        }}
                        onDeleted={() => img.id && onDeleteImage(img.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "tags" ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Tag name or slug"
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                />
                <Button onClick={addTag}>Add</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(detail.tags ?? []).map((tag) => (
                  <div
                    key={tag.id}
                    className="px-3 py-1 bg-[hsl(var(--accent))] rounded-full text-sm flex items-center gap-2"
                  >
                    <span>{tag.name}</span>
                    <button
                      onClick={() => removeTag(tag.id || tag.slug)}
                      className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "advanced" ? (
            <div className="space-y-6">
              <ProductVariantsInline
                productId={productId}
                variants={detail.product_variants || []}
                onChanged={load}
              />

              <div className="border-t border-[hsl(var(--border))] pt-6">
                <ProductInventoryInline variants={detail.product_variants || []} onChanged={load} />
              </div>

              <div className="border-t border-[hsl(var(--border))] pt-6">
                <ProductCategoriesInline
                  productId={productId}
                  assignedCategories={detail.categories || []}
                  availableCategories={availableCategories}
                  onChanged={load}
                />
              </div>

              <div className="border-t border-[hsl(var(--border))] pt-6">
                <ProductCollectionsInline
                  productId={productId}
                  assignedCollections={detail.collections || []}
                  availableCollections={availableCollections}
                  onChanged={load}
                />
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}