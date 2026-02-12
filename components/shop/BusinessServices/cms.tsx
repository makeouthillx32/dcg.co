"use client";

import React from "react";

export default function CMSPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)]">
      {/* Content wrapper gives horizontal + vertical padding */}
      <div className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <section id="commercial" className="sr-only">CMS</section>

        <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">
          Commercial Cleaning That Meets Your Needs
        </h1>

        <div className="space-y-6 text-lg leading-relaxed">
          <h2 className="text-2xl font-semibold">General cleaning</h2>
          <p>Daily dust, grime and trash can make a space feel unprofessional. Our general cleaning and janitorial service keeps your workplace fresh, organized, and ready for business. From dusting and sanitizing to vacuuming and trash removal, we take care of the mess, so you can focus on your business.</p>

          <h2 className="text-2xl font-semibold">Deep cleaning</h2>
          <p>Sometimes, a surface clean just isn’t enough. Our deep cleaning service gets into every corner, removing built‑up dirt, bacteria, and allergens. An immaculate space isn’t just about appearances; it’s about health, safety, and longevity.</p>

          <p>You have probably already seen DART Commercial Services at some of the places you frequent every day. We have contracts with most of the trash cans around town, the water district, and many more places all around Ridgecrest.</p>

          <h2 className="text-2xl font-semibold">Trust Industry Experts</h2>
          <p><strong>Professional complexes</strong></p>
          <p>Clean offices mean productive employees and a great first impression for clients. We provide reliable janitorial services tailored to corporate environments. Keep your workspaces fresh, hygienic, and ready for business.</p>

          <h2 className="text-2xl font-semibold">Post construction and move‑outs</h2>
          <p>Renovating or relocating? Our post‑construction and move‑out cleaning services remove dust, debris, and leftover materials, leaving the space move‑in or move‑out ready.</p>

          <h2 className="text-2xl font-semibold">Offices and commercial spaces</h2>
          <p>A clean workplace isn’t just about looks — it impacts productivity, health, and morale. Our commercial cleaning services ensure your office is a place where employees thrive, and visitors feel welcome.</p>

          <h2 className="text-2xl font-semibold">Public and government facilities</h2>
          <p>Public spaces require a level of cleanliness that supports health, safety, and professionalism. As a partner in the AbilityOne Program, we provide reliable, high‑standard cleaning for government offices and public facilities.</p>

          <h2 className="text-2xl font-semibold">Compliance and Quality Assurance</h2>
          <p>At DART Commercial Services, we take cleanliness, safety, and quality seriously. Our commercial cleaning services meet the highest industry standards, so that your business always stays compliant, hygienic, and well‑maintained.</p>

          <p>We are CIMS‑certified (Cleaning Industry Management Standard), which means we follow strict best practices for professional cleaning, safety, and operational excellence.</p>

          <p>From healthcare facilities to government buildings, we understand the unique compliance requirements of every industry we serve. Choose DART Commercial Services to enjoy peace of mind, knowing your facility is in expert hands.</p>
        </div>
      </div>

      {/* push footer to bottom */}
      <div className="mt-auto" />
    </div>
  );
}
 

