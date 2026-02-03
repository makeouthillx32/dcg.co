"use client";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-10 py-6">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12 mb-16 max-w-7xl mx-auto">
        {/* Dartboard SVG */}
        <div className="flex-shrink-0 flex justify-center md:justify-start w-full md:w-auto">
          <img
            src="/images/home/dartboard.svg"
            alt="DART Target Logo"
            className="w-48 sm:w-560 md:w-56 lg:w-64 xl:w-[22rem] h-auto select-none"
          />
        </div>

        {/* Heading & Mission copy */}
        <div className="flex-1 text-center md:text-left max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-foreground leading-tight mb-4">
            Welcome to Desert Area Resources and Training
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3 text-foreground">Our Mission is to:</h2>
          <p className="text-lg sm:text-xl leading-relaxed text-foreground">
            Provide services and opportunities to people who have intellectual or developmental disabilities or other
            special needs, so they and their families can pursue the dreams and lifestyles they choose.
          </p>
        </div>
      </div>

      {/* Welcome Text */}
      <div className="space-y-6 text-base sm:text-lg md:text-xl mb-16 max-w-3xl mx-auto px-1 text-justify text-foreground">
        <p>
          DART offers programs and services to people with and without developmental disabilities or other special needs.
          Our staff is here to provide services and opportunities to meet the needs of the individual.
        </p>
        <p>
          After an initial referral from the State of California – Department of Developmental Services – Regional Center,
          young children who are found eligible are assessed and their plans are developed on an individual basis.
        </p>
        <p>
          Children in this program are offered specialized instruction and supports to aid with their development. The ratio
          of child to teacher is kept as low as 1‑to‑1 in toddler and pre‑school settings.
        </p>
        <p>
          Children with developmental disabilities are provided with early‑intervention services to address their educational
          and social developmental milestones.
        </p>
        <p>
          For adults with developmental disabilities and other special needs, there are various programs and services offered
          such as Supported Employment, Work Activity Program and Supported Living Programming. We support adults on the job
          and host collaborative community projects and special events annually.
        </p>
        <p>
          Each summer we host a day camp for children with Autism and support advocacy for children, adults and families.
        </p>
      </div>

      {/* Sponsor Logos */}
      <div className="flex flex-wrap justify-center gap-8 sm:gap-10 mb-20">
        <Image src="/images/home/sponsor1.png" alt="Sponsor 1" width={140} height={70} className="object-contain" />
        <Image src="/images/home/sponsor2.png" alt="Sponsor 2" width={140} height={70} className="object-contain" />
        <Image src="/images/home/sponsor3.png" alt="Sponsor 3" width={140} height={70} className="object-contain" />
      </div>

      {/* History Section */}
      <div className="space-y-4 text-base sm:text-lg max-w-5xl mx-auto">
        <h3 className="font-semibold text-xl sm:text-2xl text-foreground">
          The History of Desert Area Resources and Training
        </h3>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="md:w-1/3">
            <Image
              src="/images/home/founders.png"
              alt="DART Founders"
              width={300}
              height={200}
              className="w-full object-contain rounded-md"
            />
          </div>
          <div className="md:w-2/3">
            <p className="text-foreground">
              Founded by visionary parents in 1961, Desert Area Resources and Training (DART) began as the Indian Wells Valley
              Council for Retarded Children. Over the decades, the organization has grown into a regional leader in services
              for individuals with intellectual and developmental disabilities.
            </p>
          </div>
        </div>

        <p className="text-foreground">
          In 1961, twenty parents of children with disabilities united to establish a recreation program for preschoolers.
          By 1966 the effort expanded into formal special‑education classes through the Kern County Superintendent of Schools.
        </p>
        <p className="text-foreground">
          United Way joined as a partner in 1962, and the Sunshine House day‑care program launched in 1973. After a 1979 merger
          and a 1991 rebrand, the agency became Desert Area Resources and Training — continuing to expand its impact across
          surrounding counties.
        </p>
      </div>
    </div>
  );
}