import type { Metadata } from "next";
import { GOALS } from "@/data/goals";
import { REVIEWS } from "@/data/reviews";
import { ArrowLink, PageHero } from "@/components/ui/Kit";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { BeatWord } from "@/components/pulse/Beat";
import { ReviewsExplorer } from "@/components/memberships/ReviewsExplorer";
import { plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Отзывы",
  description:
    "Истории членов клуба «Каденс» с одной честной цифрой в каждой: вес, пульс покоя, присед, время на 5 км. Фильтр по цели: снизить вес, выносливость, сила, здоровье.",
};

const decimal = (v: number) => (Math.round(v * 10) / 10).toString().replace(".", ",");

export default function ReviewsPage() {
  const count = REVIEWS.length;
  const avgMonths = REVIEWS.reduce((sum, r) => sum + r.months, 0) / count;
  const longest = Math.max(...REVIEWS.map((r) => r.months));
  const coaches = new Set(REVIEWS.map((r) => r.coach).filter(Boolean)).size;
  const goals = GOALS.map(({ slug, title, photo }) => ({ slug, title, photo }));

  const summary = [
    { value: String(count), label: `${plural(count, "история", "истории", "историй")} с цифрой «до» и «после»` },
    { value: decimal(avgMonths), label: "месяца в среднем от первого визита до цифры в отзыве" },
    { value: String(longest), label: `${plural(longest, "месяц", "месяца", "месяцев")} — самая долгая история` },
    { value: String(coaches), label: `${plural(coaches, "тренер", "тренера", "тренеров")} упомянуты по имени` },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ href: "/", label: "Главная" }, { label: "Отзывы" }]}
        eyebrow="Истории членов клуба"
        title={<span className="sm:stretch-wide">Отзывы</span>}
        lead="Мы попросили каждого назвать одну цифру, которая изменилась: вес, пульс покоя, присед, время на пяти километрах. Без фотографий «до и после» — только числа и то, как к ним пришли."
        stretch="normal"
      >
        <Reveal delay={0.15}>
          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line/10 pt-8 lg:grid-cols-4">
            {summary.map((s, i) => (
              <div key={s.label} className="flex flex-col-reverse gap-3">
                <dt className="max-w-[22ch] text-[14px] leading-snug text-dust">{s.label}</dt>
                <dd className={i === 0 ? "digits text-[80px] leading-[0.8] text-pulse md:text-[104px]" : "digits text-[80px] leading-[0.8] text-chalk md:text-[104px]"}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </PageHero>

      <section aria-label="Истории" className="container-page pb-24 pt-6 md:pb-32">
        <ReviewsExplorer reviews={REVIEWS} goals={goals} />
      </section>

      <section aria-labelledby="reviews-cta-title" className="container-page pb-8">
        <Reveal className="ecg-grid relative overflow-hidden rounded-card border border-line/10 px-6 py-16 sm:px-12 md:py-24">
          <p className="eyebrow mb-5">Первый визит бесплатно</p>
          <h2 id="reviews-cta-title" className="display stretch-narrow max-w-5xl text-d-2 sm:stretch-normal">
            Следующая <BeatWord base={96} amp={26} className="text-pulse">цифра</BeatWord> — ваша
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-dust">
            Каждая история выше началась одинаково: пульс покоя, проба Руфье и пять зон на пробной тренировке с тренером.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <MagneticButton href="/trial">Записаться на пробную</MagneticButton>
            <ArrowLink href="/program">Собрать программу под пульс</ArrowLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
