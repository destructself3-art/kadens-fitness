import Link from "next/link";
import clsx from "clsx";
import { GOALS } from "@/data/goals";
import type { ZoneId } from "@/data/types";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { HomeReveal } from "./HomeReveal";
import { BOOKING } from "@/lib/club";
import { ZONES } from "@/lib/zones";

const STEPS = [
  { title: "Пульс и возраст", text: "Тап на первом экране или цифры с часов." },
  { title: "Цель и опыт", text: "От «только начинаю» до «тренируюсь регулярно»." },
  { title: "Дни и время", text: "Два–пять занятий в неделю, утром, днём или вечером." },
];

/** Program teaser: how the builder works on the left, the four goals as photo cards on the right. */
export function ProgramTeaser() {
  return (
    <section aria-labelledby="program-title" className="relative border-t border-line/10 py-24 md:py-36">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <HomeReveal>
            <p className="eyebrow">Программа под пульс</p>
            <h2 id="program-title" className="display stretch-narrow mt-4 text-d-2">
              Неделя под ваше сердце
            </h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-dust">
              Конструктор берёт настоящие занятия из расписания на ближайшие {BOOKING.daysAhead} дней: только те, где есть места и нужная вам
              зона. Тяжёлые дни он разводит, чтобы между ними было время восстановиться, и собирает неделю, на которую можно записаться одной
              формой.
            </p>
          </HomeReveal>
          <ol className="mt-10 grid gap-0">
            {STEPS.map((s, i) => (
              <HomeReveal as="li" key={s.title} delay={i * 0.06} className="grid grid-cols-[56px_1fr] items-baseline gap-3 border-t border-line/10 py-4">
                <span className="digits text-[34px] leading-none text-pulse">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block text-[16px] font-semibold text-chalk">{s.title}</span>
                  <span className="block text-[14.5px] text-dust">{s.text}</span>
                </span>
              </HomeReveal>
            ))}
          </ol>
          <HomeReveal>
            <Link href="/program" className="btn-ghost mt-8">
              Собрать программу
            </Link>
          </HomeReveal>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:gap-5">
          {GOALS.map((g, i) => (
            <HomeReveal as="li" key={g.slug} delay={(i % 2) * 0.1} className={clsx(i % 2 === 1 && "sm:mt-16")}>
              <Link
                href={`/program?goal=${g.slug}`}
                className="group relative block overflow-hidden rounded-card border border-line/10 bg-graphite transition-colors hover:border-line/30"
              >
                <MediaFrame
                  shot={g.photo}
                  alt=""
                  sizes="(min-width: 1100px) 28vw, (min-width: 560px) 45vw, 92vw"
                  className="aspect-[4/5]"
                  imgClassName="transition-transform duration-700 ease-silk group-hover:scale-[1.05]"
                />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-asphalt/80 via-asphalt/10 to-asphalt/95" />
                <span className="absolute inset-x-0 top-0 p-5">
                  <span className="display stretch-narrow block text-[clamp(28px,2.35vw,34px)] leading-[0.92] text-chalk">{g.title}</span>
                </span>
                <span className="absolute inset-x-0 bottom-0 p-5">
                  <span className="block text-[14.5px] leading-snug text-chalk/85">{g.short}</span>
                  <ZoneMix mix={g.zoneMix} />
                  <span className="mt-4 flex items-center justify-between text-[14px] font-semibold text-chalk">
                    <span className="link-underline">Собрать неделю</span>
                    <span aria-hidden className="transition-transform duration-300 ease-silk group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </span>
              </Link>
            </HomeReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Share of the week per zone as one stacked bar. */
function ZoneMix({ mix }: { mix: Record<ZoneId, number> }) {
  const used = ZONES.filter((z) => mix[z.id] > 0);
  const label = used.map((z) => `${z.name} ${Math.round(mix[z.id] * 100)}%`).join(", ");
  const top = [...used].sort((a, b) => mix[b.id] - mix[a.id]).slice(0, 2);
  return (
    <span className="mt-4 block">
      <span className="flex h-2 gap-[2px] overflow-hidden rounded-full" role="img" aria-label={`Неделя по зонам: ${label}`}>
        {used.map((z) => (
          <span key={z.id} style={{ flexGrow: mix[z.id], background: z.color }} />
        ))}
      </span>
      <span aria-hidden className="mt-2 flex gap-4 text-[12.5px] text-dust">
        {top.map((z) => (
          <span key={z.id} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: z.color }} />
            {z.name} <span className="digits text-[16px] text-chalk">{Math.round(mix[z.id] * 100)}%</span>
          </span>
        ))}
      </span>
    </span>
  );
}
