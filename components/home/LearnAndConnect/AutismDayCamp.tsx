"use client"; // This directive ensures the component is rendered on the client side

import React from "react"; // Import React to use JSX

/**
 * AutismDayCamp
 *
 * Displays information about the Autism Day Camp program,
 * including heading and descriptive text. Styled for a centered layout.
 */
export default function AutismDayCamp() {
  return (
    <div
      // Container styles: max width, centered, text and background colors, vertical spacing
      className="max-w-3xl mx-auto text-center text-[var(--foreground)] bg-[var(--background)] space-y-6"
    >
      {/* Section heading */}
      <h2
        className="
          text-2xl md:text-3xl font-bold
          text-[var(--foreground)]
          mt-8
        "
      >
        Autism Day Camp
      </h2>

      {/* Paragraph describing the program */}
      <p className="text-base md:text-lg leading-relaxed">
        {/* Brief history */}
        In 2008, DART launched a day camp tailored for children on the autism spectrum.
        {/* Program details */}
        The camp runs for several weeks each summer, organized by age group, and pairs each camper
        with a trained high‑school leadership volunteer for one‑on‑one support.
        {/* Accessibility note */}
        There is no cost to attend, ensuring that all families can participate.
      </p>
    </div>
  );
}
