"use client";

export default function EarlyChildhood() {
  return (
    <div className="space-y-6 p-6 text-[var(--foreground)] bg-[var(--background)]">
      <h1 className="text-2xl md:text-3xl font-bold">Early Childhood Services</h1>

      <div className="space-y-4 text-base leading-relaxed">
        <h2 className="text-xl font-semibold">
          Therese M. Hall Children’s Center State of California
        </h2>
        <ul className="list-disc list-inside">
          <li>Licensed Pre-School and Infant Program</li>
          <li>Children birth through five years participate in a classroom</li>
          <li>
            Curriculum that is age appropriate and stimulating to their development.
          </li>
          <li>The ratio of student to adult is 1–3 in all settings.</li>
        </ul>

        <p>
          This is nurturing environments is open to children with and without disabilities.
          The settings offer integrated peer modeling components.
        </p>

        <h2 className="text-xl font-semibold">In-home Infant Therapist Services</h2>
        <p>
          Children who are identified through assessments for services may be provided this
          in their homes with an Infant Home Therapist. Parent or supportive adults work
          with the staff member on a home plan that is individualized and strives to meet
          milestones of development and goals.
        </p>
      </div>
    </div>
  );
}