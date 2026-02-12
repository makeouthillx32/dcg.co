"use client";

export default function Artists() {
  return (
    <div className="space-y-6 p-6 text-[var(--foreground)] bg-[var(--background)]">
      <h1 className="text-2xl md:text-3xl font-bold">Artists on the Edge</h1>

      <div className="space-y-4 text-base leading-relaxed">
        <p>
          Late in 2007 the State of California ceased all funding of group recreational activities.
          DART took it upon itself to continue an art program for adults and limited “pay as you go”
          out of town outings.
        </p>
        <p>
          Since that time the Artists on the Edge program has provided art instruction classes,
          in many different media. After each 6 to 8 week session the artists put on an art show
          open to the public. Proceeds from these shows go directly to the artists.
        </p>
      </div>
    </div>
  );
}