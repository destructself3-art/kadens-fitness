// The day on one screen: studios across, hours down, every class a block sized by its length.
import Link from "next/link";
import clsx from "clsx";
import { BeatDot } from "@/components/pulse/Beat";
import type { SessionView } from "@/lib/session-types";
import { hhmmToMinutes, minutesToHHMM } from "@/lib/time";
import { zoneMeta } from "@/lib/zones";
import { BoardScroller } from "./BoardScroller";
import { fillPct } from "./format";

const PX = 1.15; // pixels per minute
const HOUR_COL = 60;

export type BoardStudio = { slug: string; name: string; label: string };

export function DayBoard({
  sessions,
  studios,
  from,
  to,
  nowMinutes,
}: {
  sessions: SessionView[];
  studios: BoardStudio[];
  /** First and last minute of the board, whole hours */
  from: number;
  to: number;
  /** Current club minute when the board shows today */
  nowMinutes: number | null;
}) {
  const height = (to - from) * PX;
  const hours: number[] = [];
  for (let m = from; m <= to; m += 60) hours.push(m);
  const columns = `${HOUR_COL}px repeat(${studios.length}, minmax(104px, 1fr))`;
  const showNow = nowMinutes !== null && nowMinutes >= from && nowMinutes <= to;
  const hourPx = 60 * PX;

  return (
    <BoardScroller nowOffset={showNow ? (nowMinutes! - from) * PX : null} label="Таймлайн дня: студии по горизонтали, часы по вертикали">
      <div className="min-w-[1180px]">
        {/* Studio names stay on top while the day scrolls */}
        <div className="sticky top-0 z-30 grid border-b border-line/10 bg-graphite/95 backdrop-blur" style={{ gridTemplateColumns: columns }}>
          <div className="sticky left-0 z-10 bg-graphite" />
          {studios.map((s) => (
            <div key={s.slug} className="min-w-0 border-l border-line/10 px-2.5 py-3">
              <p lang="ru" className="display stretch-narrow hyphens-auto text-[14.5px] leading-[0.95] [overflow-wrap:anywhere]">«{s.name}»</p>
              <p className="mt-1 truncate text-[11.5px] text-dust">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative grid" style={{ gridTemplateColumns: columns, height }}>
          {/* Hour labels, pinned to the left edge on a narrow screen */}
          <div className="sticky left-0 z-20 bg-graphite">
            {hours.map((m) => (
              <span
                key={m}
                className={clsx("digits absolute left-3 text-[16px] leading-none text-dust", m === from ? "translate-y-1" : m === to ? "-translate-y-full" : "-translate-y-1/2")}
                style={{ top: (m - from) * PX }}
              >
                {minutesToHHMM(m)}
              </span>
            ))}
          </div>

          {studios.map((studio) => (
            <div
              key={studio.slug}
              className="relative border-l border-line/10"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, rgb(var(--line) / 0.07) 0 1px, transparent 1px ${hourPx / 2}px, rgb(var(--line) / 0.025) ${hourPx / 2}px ${hourPx / 2 + 1}px, transparent ${hourPx / 2 + 1}px ${hourPx}px)`,
              }}
            >
              {sessions
                .filter((s) => s.studioSlug === studio.slug)
                .map((s) => (
                  <Block key={s.id} session={s} from={from} />
                ))}
            </div>
          ))}

          {showNow && (
            <div className="pointer-events-none absolute inset-x-0 z-20" style={{ top: (nowMinutes! - from) * PX }} aria-hidden>
              <div className="absolute h-px bg-pulse" style={{ left: HOUR_COL, right: 0 }} />
              <span className="digits absolute left-1 -translate-y-1/2 rounded-md bg-pulse px-1.5 py-0.5 text-[15px] leading-none text-asphalt">
                {minutesToHHMM(nowMinutes!)}
              </span>
            </div>
          )}
        </div>
      </div>
    </BoardScroller>
  );
}

function Block({ session: s, from }: { session: SessionView; from: number }) {
  const z = zoneMeta(s.zone);
  const start = hhmmToMinutes(s.time);
  const pct = fillPct(s.taken, s.capacity);
  const cancelled = s.status === "cancelled";
  const past = s.started && !s.live;
  const tall = s.durationMin * PX >= 56;
  const label = [
    `${s.time}–${s.endTime}`,
    s.classTitle,
    s.coachName + (s.regularCoachName ? ` на замене, по расписанию ${s.regularCoachName}` : ""),
    cancelled ? "отменено" : `записано ${s.taken} из ${s.capacity}${s.waitlist ? `, ждут ${s.waitlist}` : ""}`,
    s.live ? "идёт сейчас" : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/admin/sessions/${s.id}`}
      aria-label={label}
      className={clsx(
        "group absolute inset-x-1 z-[1] overflow-hidden rounded-lg border-l-[3px] px-2 pb-1.5 pt-1 transition-[background-color,box-shadow] duration-200 hover:z-10 focus-visible:z-10",
        cancelled ? "border border-dashed border-line/20 !border-l-[3px] bg-transparent" : "hover:shadow-[0_10px_30px_-12px_rgb(0_0_0/0.9)]",
        s.live && "ring-1 ring-pulse",
        past && "opacity-55 hover:opacity-100",
      )}
      style={{
        top: (start - from) * PX + 1,
        height: s.durationMin * PX - 2,
        borderLeftColor: z.color,
        background: cancelled ? undefined : `color-mix(in srgb, ${z.color} 13%, rgb(var(--raised)))`,
      }}
    >
      <span className="flex items-baseline justify-between gap-1">
        <span className="digits flex items-center gap-1.5 text-[16px] leading-none text-chalk">
          {s.live && <BeatDot className="h-1.5 w-1.5 text-pulse" />}
          {s.time}
        </span>
        {cancelled ? (
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-pulse">отмена</span>
        ) : (
          <span className={clsx("digits text-[15px] leading-none", pct >= 100 ? "text-pulse" : "text-dust")}>
            {pct}%{s.waitlist > 0 && <span className="text-pulse"> +{s.waitlist}</span>}
          </span>
        )}
      </span>
      <span className={clsx("mt-0.5 block truncate text-[12.5px] font-semibold leading-tight text-chalk", cancelled && "text-dust line-through")}>
        {s.classTitle}
      </span>
      {tall && (
        <span className="block truncate text-[11.5px] leading-tight text-dust">
          {s.coachName.split(" ")[0]} {s.coachName.split(" ")[1]?.[0]}.
          {s.regularCoachName && <span className="font-semibold text-chalk"> · замена</span>}
        </span>
      )}
      {!cancelled && (
        <span className="absolute inset-x-0 bottom-0 h-[3px] bg-line/10" aria-hidden>
          <span className={clsx("block h-full", pct >= 100 ? "bg-pulse" : "bg-chalk/70")} style={{ width: `${Math.min(100, pct)}%` }} />
        </span>
      )}
    </Link>
  );
}
