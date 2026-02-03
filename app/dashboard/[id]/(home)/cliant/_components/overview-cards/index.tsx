
import { compactFormat } from "@/lib/format-number";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  // Dummy data for client dashboard
  const goal1 = {
    value: 85,
    percentage: 12.5,
    isPositive: true
  };

  const goal2 = {
    value: 92,
    percentage: 8.3,
    isPositive: true
  };

  const goal3 = {
    value: 78,
    percentage: -3.2,
    isPositive: false
  };

  const nextSls = {
    value: "June 15",
    percentage: 0,
    isPositive: true
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Goal 1"
        data={{
          ...goal1,
          value: goal1.value + "%",
        }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Goal 2"
        data={{
          ...goal2,
          value: goal2.value + "%",
        }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Goal 3"
        data={{
          ...goal3,
          value: goal3.value + "%",
        }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Next SLS Date"
        data={{
          ...nextSls,
          value: nextSls.value,
        }}
        Icon={icons.Views}
      />
    </div>
  );
}
