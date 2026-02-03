"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const boardMembers = [
  ["Board of Directors greg-boske.jpg", "Gregg Boske", "Chairman"],
  ["Board of DirectorsLady.jpg", "Linda Grey", "Vice Chair"],
  ["Board of Directors lady 2.jpg", "Susan Blake", "Treasurer"],
  ["Board of Directorslady3.jpg", "Monica Reyes", "Secretary"],
];

export default function BoardPage() {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="base space-y-8 text-[hsl(var(--foreground))] bg-[hsl(var(--background))] p-4 sm:p-8">
      <p className="text-center max-w-2xl mx-auto text-[hsl(var(--foreground))]">
        Our Board of Directors is comprised of dedicated community members who volunteer their time and expertise to guide our organization. They are committed to our mission and work tirelessly to ensure that DART continues to provide high-quality services.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {boardMembers.map(([image, name, title], index) => (
          <div
            key={index}
            onClick={() => setSelected(index)}
            className="cursor-pointer bg-[hsl(var(--card))] rounded-[var(--radius)] shadow-[var(--shadow-sm)] overflow-hidden transition hover:shadow-[var(--shadow-md)]"
          >
            <div className="aspect-square bg-[hsl(var(--muted))] relative">
              <Image
                src={`/images/home/${image}`}
                alt={name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-[hsl(var(--foreground))]">{name}</h3>
              <p className="text-[hsl(var(--sidebar-primary))] text-sm mb-2">{title}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Brief biography of the board member highlighting their background, expertise, and commitment to DART's mission.
              </p>
            </div>
          </div>
        ))}
      </div>

      {selected !== null && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-3xl aspect-square">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-white text-4xl font-bold z-50 hover:text-[hsl(var(--destructive))]"
              aria-label="Close preview"
            >
              &times;
            </button>
            <div className="relative w-full h-full rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow-xl)]">
              <Image
                src={`/images/home/${boardMembers[selected][0]}`}
                alt={boardMembers[selected][1]}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-2xl font-extrabold text-white drop-shadow-sm">
                  {boardMembers[selected][1]}
                </h3>
                <p className="text-white text-sm italic drop-shadow-sm">
                  {boardMembers[selected][2]}
                </p>
                <p className="mt-2 text-white text-sm drop-shadow-sm max-w-xl">
                  Brief biography of the board member highlighting their background, expertise, and commitment to DART's mission.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}