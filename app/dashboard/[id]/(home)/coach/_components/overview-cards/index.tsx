
import { compactFormat } from "@/lib/format-number";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  // Dummy data for job coach dashboard
  const totalClients = {
    value: 24,
    percentage: 12.5,
    isPositive: true
  };

  const workingToday = {
    value: 8,
    percentage: 15.2,
    isPositive: true
  };

  const goalsCompleted = {
    value: 156,
    percentage: 8.7,
    isPositive: true
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:gap-7.5">
      <OverviewCard
        label="Your Clients"
        data={{
          ...totalClients,
          value: compactFormat(totalClients.value),
        }}
        Icon={icons.Users}
      />

      <OverviewCard
        label="Working Today"
        data={{
          ...workingToday,
          value: compactFormat(workingToday.value),
        }}
        Icon={icons.Views}
      />

      <OverviewCard
        label="Goals Completed"
        data={{
          ...goalsCompleted,
          value: compactFormat(goalsCompleted.value),
        }}
        Icon={icons.Product}
      />
    </div>
  );
}


