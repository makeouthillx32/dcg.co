"use client";

export default function Employment() {
  return (
    <div className="space-y-6 p-6 text-[var(--foreground)] bg-[var(--background)]">
      <h1 className="text-2xl md:text-3xl font-bold">Employment Services</h1>

      <div className="space-y-4 text-base leading-relaxed">
        <p>
          Client wages average between $800,000 and $900,000 dollars annually.
        </p>

        <h2 className="text-xl font-semibold">Work Activity Program</h2>
        <p>
          People who choose to train at the DART Thrift Store are participants in the Work Activity Program.
          All of their work services are provided on site. They will be trained directly within the retail
          sales business of DART. From receiving donations to processing, pricing and displaying items – clients
          work with their job coaches and each other.
        </p>

        <h2 className="text-xl font-semibold">Community Employment</h2>
        <p>
          People who are found eligible and choose to train in integrated community jobs either individually or
          on crews may do so with DART. Work skills and work habits are trained and enhanced through a variety
          of opportunities some of which are: shelf stocking, janitorial, landscaping, document shredding,
          cashier, and food services.
        </p>
        <p>
          Other placements may be explored through job development and job coaching. The work sites are located
          throughout Central California and include Caltrans, Searles Valley Minerals, the Indian Wells Brewing
          Company, and local, private and commercial contracts.
        </p>
      </div>
    </div>
  );
}