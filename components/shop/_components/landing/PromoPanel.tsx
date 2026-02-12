"use client";

export function PromoPanel({
  title,
  desc,
  href,
  badge,
}: {
  title: string;
  desc: string;
  href: string;
  badge: string;
}) {
  return (
    <a
      href={href}
      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6
                 hover:bg-[var(--accent)] transition shadow-[var(--shadow-sm)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-1 rounded-full border border-[var(--border)] bg-[var(--background)]">
          {badge}
        </span>
        <span className="text-sm font-semibold text-[var(--primary)]">Open →</span>
      </div>
      <div className="mt-4 text-xl font-extrabold">{title}</div>
      <p className="text-sm text-[var(--muted-foreground)] mt-2">{desc}</p>
    </a>
  );
}
