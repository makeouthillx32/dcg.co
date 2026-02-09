"use client";

export function CategoryTile({ title, href }: { title: string; href: string }) {
  return (
    <a
      href={href}
      className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-4
                 hover:bg-[var(--accent)] transition shadow-[var(--shadow-xs)]"
    >
      <div className="text-xs text-[var(--muted-foreground)]">Shop</div>
      <div className="font-bold leading-snug mt-1">{title}</div>
      <div className="text-sm font-semibold text-[var(--primary)] mt-2 group-hover:opacity-90">
        Browse →
      </div>
    </a>
  );
}
