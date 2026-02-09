"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserClient } from "@/utils/supabase/client"; // if your path differs, adjust
import { PRODUCT_IMAGE_BUCKET } from "@/lib/images";

function ext(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "jpg";
}
function id() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function ProductImageUploader({
  productId,
  onUploaded,
}: {
  productId: string;
  onUploaded?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const upload = async () => {
    if (!file) return toast.error("Choose an image first");

    setIsUploading(true);
    try {
      const supabase = createBrowserClient();

      // storage path stored in DB
      const storage_path = `products/${productId}/${id()}.${ext(file.name)}`;

      // 1) upload file to bucket
      const up = await supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .upload(storage_path, file, {
          upsert: false,
          cacheControl: "3600",
          contentType: file.type || "image/*",
        });

      if (up.error) throw new Error(up.error.message);

      // 2) insert row into product_images via your API
      const res = await fetch(`/api/products/admin/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storage_path,
          alt: alt.trim() ? alt.trim() : null,
        }),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message ?? `Image insert failed: ${res.status}`);
      }

      toast.success("Image uploaded");
      setFile(null);
      setAlt("");
      onUploaded?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text (optional)" />
      <Button onClick={upload} disabled={!file || isUploading}>
        {isUploading ? "Uploading…" : "Upload Image"}
      </Button>
      <div className="text-xs text-[hsl(var(--muted-foreground))]">
        Uploads to: <code>{PRODUCT_IMAGE_BUCKET}</code>
      </div>
    </div>
  );
}
