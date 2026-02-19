// settings/landing/_components/useLandingSections.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LandingSectionRow, LandingSectionsResponse } from "./types";

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  return data as T;
}

export function useLandingSections() {
  const [sections, setSections] = useState<LandingSectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/landing/sections", { cache: "no-store" });
    const body = await json<LandingSectionsResponse>(res);

    if (!res.ok || !body || (body as any).ok === false) {
      const msg = (body as any)?.error?.message ?? "Failed to load landing sections";
      setError(msg);
      setSections([]);
      setLoading(false);
      return;
    }

    setSections((body as any).sections ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sorted = useMemo(() => {
    return [...(sections ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [sections]);

  return { sections: sorted, setSections, loading, error, refresh };
}
