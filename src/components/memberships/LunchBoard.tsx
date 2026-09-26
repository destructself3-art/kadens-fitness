// The weekday lunch window (12:00–14:00) as a departure board. Built from the timetable template, so it always
// matches the real schedule. Server component; the personal range is a small client island.
import Link from "next/link";
import { getClass } from "@/data/classes";
import { getSpace } from "@/data/spaces";
import { TIMETABLE } from "@/data/timetable";
import type { ClassSlug } from "@/data/types";
import { ArrowLink, ZoneBadge } from "@/components/ui/Kit";
import { PersonalRange } from "@/components/pulse/Zones";
import { BOOKING } from "@/lib/club";
import { hhmmToMinutes, minutesToHHMM } from "@/lib/time";

const WINDOW = { from: "12:00", to: "14:00" } as const;
const WEEKDAYS = [1, 2, 3, 4, 5];

export type LunchClass = {
  time: string;
  end: string;
  /** Minutes from midnight, for sorting */
  start: number;
  slug: ClassSlug;
  title: string;
  studio: string;
  minutes: number;
  zone: number;
};

/** Classes that run every weekday and start and finish inside the lunch window. */
export function lunchClasses(): LunchClass[] {
  const from = hhmmToMinutes(WINDOW.from);
  const to = hhmmToMinutes(WINDOW.to);
  return TIMETABLE.filter((slot) => WEEKDAYS.every((d) => slot.days.includes(d)))
    .map((slot): LunchClass => {
      const cls = getClass(slot.class);
      const start = hhmmToMinutes(slot.time);
      const space = getSpace(cls.studio);
      return {
        time: slot.time,
        end: minutesToHHMM(start + cls.durationMin),
        slug: cls.slug,
        title: cls.title,
        studio: space.kind === "studio" ? `«${space.name}»` : space.name,
        minutes: cls.durationMin,
        zone: cls.zone,
        start,
      };
    })
    .filter((c) => c.start >= from && c.start + c.minutes <= to)
    .sort((a, b) => a.start - b.start || a.title.localeCompare(b.title, "ru"));
}

export function LunchBoard({ items, title, lead, linkLabel }: { items: LunchClass[]; title: string; lead: string; linkLabel: string }) {
  return (
    <div className="rounded-card border border-line/10 bg-graphite">
      <div className="flex flex-col gap-4 border-b border-line/10 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div>
          <p className="eyebrow">Пн–Пт</p>
          <h3 className="display stretch-wide mt-2 text-d-4">{title}</h3>
          <p className="mt-2 max-w-md text-[14px] text-dust">{lead}</p>
        </div>
        <p className="digits text-[40px] leading-none text-pulse">
          {WINDOW.from}–{WINDOW.to}
        </p>
      </div>
      <ul>
        {items.map((c) => (
          <li key={`${c.time}-${c.slug}`} className="border-b border-line/10 last:border-b-0">
            <Link
              href={`/classes/${c.slug}`}
              className="group grid grid-cols-[64px_1fr] items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-chalk/[0.03] sm:grid-cols-[88px_1fr_auto_auto] sm:px-7"
            >
              <span className="digits text-[30px] leading-none text-chalk sm:text-[36px]">{c.time}</span>
              <span className="min-w-0">
                <span className="block font-display text-[20px] uppercase leading-none text-chalk sm:text-[24px]" style={{ fontVariationSettings: '"wdth" 70', fontWeight: 850 }}>
                  {c.title}
                </span>
                <span className="mt-1.5 block text-[13px] text-dust">
                  {c.studio} · <span className="digits text-[16px]">{c.minutes}</span> мин · до <span className="digits text-[16px]">{c.end}</span>
                </span>
              </span>
              <span className="col-start-2 flex items-center gap-3 sm:col-start-auto">
                <ZoneBadge zone={c.zone} showName={false} />
                <PersonalRange zone={c.zone} withUnit className="text-[20px] text-chalk" />
              </span>
              <span aria-hidden className="hidden text-dust transition-transform duration-300 ease-silk group-hover:translate-x-1 group-hover:text-chalk sm:block">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/10 px-5 py-4 text-[13.5px] text-dust sm:px-7">
        <span>
          Запись открывается за {BOOKING.daysAhead} дней и закрывается за {BOOKING.closesBeforeMin} минут до начала.
        </span>
        <ArrowLink href="/schedule">{linkLabel}</ArrowLink>
      </div>
    </div>
  );
}
