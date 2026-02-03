
import { MoodCheckIn, MoodCheckInSkeleton } from "@/components/Tables/mood-check";
import { PersonalWins, PersonalWinsSkeleton } from "@/components/Tables/personal-wins";
import { Suspense } from "react";
import { ChatsCard } from "./_components/chats-card";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-6">
          <Suspense fallback={<PersonalWinsSkeleton />}>
            <PersonalWins />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-6">
          <Suspense fallback={<MoodCheckInSkeleton />}>
            <MoodCheckIn />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <ChatsCard />
        </Suspense>
      </div>
    </>
  );
}
