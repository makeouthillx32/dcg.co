"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

const jobs = [
  {
    title: "SLS Specialist",
    date: "January 19, 2022",
    location: "Ridgecrest Ca Corporate office",
    type: "SLS",
    featured: true,
    description: "This is the description for an SLS Specialist",
    expired: true,
  },
  {
    title: "Job Coach",
    date: "January 12, 2022",
    location: "Ridgecrest Ca Corporate office",
    type: "Job Coach",
    featured: false,
    description:
      "What is a job coach? A job coach, also called an Employment Specialist, assists individuals with disabilities to find and keep jobs. Job coaches also work with employers. They provide on-site support to individuals in order to help them adjust to the workplace and the routine of getting to and from work.",
    expired: false,
  },
];

export default function JobsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const filteredJobs = selectedType
    ? jobs.filter((job) => job.type === selectedType)
    : jobs;

  const activeJob = jobs.find((job) => job.title === selectedJob);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-[hsl(var(--foreground))] bg-[hsl(var(--background))]">
      {!selectedJob && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
            <div className="flex items-center border border-[hsl(var(--border))] rounded-full px-4 py-2 text-sm shadow-[var(--shadow-xs)] w-full">
              <strong className="mr-2">Location</strong>
              <input
                type="text"
                placeholder="City, State or Pin code"
                className="flex-1 border-none outline-none bg-transparent text-sm"
              />
              <span className="text-xl">📍</span>
            </div>
            <button className="w-[120px] px-4 py-2 border border-[hsl(var(--border))] rounded-full text-sm bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))/0.8] whitespace-nowrap">
              Find Job
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 max-w-md">
            <select
              value={selectedType ?? ""}
              onChange={(e) => setSelectedType(e.target.value || null)}
              className="w-[150px] border border-[hsl(var(--border))] rounded-full px-4 py-2 text-sm shadow-[var(--shadow-xs)]"
            >
              <option value="">Job Type</option>
              <option value="SLS">SLS Specialist</option>
              <option value="Job Coach">Job Coach</option>
            </select>
            <select className="w-[150px] border border-[hsl(var(--border))] rounded-full px-4 py-2 text-sm shadow-[var(--shadow-xs)]">
              <option>Category</option>
            </select>
          </div>
        </>
      )}

      {selectedJob && activeJob ? (
        <div className="border-t border-[hsl(var(--border))] pt-6">
          <h3 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
            {activeJob.title}
            {activeJob.featured && (
              <span className="text-xs bg-[hsl(var(--chart-4))/0.2] text-[hsl(var(--chart-4))] px-2 py-1 rounded-full">
                Featured
              </span>
            )}
          </h3>
          <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1 flex flex-wrap gap-4">
            <span>📅 {activeJob.date}</span>
            <span>📍 {activeJob.location}</span>
            <span>🔖 {activeJob.type}</span>
          </div>
          <p className="mt-3 text-[hsl(var(--foreground))] text-sm leading-relaxed">
            {activeJob.description}
          </p>
          {activeJob.expired && (
            <p className="text-[hsl(var(--destructive))] text-sm font-semibold mt-2">
              This job is Expired
            </p>
          )}
          <button
            onClick={() => setSelectedJob(null)}
            className="mt-4 text-[hsl(var(--sidebar-primary))] hover:underline text-sm"
          >
            Back to Listings
          </button>
        </div>
      ) : (
        <div className="space-y-12 mt-8">
          {filteredJobs.map((job, index) => (
            <div key={index} className="border-t border-[hsl(var(--border))] pt-6">
              <button
                onClick={() => setSelectedJob(job.title)}
                className="text-left"
              >
                <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                  {job.title}
                  {job.featured && (
                    <span className="text-xs bg-[hsl(var(--chart-4))/0.2] text-[hsl(var(--chart-4))] px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </h3>
              </button>
              <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1 flex flex-wrap gap-4">
                <span>📅 {job.date}</span>
                <span>📍 {job.location}</span>
                <span>🔖 {job.type}</span>
              </div>
              <p className="mt-3 text-[hsl(var(--foreground))] text-sm leading-relaxed">
                {job.description.slice(0, 180)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}