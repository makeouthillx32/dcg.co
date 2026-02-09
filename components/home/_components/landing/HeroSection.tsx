"use client";

export function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <HeroCopy />
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroCopy() {
  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-xs border border-[var(--border)]">
        Desert Cowgirl • Western-inspired everyday wear
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
        Wear the desert.
        <br />
        Keep it classic.
      </h1>

      <p className="text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed max-w-xl">
        Handpicked styles with a western edge—graphics, layers, denim, and
        accessories built for real life. Shop the latest drops, restocks,
        and favorites in one clean storefront.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="#shop"
          className="inline-flex items-center justify-center rounded-md px-5 py-3 font-semibold
                     bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm
                     hover:opacity-95 transition"
        >
          Shop Now
        </a>

        <a
          href="#new-releases"
          className="inline-flex items-center justify-center rounded-md px-5 py-3 font-semibold
                     bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]
                     hover:bg-[var(--accent)] transition"
        >
          New Releases
        </a>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4">
        <TrustTile label="Fast shipping" value="Packed with care" />
        <TrustTile label="Easy returns" value="Simple exchanges" />
        <TrustTile label="Secure checkout" value="Shop confidently" />
      </div>
    </div>
  );
}

function TrustTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "radial-gradient(800px circle at 30% 20%, var(--accent) 0%, transparent 60%)",
          opacity: 0.8,
        }}
      />
      <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-lg)] overflow-hidden">
        <div className="aspect-[4/3] w-full bg-[var(--sidebar)] flex items-center justify-center">
          <div className="text-center px-6">
            <p className="text-sm text-[var(--muted-foreground)]">Hero image placeholder</p>
            <p className="text-xl font-bold">Add a lifestyle photo + featured product grid</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              Suggested: 1600×1200 JPG in /public/images/store/hero.jpg
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-0 border-t border-[var(--border)]">
          <MiniFeature label="Featured" value="Graphics" />
          <MiniFeature label="Trending" value="Denim" bordered />
          <MiniFeature label="Must-have" value="Accessories" />
        </div>
      </div>
    </div>
  );
}

function MiniFeature({
  label,
  value,
  bordered,
}: {
  label: string;
  value: string;
  bordered?: boolean;
}) {
  return (
    <div className={`p-4 ${bordered ? "border-l border-r border-[var(--border)]" : ""}`}>
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
