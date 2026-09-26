"use client";

import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { BeatDot } from "@/components/pulse/Beat";
import { PersonalRange } from "@/components/pulse/Zones";
import { placesLabel } from "@/lib/format";
import type { SessionView } from "@/lib/session-types";
import { zoneMeta } from "@/lib/zones";

/** Seats bar: filled part in the class zone color. */
export function SeatsBar({ session, className }: { session: SessionView; className?: string }) {
  const share = Math.min(1, session.taken / Math.max(1, session.capacity));
  return (
    <span className={clsx("block h-1 overflow-hidden rounded-full bg-line/10", className)} aria-hidden>
      <span className="block h-full rounded-full" style={{ width: `${share * 100}%`, background: zoneMeta(session.zone).color }} />
    </span>
  );
}

/** Status line: live, cancelled, full, few places left, substitute. */
export function SessionStatus({ session, className }: { session: SessionView; className?: string }) {
  if (session.status === "cancelled") return <span className={clsx("text-[13px] font-medium text-dust line-through", className)}>Отменено</span>;
  if (session.live)
    return (
      <span className={clsx("inline-flex items-center gap-1.5 text-[13px] font-semibold text-pulse", className)}>
        <BeatDot className="h-2 w-2" /> Идёт сейчас
      </span>
    );
  if (session.started) return <span className={clsx("text-[13px] text-dust", className)}>Прошло</span>;
  if (session.left === 0)
    return (
      <span className={clsx("text-[13px] font-medium text-z2", className)}>
        Мест нет{session.waitlist > 0 ? `, в ожидании ${session.waitlist}` : ", можно в лист ожидания"}
      </span>
    );
  if (session.left <= 3) return <span className={clsx("text-[13px] font-semibold text-pulse", className)}>Осталось {placesLabel(session.left)}</span>;
  return <span className={clsx("text-[13px] text-dust", className)}>Свободно {session.left} из {session.capacity}</span>;
}

/**
 * One class in a list: time, title, studio and coach, zone with the visitor's personal range, seats.
 * Links to /schedule/[id] where the booking happens.
 */
export function SessionRow({ session, showDate = false, dateLabel, className }: { session: SessionView; showDate?: boolean; dateLabel?: string; className?: string }) {
  const z = zoneMeta(session.zone);
  const muted = session.status === "cancelled" || (session.started && !session.live);
  return (
    <Link
      href={`/schedule/${session.id}`}
      className={clsx(
        "group relative grid grid-cols-[64px_1fr] items-center gap-x-4 gap-y-2 rounded-2xl border border-line/10 bg-graphite px-4 py-3.5 transition-colors hover:border-line/30 hover:bg-raised sm:grid-cols-[76px_1fr_auto]",
        muted && "opacity-60",
        className,
      )}
    >
      <span className="absolute inset-y-3 left-0 w-[3px] rounded-full" style={{ background: z.color }} aria-hidden />
      <span className="flex flex-col">
        {showDate && dateLabel && <span className="text-[12px] text-dust">{dateLabel}</span>}
        <span className="digits text-[34px] leading-none text-chalk">{session.time}</span>
        <span className="text-[12px] text-dust">{session.durationMin} мин</span>
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className={clsx("font-display text-[18px] uppercase leading-tight [overflow-wrap:anywhere] sm:text-[21px]", session.status === "cancelled" && "line-through")} style={{ fontVariationSettings: '"wdth" 72', fontWeight: 800 }}>
            {session.classTitle}
          </span>
          <span className="text-[13.5px] text-dust">«{session.studioName}»</span>
        </span>
        <span className="mt-0.5 block truncate text-[14px] text-dust">
          {session.coachName}
          {session.regularCoachName && <span className="ml-1.5 text-z2">замена</span>}
        </span>
        <SeatsBar session={session} className="mt-2 max-w-[260px]" />
      </span>
      <span className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end sm:justify-center">
        <span className="flex items-center gap-2 text-[13px] text-dust">
          <span className="rounded-md px-1.5 py-0.5 font-display text-[12px] uppercase leading-none" style={{ background: z.color, color: z.ink, fontWeight: 800, fontVariationSettings: '"wdth" 110' }}>
            Z{z.id}
          </span>
          <PersonalRange zone={session.zone} className="text-[20px] text-chalk" />
        </span>
        <span className="flex items-center gap-2">
          <SessionStatus session={session} />
          <ArrowUpRight className="h-4 w-4 text-dust transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-chalk" aria-hidden />
        </span>
      </span>
    </Link>
  );
}
