"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getClass } from "@/data/classes";
import { getCoach } from "@/data/coaches";
import type { Goal, GoalSlug, Review } from "@/data/types";
import { ReviewCard } from "@/components/ui/Cards";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { plural } from "@/lib/format";

const EASE = [0.16, 1, 0.3, 1] as const;

/** 11.5 -> "11,5"; negative numbers get a real minus sign. */
const fmt = (v: number) => `${v < 0 ? "−" : ""}${String(Math.abs(Math.round(v * 10) / 10)).replace(".", ",")}`;
const delta = (r: Review) => {
  const d = Math.round((r.metric.after - r.metric.before) * 10) / 10;
  return `${d > 0 ? "+" : d < 0 ? "−" : ""}${String(Math.abs(d)).replace(".", ",")}`;
};

/** Reviews about the heart itself (resting pulse, Ruffier index) make the best featured story for a pulse club. */
const isPulseStory = (r: Review) => /пульс|руфье/i.test(r.metric.label);
const pickFeatured = (list: Review[]) => list.find(isPulseStory) ?? list[0];

type GoalInfo = Pick<Goal, "slug" | "title" | "photo">;

export function ReviewsExplorer({ reviews, goals }: { reviews: Review[]; goals: GoalInfo[] }) {
  const [goal, setGoal] = useState<GoalSlug | "all">("all");
  const reduce = useReducedMotion();

  const list = goal === "all" ? reviews : reviews.filter((r) => r.goal === goal);
  const featured = pickFeatured(list);
  const rest = list.filter((r) => r.id !== featured.id);
  const featuredGoal = goals.find((g) => g.slug === featured.goal);
  const coach = featured.coach ? getCoach(featured.coach) : null;

  const options: { value: GoalSlug | "all"; label: string; count: number }[] = [
    { value: "all", label: "Все истории", count: reviews.length },
    ...goals.map((g) => ({ value: g.slug, label: g.title, count: reviews.filter((r) => r.goal === g.slug).length })),
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Цель" className="flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              aria-pressed={goal === o.value}
              onClick={() => setGoal(o.value)}
              className="chip min-h-[44px] gap-2.5 px-4 text-[14px]"
            >
              {o.label}
              <span className={clsx("digits text-[18px] leading-none", goal === o.value ? "text-asphalt" : "text-dust")}>{o.count}</span>
            </button>
          ))}
        </div>
        <p role="status" aria-live="polite" className="text-[14px] text-dust">
          {list.length} {plural(list.length, "история", "истории", "историй")}
        </p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={featured.id}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -16 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mt-10 grid overflow-hidden rounded-card border border-line/10 bg-graphite lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
        >
          <div className="relative min-h-[280px] sm:min-h-[360px]">
            {featuredGoal && (
              <MediaFrame shot={featuredGoal.photo} alt="" sizes="(min-width: 1100px) 40vw, 92vw" className="absolute inset-0" />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-graphite/70" aria-hidden />
            {featuredGoal && (
              <span className="absolute left-4 top-4 rounded-full bg-asphalt/75 px-3 py-1.5 text-[12.5px] font-medium text-chalk backdrop-blur">{featuredGoal.title}</span>
            )}
          </div>
          <figure className="flex flex-col p-6 sm:p-10">
            <p className="eyebrow">
              {featured.metric.label} за <span className="digits text-[16px] tracking-normal">{featured.months}</span>{" "}
              {plural(featured.months, "месяц", "месяца", "месяцев")}
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2">
              <span className="sr-only">
                {featured.metric.label}: было {fmt(featured.metric.before)}, стало {fmt(featured.metric.after)} {featured.metric.unit}.
              </span>
              <span aria-hidden className="digits text-[56px] leading-[0.8] text-dust line-through decoration-2 sm:text-[80px]">
                {fmt(featured.metric.before)}
              </span>
              <span aria-hidden className="pb-2 text-[28px] text-dust">
                →
              </span>
              <span aria-hidden className="digits text-[104px] leading-[0.75] text-chalk sm:text-[150px]">
                {fmt(featured.metric.after)}
              </span>
              <span aria-hidden className="flex flex-col pb-1">
                {featured.metric.unit && <span className="text-[15px] text-dust">{featured.metric.unit}</span>}
                <span className="digits text-[26px] leading-none text-pulse">{delta(featured)}</span>
              </span>
            </div>
            <blockquote className="mt-8 max-w-[62ch] text-[17px] leading-relaxed text-chalk/90 md:text-[19px]">«{featured.text}»</blockquote>
            <figcaption className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line/10 pt-5 text-[14.5px]">
              <span className="font-semibold text-chalk">{featured.name}</span>
              {coach && (
                <Link href={`/coaches/${coach.slug}`} className="link-underline text-dust hover:text-chalk">
                  тренер {coach.name}
                </Link>
              )}
              <span className="flex flex-wrap gap-2">
                {featured.classes.map((slug) => (
                  <Link key={slug} href={`/classes/${slug}`} className="chip min-h-[44px] px-3.5 text-[12.5px] hover:border-chalk">
                    {getClass(slug).title}
                  </Link>
                ))}
              </span>
            </figcaption>
          </figure>
        </motion.article>
      </AnimatePresence>

      {rest.length > 0 && (
        <motion.ul
          key={goal}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-5 columns-1 gap-5 md:columns-2 xl:columns-3"
        >
          {rest.map((r) => (
            <li key={r.id} className="mb-5 break-inside-avoid">
              <ReviewCard review={r} />
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
