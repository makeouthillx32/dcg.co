"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { TopProductsSkeleton } from "@/components/Tables/top-products/skeleton";

// ✅ uses your supabase browser client (adjust path if yours differs)
import { createBrowserClient } from "@/utils/supabase/client";

// ✅ uses your bucket constant (make sure it matches your storage bucket name)
import { PRODUCT_IMAGE_BUCKET, storagePathToUrl } from "@/lib/images";

type ProductRow = {
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

type ProductDetail = ProductRow & {
  tags?: { id: string; slug: string; name: string }[];
  product_images?: { id?: string; storage_path: string; alt: string | null; position: number }[];
};

function centsToMoney(cents: number, currency: string = "USD") {
  const amt = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amt);
  } catch {
    return `$${amt.toFixed(2)}`;
  }
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

export default function ProductUploaderPage() {
  // --- create form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [badge, setBadge] = useState("");

  // --- list state
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // IMPORTANT: use admin list so you can see DRAFT products you create
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
      console.error(e);
      setError(e?.message ?? "Failed to load products.");
    } finally {
      mode === "initial" ? setIsLoading(false) : setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts("initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return products;
    return products.filter((p) =>
      [p.title, p.slug, p.badge ?? "", p.currency, p.status ?? ""].join(" ").toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const onAutoSlug = () => {
    const next = slugify(title);
    setSlug(next);
    if (next) toast.success("Slug generated");
  };

  const onCreateProduct = async () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!slug.trim()) return toast.error("Slug is required");

    const dollars = Number(price);
    if (!Number.isFinite(dollars) || dollars < 0) return toast.error("Price must be a valid number");
    const price_cents = Math.round(dollars * 100);

    setIsSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          price_cents,
          description: description.trim() ? description.trim() : null,
          currency: "USD",
          badge: badge.trim() ? badge.trim() : null,
          is_featured: Boolean(isFeatured),
        }),
      });

      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? `Create failed: ${res.status}`);

      toast.success("Product created (draft)");

      setTitle("");
      setSlug("");
      setPrice("");
      setDescription("");
      setBadge("");
      setIsFeatured(false);

      await fetchProducts("refresh");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to create product");
    } finally {
      setIsSaving(false);
    }
  };

  const onArchiveProduct = async (productId: string) => {
    const sure = confirm("Archive this product? (It will be hidden from storefront)");
    if (!sure) return;

    try {
      const res = await fetch(`/api/products/admin/${productId}`, { method: "DELETE" });
      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? `Archive failed: ${res.status}`);

      toast.success("Product archived");
      await fetchProducts("refresh");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to archive product");
    }
  };

  return (
    <ShowcaseSection title="Product Uploader">
      <div className="space-y-8">
        {/* Creator */}
        <div className="rounded-[calc(var(--radius)*1.25)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-sm)] p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Create a Product</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                Creates a <b>draft</b>. Use “Manage” to upload photos + add tags.
              </p>
            </div>

            <Button onClick={onCreateProduct} disabled={isSaving}>
              {isSaving ? "Creating…" : "Create Product"}
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Desert Tee – Black" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Slug</label>
              <div className="flex gap-2">
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="desert-tee-black" />
                <Button type="button" variant="secondary" onClick={onAutoSlug}>
                  Auto
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Price (USD)</label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="29.99" />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Stored as cents.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Badge (optional)</label>
              <Input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="New / Sale / Limited" />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold">Description (optional)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short product description…"
                className="min-h-[110px]"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <input
                id="featured"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <label htmlFor="featured" className="text-sm font-semibold">
                Mark as featured
              </label>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="rounded-[calc(var(--radius)*1.25)] bg-[hsl(var(--card))] shadow-[var(--shadow-sm)] dark:bg-[hsl(var(--card))] dark:shadow-[var(--shadow-md)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-6 md:px-6 xl:px-9">
            <div>
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Products</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                Loaded from <code>/api/products/admin</code> (so drafts show up).
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title / slug…"
                className="w-full md:w-[260px]"
              />
              <Button variant="secondary" onClick={() => fetchProducts("refresh")} disabled={isRefreshing}>
                {isRefreshing ? "Refreshing…" : "Refresh"}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <TopProductsSkeleton />
          ) : error ? (
            <div className="px-4 pb-6 md:px-6 xl:px-9">
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
                {error}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 pb-8 md:px-6 xl:px-9">
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  No products yet. Create one above, then use “Manage” to add photos + tags.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-t border-[hsl(var(--border))] text-base [&>th]:h-auto [&>th]:py-3 sm:[&>th]:py-4.5">
                  <TableHead className="min-w-[260px]">Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Quick Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="border-t border-[hsl(var(--border))]">
                    <TableCell>
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {p.slug} • {new Date(p.created_at).toLocaleString()}
                      </div>
                    </TableCell>

                    <TableCell className="text-sm">
                      <Badge variant="secondary">{p.status ?? "draft"}</Badge>
                    </TableCell>

                    <TableCell className="text-sm">{centsToMoney(p.price_cents, p.currency)}</TableCell>
                    <TableCell className="text-sm">{p.badge ?? "—"}</TableCell>
                    <TableCell className="text-sm">{p.is_featured ? "Yes" : "No"}</TableCell>

                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">
                      {/* We’ll show real tags inside Manage. This just nudges the flow. */}
                      <span>Use Manage →</span>
                    </TableCell>

                    <TableCell className="text-right flex justify-end gap-2">
                      <ManageProductDialog
                        productId={p.id}
                        productTitle={p.title}
                        onChanged={() => fetchProducts("refresh")}
                      />
                      <Button variant="destructive" size="sm" onClick={() => onArchiveProduct(p.id)}>
                        Archive
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </ShowcaseSection>
  );
}

