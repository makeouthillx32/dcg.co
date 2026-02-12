"use client";

export default function Shredding() {
  return (
    <div className="space-y-6 p-6 text-[var(--foreground)] bg-[var(--background)]">
      <h1 className="text-2xl md:text-3xl font-bold">Secure Document Shredding</h1>

      <div className="space-y-4 text-base leading-relaxed">
        <p>
          Are you one of those people who has a storage shed full of paper in boxes? Are they
          marked with 1992 or 1985? Do they have names, addresses, social security numbers,
          billing information, phone numbers, peoples’ children’s names, credit information,
          medical information, etc.? We can help you out.
        </p>
        <p>
          This service is also performed at the Education and Training Center that has a secure area
          for storage of documents. The public is welcome to come and observe the shredding or drop
          it off.
        </p>
        <p>
          Quotes for shredding are made for volume destruction based on weight or quantity,
          standard size of box, by calling{" "}
          <a href="tel:7603759787" className="text-blue-500 underline">
            375-9787 ext. 35
          </a>
          .
        </p>
        <p>Pick up service is available for 40 lbs. or more.</p>
        <p>Letters of destruction available.</p>
        <p>Full compliance with FACTA disposal Rule of June 2005.</p>
      </div>
    </div>
  );
}