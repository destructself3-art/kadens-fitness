import { REVIEWS } from "@/data/reviews";
import { ReviewCard } from "@/components/ui/Cards";
import { ArrowLink } from "@/components/ui/Kit";
import { plural } from "@/lib/format";
import { HomeReveal } from "./HomeReveal";

// Three stories with different goals: resting pulse (endurance), weight (lean), Ruffier index (health).
const PICK = ["r6", "r1", "r11"];

const fmt = (n: number) => String(n).replace(".", ",");

/** Reviews: three stories with their before → after number and a tile with the numbers of the others. */
export function ReviewsTeaser() {
  const reviews = PICK.map((id) => REVIEWS.find((r) => r.id === id)).filter((r) => r !== undefined);
  const others = REVIEWS.filter((r) => !PICK.includes(r.id)).slice(0, 6);
  const rest = REVIEWS.length - reviews.length;
  return (
    <section aria-labelledby="reviews-title" className="relative border-t border-line/10 py-24 md:py-36">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-10">
        <HomeReveal className="lg:col-span-4 lg:self-start">
          <p className="eyebrow">Отзывы</p>
          <h2 id="reviews-title" className="display stretch-narrow mt-4 text-d-2">
            Было.
            <br />
            <span className="text-pulse">Стало.</span>
          </h2>
          <p className="mt-6 max-w-sm text-[16.5px] leading-relaxed text-dust">
            У каждой истории одно честное число, которое человек измерил сам: вес, пульс покоя, индекс Руфье. Никаких «до и после» в купальнике.
          </p>
        </HomeReveal>

        <ul className="grid gap-4 md:grid-cols-2 lg:col-span-8 lg:gap-5">
          {reviews.map((r, i) => (
            <HomeReveal as="li" key={r.id} delay={(i % 2) * 0.08}>
              <ReviewCard review={r} />
            </HomeReveal>
          ))}
          <HomeReveal as="li" delay={0.08}>
            <div className="flex h-full flex-col rounded-card border border-dashed border-line/15 p-6">
              <p className="eyebrow">
                Ещё {rest} {plural(rest, "история", "истории", "историй")}
              </p>
              <ul className="mt-4 flex-1">
                {others.map((r) => (
                  <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-b border-line/10 py-2.5 last:border-b-0">
                    <span className="min-w-0 text-[14px]">
                      <span className="text-chalk">{r.name}</span>
                      <span className="block truncate text-[12.5px] text-dust">{r.metric.label}</span>
                    </span>
                    <span className="whitespace-nowrap text-[13px] text-dust">
                      <span className="digits text-[20px] text-dust line-through decoration-1">{fmt(r.metric.before)}</span>
                      <span aria-hidden className="mx-1.5">→</span>
                      <span className="sr-only">стало</span>
                      <span className="digits text-[24px] text-chalk">{fmt(r.metric.after)}</span>
                      {r.metric.unit && <span className="ml-1">{r.metric.unit}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <ArrowLink href="/reviews" className="mt-5">
                Все отзывы
              </ArrowLink>
            </div>
          </HomeReveal>
        </ul>
      </div>
    </section>
  );
}
