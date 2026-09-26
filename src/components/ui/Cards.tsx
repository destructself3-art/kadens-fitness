// Content cards shared by several pages. Server-safe.
import Link from "next/link";
import clsx from "clsx";
import { Check, Minus } from "lucide-react";
import { getCoach } from "@/data/coaches";
import { getSpace } from "@/data/spaces";
import type { ClassType, Membership, Review, Space } from "@/data/types";
import { rub } from "@/lib/format";
import { zoneMeta } from "@/lib/zones";
import { ZoneBadge } from "./Kit";
import { MediaFrame } from "./MediaFrame";

const LEVEL_LABEL: Record<ClassType["level"], string> = {
  any: "Любой уровень",
  beginner: "Для новичков",
  intermediate: "Средний уровень",
  advanced: "Продвинутый",
};
export const levelLabel = (level: ClassType["level"]) => LEVEL_LABEL[level];

/** A class format tile: photo, title, zone, minutes, studio. */
export function ClassCard({ cls, className, sizes = "(min-width: 1100px) 30vw, (min-width: 560px) 45vw, 92vw" }: { cls: ClassType; className?: string; sizes?: string }) {
  const studio = getSpace(cls.studio);
  return (
    <Link href={`/classes/${cls.slug}`} className={clsx("group block overflow-hidden rounded-card border border-line/10 bg-graphite transition-colors hover:border-line/30", className)}>
      <div className="relative">
        <MediaFrame shot={cls.photo} alt={cls.title} sizes={sizes} className="aspect-[3/2]" imgClassName="transition-transform duration-700 ease-silk group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3 rounded-full bg-asphalt/80 px-2.5 py-1 backdrop-blur">
          <ZoneBadge zone={cls.zone} />
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-[26px] uppercase leading-[0.95]" style={{ fontVariationSettings: '"wdth" 68', fontWeight: 850 }}>
          {cls.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[14.5px] text-dust">{cls.short}</p>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-dust">
          <span>
            <span className="digits text-[18px] text-chalk">{cls.durationMin}</span> мин
          </span>
          <span>«{studio.name}»</span>
          <span>{LEVEL_LABEL[cls.level]}</span>
        </p>
      </div>
    </Link>
  );
}

/** A room of the club. */
export function SpaceCard({ space, className, sizes = "(min-width: 1100px) 30vw, (min-width: 560px) 45vw, 92vw" }: { space: Space; className?: string; sizes?: string }) {
  return (
    <Link href={`/studios/${space.slug}`} className={clsx("group relative block overflow-hidden rounded-card border border-line/10", className)}>
      <MediaFrame shot={space.photo} alt={`${space.label} «${space.name}»`} sizes={sizes} className="aspect-[4/5] sm:aspect-[3/4]" imgClassName="transition-transform duration-700 ease-silk group-hover:scale-[1.05]" />
      <span className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/20 to-transparent" aria-hidden />
      <span className="absolute left-4 top-4 rounded-full bg-asphalt/70 px-2.5 py-1 text-[12px] text-chalk backdrop-blur">{space.floor} этаж</span>
      <span className="absolute inset-x-0 bottom-0 p-5">
        <span className="eyebrow block">{space.label}</span>
        <span className={clsx("mt-2 block font-display uppercase leading-[0.9] text-chalk [overflow-wrap:anywhere]", space.name.length > 11 ? "text-[clamp(20px,2.2vw,28px)]" : "text-[clamp(26px,2.8vw,34px)]")} style={{ fontVariationSettings: '"wdth" 60', fontWeight: 850 }}>
          {space.kind === "studio" ? `«${space.name}»` : space.name}
        </span>
        <span className="mt-2 block text-[14px] text-dust">{space.mood}</span>
      </span>
    </Link>
  );
}

/** A review with its before → after number. */
export function ReviewCard({ review, className }: { review: Review; className?: string }) {
  const m = review.metric;
  const better = m.after - m.before;
  const coach = review.coach ? getCoach(review.coach) : null;
  return (
    <figure className={clsx("card flex h-full flex-col p-6", className)}>
      <div className="flex items-end gap-3">
        <span className="digits text-[40px] leading-none text-dust line-through decoration-1">{m.before}</span>
        <span className="text-dust" aria-hidden>
          →
        </span>
        <span className="digits text-[64px] leading-[0.8] text-chalk">{m.after}</span>
        <span className="pb-1 text-[13px] text-dust">{m.unit}</span>
      </div>
      <p className="mt-2 text-[13.5px] text-dust">
        {m.label} за {review.months} мес. <span className="sr-only">Было {m.before}, стало {m.after}, изменение {better > 0 ? "+" : ""}{Math.round(better * 10) / 10}.</span>
      </p>
      <blockquote className="mt-5 flex-1 text-[16px] leading-relaxed text-chalk/90">«{review.text}»</blockquote>
      <figcaption className="mt-6 flex items-center justify-between gap-3 border-t border-line/10 pt-4 text-[14px]">
        <span className="font-semibold text-chalk">{review.name}</span>
        {coach && (
          <Link href={`/coaches/${coach.slug}`} className="link-underline text-dust hover:text-chalk">
            тренер {coach.name.split(" ")[0]}
          </Link>
        )}
      </figcaption>
    </figure>
  );
}

/** A membership plan. `yearly` switches the price to the per-month price of a yearly contract. */
export function MembershipCard({ plan, yearly = false, className, cta }: { plan: Membership; yearly?: boolean; className?: string; cta?: React.ReactNode }) {
  const price = yearly && plan.priceYearly ? plan.priceYearly : plan.price;
  return (
    <article
      className={clsx(
        "relative flex h-full flex-col rounded-card border p-6",
        plan.highlight ? "border-pulse/60 bg-raised shadow-[0_30px_80px_-40px_rgb(255_58_36_/_0.6)]" : "border-line/10 bg-graphite",
        className,
      )}
    >
      {plan.highlight && <span className="absolute -top-3 left-6 rounded-full bg-pulse px-3 py-1 text-[12px] font-semibold text-asphalt">Выбирают чаще всего</span>}
      <h3 className="font-display text-[30px] uppercase leading-none" style={{ fontVariationSettings: '"wdth" 70', fontWeight: 850 }}>
        {plan.name}
      </h3>
      <p className="mt-2 min-h-[44px] text-[14.5px] text-dust">{plan.tagline}</p>
      <p className="mt-5 flex items-baseline gap-2">
        <span className="digits text-[54px] leading-none text-chalk">{rub(price).replace(" ₽", "")}</span>
        <span className="text-[14px] text-dust">
          ₽ {plan.unit}
          {yearly && plan.priceYearly ? ", при оплате за год" : ""}
        </span>
      </p>
      <p className="mt-1 text-[13px] text-dust">{plan.hours}</p>
      <ul className="mt-6 grid flex-1 content-start gap-2 text-[14.5px]">
        {plan.includes.map((item) => (
          <li key={item} className="flex gap-2.5">
            <Check className="mt-0.5 h-4 w-4 flex-none text-pulse" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
        {plan.excludes.map((item) => (
          <li key={item} className="flex gap-2.5 text-dust">
            <Minus className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {cta && <div className="mt-6">{cta}</div>}
    </article>
  );
}

/** Zone legend line: color, name, what it feels like. */
export function ZoneLegend({ className }: { className?: string }) {
  return (
    <ul className={clsx("flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-dust", className)}>
      {[1, 2, 3, 4, 5].map((id) => {
        const z = zoneMeta(id);
        return (
          <li key={id} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: z.color }} aria-hidden />
            Z{id} {z.name}
          </li>
        );
      })}
    </ul>
  );
}
