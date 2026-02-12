"use client";

export function ProductCardPlaceholder({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
      <div className="aspect-square bg-[var(--sidebar)] flex items-center justify-center">
        <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
      </div>
      <div className="p-3">
        <div className="h-3 w-3/4 rounded bg-[var(--muted)] mb-2" />
        <div className="h-3 w-1/2 rounded bg-[var(--muted)]" />
        <div className="mt-3 h-9 rounded-md bg-[var(--primary)] opacity-90" />
      </div>
    </div>
  );
}
