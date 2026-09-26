import type { Metadata } from "next";
import { GOALS } from "@/data/goals";
import type { GoalSlug } from "@/data/types";
import { ProgramBuilder } from "@/components/program/ProgramBuilder";
import { GoalMixes, HowItWorks, RuffierTeaser } from "@/components/program/ProgramSections";
import { BeatWord } from "@/components/pulse/Beat";
import { Breadcrumbs } from "@/components/ui/Kit";
import { Reveal } from "@/components/ui/Reveal";
import { BOOKING } from "@/lib/club";
import { dateKeyOf } from "@/lib/time";

// The builder needs today's club date, and ?goal= preselects the goal.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Программа тренировок под ваш пульс",
  description:
    "Пять вопросов — и неделя из настоящих занятий «Каденса» со свободными местами, в ваших пульсовых зонах. Запись на всю неделю одной формой или программа тренеру.",
};

const FACTS = [
  { value: String(BOOKING.daysAhead), label: "дней расписания вперёд, только занятия со свободными местами" },
  { value: "5", label: "пульсовых зон с вашими цифрами у каждого занятия" },
  { value: "1", label: "форма, чтобы записаться на всю неделю" },
];

export default async function ProgramPage({ searchParams }: { searchParams: Promise<{ goal?: string | string[] }> }) {
  const { goal } = await searchParams;
  const wanted = Array.isArray(goal) ? goal[0] : goal;
  const initialGoal: GoalSlug | null = GOALS.find((g) => g.slug === wanted)?.slug ?? null;
  const today = dateKeyOf(new Date());

  return (
    <>
      <header className="relative isolate overflow-hidden pb-14 pt-32 md:pb-20 md:pt-40">
        <div className="ecg-grid absolute inset-0 -z-10 opacity-70 [mask-image:linear-gradient(to_bottom,black_20%,transparent)]" aria-hidden />
        <div className="container-page">
          <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Программа" }]} className="mb-10" />
          <Reveal>
            <p className="eyebrow mb-5">Программа под пульс · 5 вопросов · 2 минуты</p>
            <h1 className="display text-d-1 leading-[0.9] stretch-narrow">
              Неделя под{" "}
              <br />
              ваш{" "}
              <BeatWord className="text-pulse" base={56} amp={34}>
                пульс
              </BeatWord>
            </h1>
          </Reveal>
          <Reveal delay={0.1} className="mt-12 grid gap-10 border-t border-line/10 pt-8 md:mt-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <p className="max-w-xl text-[17px] leading-relaxed text-dust md:text-[19px]">
              Отвечаете на пять вопросов, а мы раскладываем неделю по пульсовым зонам и подбираем под неё настоящие занятия из расписания. У каждого занятия — ваш
              личный пульсовой коридор, и записаться можно сразу на всё.
            </p>
            <dl className="grid border-t border-line/10 sm:grid-cols-3 sm:gap-8 sm:border-0">
              {FACTS.map((f) => (
                <div
                  key={f.label}
                  className="grid grid-cols-[56px_1fr] items-center gap-x-4 border-b border-line/10 py-4 sm:flex sm:flex-col sm:items-start sm:border-0 sm:py-0"
                >
                  <dt className="order-2 text-[14px] leading-snug text-dust sm:mt-3 sm:text-[13.5px]">{f.label}</dt>
                  <dd className="digits order-1 text-[56px] leading-[0.8] text-chalk md:text-[72px]">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </header>

      <section id="builder" aria-label="Конструктор программы" className="container-page scroll-mt-24 pb-8">
        <ProgramBuilder initialGoal={initialGoal} today={today} />
      </section>

      <HowItWorks />
      <GoalMixes />
      <RuffierTeaser />
    </>
  );
}
