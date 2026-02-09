"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
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
  // Prefer mime -> extension when possible (more reliable than random filenames)
  const type = (file.type || "").toLowerCase();

  if (type.includes("jpeg")) return "jpg";
  if (type.includes("jpg")) return "jpg";
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("gif")) return "gif";
  if (type.includes("avif")) return "avif";
  if (type.includes("heic") || type.includes("heif")) return "heic"; // note: many browsers can't display HEIC

  // fallback: filename ext
  const name = file.name || "";
  const i = name.lastIndexOf(".");
  const ext = i >= 0 ? name.slice(i + 1).toLowerCase() : "jpg";
  return ext || "jpg";
}

function buildObjectPath(productId: string, index1Based: number, ext: string) {
  // ✅ standardized naming: 1.jpg, 2.jpg, 3.png, ...
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

export default function CreateProductModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("0.00");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [alt, setAlt] = useState("");

  const [creating, setCreating] = useState(false);

  const cents = useMemo(() => {
    const n = Number(price);
    if (!Number.isFinite(n)) return null;
    return Math.round(n * 100);
  }, [price]);

  const autoSlug = () => setSlug(slugify(title));

  const reset = () => {
    setTitle("");
    setSlug("");
    setPrice("0.00");
    setDescription("");
    setFiles([]);
    setAlt("");
  };

  const create = async () => {
    if (!title.trim()) return toast.error("Title is required");

    const finalSlug = (slug.trim() || slugify(title)).trim();
    if (!finalSlug) return toast.error("Slug is required");

    if (cents === null || cents < 0) return toast.error("Price must be valid");

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

      // 2) Upload images (optional)
      if (files.length) {
        const supabase = createBrowserClient();

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          const ext = safeExtFromFile(file);
          const object_path = buildObjectPath(productId, i + 1, ext);

          // Upload to storage
          const up = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(object_path, file, {
            upsert: false, // don't overwrite if already exists
            cacheControl: "3600",
            contentType: file.type || "application/octet-stream",
          });

          if (up.error) throw new Error(up.error.message);

          // Insert row into product_images (matches your schema)
          const r2 = await fetch(`/api/products/admin/${productId}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bucket_name: PRODUCT_IMAGE_BUCKET,
              object_path,
              alt_text: alt.trim() ? alt.trim() : null,
              position: i,
              // (optional, if your API supports it later)
              // sort_order: i,
              // is_primary: i === 0,
              // is_public: true,
            }),
          });

          const j2 = await safeReadJson(r2);
          if (!r2.ok || !j2?.ok) {
            throw new Error(j2?.error?.message ?? `Failed to create image row (${r2.status})`);
          }
        }
      }

      toast.success(files.length ? "Product created + images uploaded" : "Product created");
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
