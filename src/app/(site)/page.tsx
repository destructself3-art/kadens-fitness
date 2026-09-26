import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { LiveNow } from "@/components/home/LiveNow";
import { ZonesSection } from "@/components/home/ZonesSection";
import { ClubNumbers } from "@/components/home/ClubNumbers";
import { StudiosSection } from "@/components/home/StudiosSection";
import { ProgramTeaser } from "@/components/home/ProgramTeaser";
import { CoachesTeaser } from "@/components/home/CoachesTeaser";
import { ReviewsTeaser } from "@/components/home/ReviewsTeaser";
import { MembershipsTeaser } from "@/components/home/MembershipsTeaser";
import { FinalCta } from "@/components/home/FinalCta";
import { getLiveNow, getUpcoming, peopleInClub } from "@/lib/schedule";
import { openStatus } from "@/lib/time";

// What runs right now, seats left and the club clock change every minute: render on every request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Каденс — фитнес-клуб в Казани, который тренирует по пульсу" },
  description:
    "Три этажа на набережной Казанки: шесть студий, бассейн 25 метров, до 50 занятий в день. Узнайте пульс покоя за 10 секунд, и сайт покажет ваши зоны у каждого занятия. Первая тренировка с пульс-тестом бесплатно.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const now = new Date();
  const [{ live, next }, people] = await Promise.all([getLiveNow(now), peopleInClub(now)]);
  // Late evening or night: nothing runs and nothing is left today, so show the first classes of the next day.
  const upcoming = live.length === 0 && next.length === 0 ? await getUpcoming({}, 4, undefined, now) : [];

  return (
    <>
      <Hero />
      <LiveNow live={live} next={next.slice(0, 4)} upcoming={upcoming} people={people} status={openStatus(now)} now={now} />
      <ZonesSection />
      <ClubNumbers />
      <StudiosSection />
      <ProgramTeaser />
      <CoachesTeaser />
      <ReviewsTeaser />
      <MembershipsTeaser />
      <FinalCta />
    </>
  );
}
