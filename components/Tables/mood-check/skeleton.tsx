import { Skeleton } from "@/components/ui/skeleton";

export function MoodCheckInSkeleton() {
  return (
    <div className="rounded-[var(--radius)] bg-[hsl(var(--background))] px-7.5 pb-4 pt-7.5 shadow-[var(--shadow-sm)] dark:bg-[hsl(var(--card))] dark:shadow-[var(--shadow-md)]">
      <h2 className="mb-5.5 text-body-2xlg font-bold text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))]">
        How are you feeling today?
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}