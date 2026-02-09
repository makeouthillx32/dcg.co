"use client";

export function TopBanner() {
  return (
    <div className="w-full bg-[var(--card)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-2 flex items-center justify-center text-sm text-[var(--muted-foreground)]">
        Free shipping over $75 • New drops weekly • Easy returns
      </div>
    </div>
  );
}
