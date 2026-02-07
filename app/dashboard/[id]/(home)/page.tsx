// app/dashboard/[id]/(home)/page.tsx

import { Suspense } from "react";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";

import { PaymentsOverview } from "@/components/Charts/payments-overview";
import { UsedDevices } from "@/components/Charts/used-devices";
import { WeeksProfit } from "@/components/Charts/weeks-profit";

import { TopChannels } from "@/components/Tables/top-channels";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";

import { ChatsCard } from "./_components/chats-card";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { RegionLabels } from "./_components/region-labels";

type PropsType = {
  searchParams?: {
    selected_time_frame?: string;
  };
};

function getTimeFrameValue(
  extractTimeFrame: ReturnType<typeof createTimeFrameExtractor>,
  key: string
) {
  const raw = extractTimeFrame(key);
  if (!raw) return undefined;

  // expected format: "some_key:VALUE"
  const parts = raw.split(":");
  return parts.length > 1 ? parts.slice(1).join(":") : undefined;
}

export default async function Home({ searchParams }: PropsType) {
  const selected_time_frame = searchParams?.selected_time_frame;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  const paymentsTimeFrame = getTimeFrameValue(extractTimeFrame, "payments_overview");
  const weeksProfitTimeFrame = getTimeFrameValue(extractTimeFrame, "weeks_profit");
  const usedDevicesTimeFrame = getTimeFrameValue(extractTimeFrame, "used_devices");

  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <PaymentsOverview
          className="col-span-12 xl:col-span-7"
          timeFrame={paymentsTimeFrame}
          key={`payments_overview:${paymentsTimeFrame ?? "default"}`}
        />

        <WeeksProfit
          className="col-span-12 xl:col-span-5"
          timeFrame={weeksProfitTimeFrame}
          key={`weeks_profit:${weeksProfitTimeFrame ?? "default"}`}
        />

        <UsedDevices
          className="col-span-12 xl:col-span-5"
          timeFrame={usedDevicesTimeFrame}
          key={`used_devices:${usedDevicesTimeFrame ?? "default"}`}
        />

        <RegionLabels />

        <div className="col-span-12 grid xl:col-span-8">
          <Suspense fallback={<TopChannelsSkeleton />}>
            <TopChannels />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <ChatsCard />
        </Suspense>
      </div>
    </>
  );
}
