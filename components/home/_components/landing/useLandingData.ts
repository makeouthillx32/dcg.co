"use client";

import { useEffect, useMemo, useState } from "react";

export type LandingCategory = { title: string; href: string };
export type LandingProductCard = { label: string };

type LandingData = {
  categories: LandingCategory[];
  featuredPlaceholders: LandingProductCard[];
};

type Mode = "dummy" | "live";

/**
 * Starts as dummy.
 * When ready, flip MODE to "live" and it will fetch from your API.
 */
const MODE: Mode = "dummy";

export function useLandingData() {
  const [data, setData] = useState<LandingData>({
    categories: [
      { title: "Desert Girl Exclusives", href: "#desert-girl-exclusives" },
      { title: "Tops", href: "#tops" },
      { title: "Bottoms & Sets", href: "#bottoms" },
      { title: "Jewelry & Accessories", href: "#accessories" },
      { title: "The Extras", href: "#extras" },
      { title: "Deals / Sale", href: "#sale" },
    ],
    featuredPlaceholders: [
      { label: "Featured Item 1" },
      { label: "Featured Item 2" },
      { label: "Featured Item 3" },
      { label: "Featured Item 4" },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (MODE !== "live") return;

    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        // Step 1: categories from backend
        const categoriesRes = await fetch("/api/categories", { cache: "no-store" });
        const categoriesJson = await categoriesRes.json();

        if (!categoriesRes.ok || !categoriesJson?.ok) {
          throw new Error(categoriesJson?.error?.message ?? "Failed to load categories");
        }

        // map backend -> landing tiles
        const cats =
          (categoriesJson.data ?? []).slice(0, 6).map((c: any) => ({
            title: c.name,
            href: `/shop?category=${encodeURIComponent(c.slug)}`,
          })) ?? [];

        if (!cancelled) {
          setData((prev) => ({
            ...prev,
            categories: cats.length ? cats : prev.categories,
          }));
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load landing data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => ({ ...data, loading, error }), [data, loading, error]);
}
