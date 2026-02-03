import { cn } from "@/lib/utils";

const winsData = [
  {
    id: 1,
    message: "⭐ Great job completing your tasks at Subway!",
    date: "2 days ago",
    coach: "Sarah M."
  },
  {
    id: 2,
    message: "🎉 You were early 3 times this week!",
    date: "3 days ago",
    coach: "Mike T."
  },
  {
    id: 3,
    message: "🌟 Excellent teamwork in the donations department!",
    date: "1 week ago",
    coach: "Lisa K."
  },
  {
    id: 4,
    message: "👏 You helped train the new client today - amazing leadership!",
    date: "1 week ago",
    coach: "David R."
  },
  {
    id: 5,
    message: "💪 Perfect attendance this month!",
    date: "2 weeks ago",
    coach: "Sarah M."
  }
];

export async function PersonalWins({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] bg-[hsl(var(--background))] px-7.5 pb-4 pt-7.5 shadow-[var(--shadow-sm)] dark:bg-[hsl(var(--card))] dark:shadow-[var(--shadow-md)]",
        className,
      )}
    >
      <h2 className="mb-4 text-body-2xlg font-bold text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))]">
        Personal Wins & Shoutouts
      </h2>

      <div className="space-y-4 max-h-80 overflow-y-auto">
        {winsData.map((win) => (
          <div
            key={win.id}
            className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800"
          >
            <p className="text-base font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))] mb-2">
              {win.message}
            </p>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>From: {win.coach}</span>
              <span>{win.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}