import { Skeleton } from "@/components/ui/skeleton";

export function PersonalWinsSkeleton() {
  return (
    <div className="rounded-[var(--radius)] bg-[hsl(var(--background))] px-7.5 pb-4 pt-7.5 shadow-[var(--shadow-sm)] dark:bg-[hsl(var(--card))] dark:shadow-[var(--shadow-md)]">
      <h2 className="mb-5.5 text-body-2xlg font-bold text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))]">
        Personal Wins & Shoutouts
      </h2>
      
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}