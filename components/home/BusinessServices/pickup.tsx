"use client";

import React from "react";
import { FiPhone, FiCalendar, FiTruck, FiCheckCircle } from "react-icons/fi";

export default function PickupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <section id="pickup" className="sr-only">Pickup Service</section>

        <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">
          Schedule a Donation Pickup
        </h1>

        <p className="mb-4 text-lg leading-relaxed">
          Here at DART, we make donating easy. Whether you have a truckload of items or a car full, our friendly team will come right to your door with our trailer and collect your items on your schedule.
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <FiCheckCircle className="text-[var(--accent)] h-6 w-6 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold">What We Accept</h2>
              <p className="mt-1">
                Clothing, household goods, small furniture, books, toys, and more. If you're unsure, just give us a call!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FiCalendar className="text-[var(--foreground)] h-6 w-6 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold">Easy Scheduling</h2>
              <p className="mt-1">
                Call us at <a href="tel:123-456-7890" className="underline hover:text-[var(--accent)]">123-456-7890</a> or fill out our online form, and we’ll confirm a pickup window that works for you.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FiTruck className="text-[var(--accent)] h-6 w-6 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold">Hassle-Free Pickup</h2>
              <p className="mt-1">
                Our team arrives on time, loads your donations into our trailer, and handles the heavy lifting so you don't have to.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FiPhone className="text-[var(--accent)] h-6 w-6 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold">Thank You!</h2>
              <p className="mt-1">
                Your generous donations help us empower individuals in our community. We appreciate your support and look forward to seeing you again!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="#schedule"
            className="inline-block bg-[var(--accent)] text-white px-8 py-3 rounded-lg hover:opacity-90 transition"
          >
            Schedule Your Pickup
          </a>
        </div>
      </div>

      <div className="mt-auto" />
    </div>
  );
}
