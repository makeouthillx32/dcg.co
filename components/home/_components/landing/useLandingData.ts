"use client";

import { useEffect, useState } from "react";

export type LandingCategory = {
  id: string;
  name: string;
  slug: string;
};

export type LandingProductImage = {
  bucket_name: string;
  object_path: string;
  alt_text?: string | null;
  sort_order?: number | null;
  position?: number | null;
  is_primary?: boolean | null;
  is_public?: boolean | null;
  width?: number | null;
  height?: number | null;
  blurhash?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
};

export type LandingProduct = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  currency: string;
  badge: string | null;
  is_featured: boolean;
  product_images: LandingProductImage[];
};

type Envelope<T> =
  | { ok: true; data: T; meta?: any }
  | { ok: false; error: { code: string; message: string; details?: any } };

function asArray<T>(v: any): T[] {
  return Array.isArray(v) ? v : [];
}

export function useLandingData() {
  const [categories, setCategories] = useState<LandingCategory[]>([]);
  const [featured, setFeatured] = useState<LandingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [catsRes, prodRes] = await Promise.all([
          fetch("/api/categories?limit=6", { cache: "no-store" }),
          fetch("/api/products?limit=4&featured=1", { cache: "no-store" }),
        ]);

        const catsJson = (await catsRes.json()) as Envelope<LandingCategory[]>;
        const prodJson = (await prodRes.json()) as Envelope<LandingProduct[]>;

        if (!catsRes.ok || (catsJson as any).ok === false) {
          throw new Error((catsJson as any)?.error?.message ?? `Categories failed (${catsRes.status})`);
        }

        if (!prodRes.ok || (prodJson as any).ok === false) {
          throw new Error((prodJson as any)?.error?.message ?? `Products failed (${prodRes.status})`);
        }

        if (!alive) return;

        setCategories(asArray<LandingCategory>((catsJson as any).data));
        setFeatured(asArray<LandingProduct>((prodJson as any).data));
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Failed to load landing data");
        setCategories([]);
        setFeatured([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { categories, featured, loading, error };
}
