"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

function fileExt(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "jpg";
}
function randId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

async function
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
  onCreated: (newProductId: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("0.00");
  const [description, setDescription] = useState("");
  const [altText, setAltText] = useState("");

  // ✅ images picked at creation time
  const [files, setFiles] = useState<File[]>([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setSlug("");
      setPrice("0.00");
      setDescription("");
      setAltText("");
      setFiles([]);
      setSaving(false);
    }
  }, [open]);

  const autoSlug = () => {
    const s = slugify(title);
    setSlug(s);
    if (s) toast.success("Slug generated");
  };

  const create = async () => {
    const t = title.trim();
    const s = slug.trim();

    if (!t) return toast.error("Title is required");
    if (!s) return toast.error("Slug is required");

    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) return toast.error("Price must be a valid number");

    setSaving(true);

    try {
      // 1) create product
      const res = await fetch("/api/products/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: t,
          slug: s,
          description: description.trim() ? description.trim() : null,
          price_cents: Math.round(p * 100),
        }),
      });

      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Create failed");

      const productId = json.data?.id as string | undefined;
      if (!productId) throw new Error("Create succeeded but response missing product id");

      // 2) optionally upload images + insert DB rows
      if (files.length) {
        const supabase = createBrowserClient();

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const object_path = `products/${productId}/${randId()}.${fileExt(file.name)}`;

          const up = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(object_path, file, {
            upsert: false,
            cacheControl: "3600",
            contentType: file.type || "image/*",
          });

          if (up.error) throw new Error(up.error.message);

          // insert row into product_images via API (matches your schema)
          const ins = await fetch(`/api/products/admin/${productId}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bucket_name: PRODUCT_IMAGE_BUCKET,
              object_path,
              alt_text: altText.trim() ? altText.trim() : null,
              position: i,
              is_primary: i === 0,
            }),
          });

          const insJson = await safeReadJson(ins);
          if (!ins.ok || !insJson?.ok) {
            throw new Error(insJson?.error?.message ?? `Image insert failed: ${ins.status}`);
          }
        }
      }

      toast.success(files.length ? "Product created with images" : "Product created");
      onCreated(productId);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mens High Roller..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Slug</label>
            <div className="flex gap-2">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="mens-high-roller..." />
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
            <label className="text-sm font-semibold">Description (optional)</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[110px]" />
          </div>

          {/* ✅ Images at creation */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-2">
            <div className="text-sm font-semibold">Images (optional)</div>

            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />

            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Alt text applied to uploaded images (optional)"
            />

            <div className="text-xs text-[hsl(var(--muted-foreground))]">
              Bucket: <code>{PRODUCT_IMAGE_BUCKET}</code> • First image becomes primary
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={create} disabled={saving}>
            {saving ? "Creating…" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