/* --------------------------- */
/* Manage Dialog (Tags+Photos) */
/* --------------------------- */

function ManageProductDialog({
  productId,
  productTitle,
  onChanged,
}: {
  productId: string;
  productTitle: string;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ProductDetail | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/admin/${productId}`, { cache: "no-store" });
      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed to load product detail");

      setDetail(json.data as ProductDetail);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const onOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) load();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Manage
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span>Manage: {productTitle}</span>
            <Badge variant="secondary">{detail?.status ?? "draft"}</Badge>
          </DialogTitle>
        </DialogHeader>

        {loading || !detail ? (
          <div className="text-sm text-[hsl(var(--muted-foreground))]">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Photos */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <h3 className="font-semibold">Photos</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                Multi-upload supported. Bucket: <code>{PRODUCT_IMAGE_BUCKET}</code>
              </p>

              <div className="mt-3">
                <MultiPhotoUploader
                  productId={productId}
                  onUploaded={async () => {
                    await load();
                    onChanged();
                  }}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {(detail.product_images ?? [])
                  .slice()
                  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                  .map((img, idx) => {
                    const url = storagePathToUrl(img.storage_path);
                    return (
                      <div
                        key={`${img.storage_path}-${idx}`}
                        className="rounded-lg border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--background))]"
                        title={img.alt ?? ""}
                      >
                        {/* use img tag to avoid Next/Image remote config issues */}
                        {url ? (
                          <img src={url} alt={img.alt ?? "product image"} className="w-full aspect-square object-cover" />
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

            {/* Tags */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <h3 className="font-semibold">Tags / Subcategories</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                Add tags like <code>tops</code>, <code>denim</code>, <code>accessories</code>.
              </p>

              <div className="mt-3">
                <TagEditor
                  productId={productId}
                  tags={detail.tags ?? []}
                  onChange={async () => {
                    await load();
                    onChanged();
                  }}
                />
              </div>
            </div>

            <div className="lg:col-span-2 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  await load();
                  toast.success("Refreshed");
                }}
              >
                Refresh Detail
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MultiPhotoUploader({
  productId,
  onUploaded,
}: {
  productId: string;
  onUploaded: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadAll = async () => {
    if (!files.length) return toast.error("Choose images first");

    setUploading(true);
    try {
      const supabase = createBrowserClient();

      for (const file of files) {
        const storage_path = `products/${productId}/${randId()}.${fileExt(file.name)}`;

        const up = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(storage_path, file, {
          upsert: false,
          cacheControl: "3600",
          contentType: file.type || "image/*",
        });
        if (up.error) throw new Error(up.error.message);

        const res = await fetch(`/api/products/admin/${productId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storage_path,
            alt: alt.trim() ? alt.trim() : null,
          }),
        });

        const json = await safeReadJson(res);
        if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed to add image row");
      }

      toast.success(`Uploaded ${files.length} image(s)`);
      setFiles([]);
      setAlt("");
      onUploaded();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
      />
      <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text applied to uploaded images (optional)" />
      <Button onClick={uploadAll} disabled={!files.length || uploading}>
        {uploading ? "Uploading…" : `Upload ${files.length ? `(${files.length})` : ""}`}
      </Button>
    </div>
  );
}

function TagEditor({
  productId,
  tags,
  onChange,
}: {
  productId: string;
  tags: { id: string; slug: string; name: string }[];
  onChange: () => void;
}) {
  const [input, setInput] = useState("");

  const add = async () => {
    const raw = input.trim();
    if (!raw) return;

    // allow entering: "Date Night" -> date-night
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
      setInput("");
      onChange();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to add tag");
    }
  };

  const remove = async (tagIdOrSlug: string) => {
    try {
      const res = await fetch(`/api/products/admin/${productId}/tags`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: tagIdOrSlug }),
      });

      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed to remove tag");

      toast.success("Tag removed");
      onChange();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to remove tag");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add tag… (ex: Tops, Denim, Date Night)"
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
        />
        <Button onClick={add} variant="secondary">
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <span className="text-sm text-[hsl(var(--muted-foreground))]">No tags yet.</span>
        ) : (
          tags.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-3 py-1">
              <span className="text-sm font-semibold">{t.name}</span>
              <button
                className="text-xs text-[hsl(var(--muted-foreground))] hover:opacity-80"
                onClick={() => remove(t.id)}
                title="Remove"
              >
                ✕
              </button>
            </span>
          ))
        )}
      </div>

      <div className="text-xs text-[hsl(var(--muted-foreground))]">
        Tip: keep tags consistent (ex: <code>tops</code>, <code>denim</code>, <code>accessories</code>).
      </div>
    </div>
  );
}
