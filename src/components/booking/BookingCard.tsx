"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { FormError } from "@/components/ui/Form";
import type { BookingView } from "@/lib/session-types";
import { formatDay, relativeDayLabel } from "@/lib/time";
import { zoneMeta } from "@/lib/zones";
import { cancelBookingRequest } from "./api";
import { StatusChip } from "./StatusChip";
import { isUpcoming, ticketState } from "./ticket-state";

type Props = {
  booking: BookingView;
  /** The last 4 digits the visitor typed for the lookup: they also authorize the cancel */
  last4: string;
  /** The moment the list was loaded: relative day labels are computed against it, not the live clock */
  loadedAt: Date;
  /** Called after a successful cancel so the list reloads */
  onCancelled: (message: string) => void;
};

/** One booking in «Мои записи»: when, what, where, status, link to the ticket and an inline cancel. */
export function BookingCard({ booking, last4, loadedAt, onCancelled }: Props) {
  const s = booking.session;
  const state = ticketState(booking);
  const upcoming = isUpcoming(state);
  const z = zoneMeta(s.zone);
  const day = formatDay(s.dateKey);
  const rel = relativeDayLabel(s.dateKey, loadedAt);
  const dayLabel = rel === "сегодня" || rel === "завтра" ? rel : `${day.weekdayShort}, ${day.dayMonth}`;
  const waitlist = booking.status === "waitlist";
  // A class the club cancelled is still "cancellable" in the data, but there is nothing to give up.
  const canCancel = booking.cancellable && upcoming;

  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setBusy(true);
    setError(null);
    const res = await cancelBookingRequest(booking.code, last4);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setConfirming(false);
    onCancelled(
      waitlist
        ? `Вы вышли из листа ожидания на «${s.classTitle}» ${dayLabel} в ${s.time}.`
        : `Запись на «${s.classTitle}» ${dayLabel} в ${s.time} отменена.${res.data.promoted ? " Место сразу получил первый из листа ожидания." : ""}`,
    );
  }

  const titleId = `booking-${booking.code}`;

  return (
    <li
      aria-labelledby={titleId}
      className={clsx(
        "relative grid grid-cols-[76px_minmax(0,1fr)] gap-x-4 gap-y-4 overflow-hidden rounded-2xl border border-line/10 bg-graphite p-4 pl-5 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:p-5 sm:pl-6",
        !upcoming && "bg-graphite/50",
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: upcoming ? z.color : "rgb(242 239 234 / 0.12)" }} />

      <div className={clsx("flex flex-col", !upcoming && "opacity-60")}>
        <span className="text-[12.5px] font-medium text-dust first-letter:uppercase">{dayLabel}</span>
        <span className="digits text-[38px] leading-[0.9] text-chalk">{s.time}</span>
        <span className="text-[12px] text-dust">{s.durationMin} мин</span>
      </div>

      <div className="min-w-0">
        <StatusChip state={state} position={booking.waitlistPosition} />
        <h3
          id={titleId}
          className={clsx("mt-2.5 font-display text-[23px] uppercase leading-[0.95] text-chalk", state === "cancelled" && "line-through decoration-2", !upcoming && "text-chalk/70")}
          style={{ fontVariationSettings: '"wdth" 70', fontWeight: 850 }}
        >
          {s.classTitle}
        </h3>
        <p className="mt-1.5 text-[14px] text-dust">
          «{s.studioName}» · {s.coachName}
          {s.regularCoachName && <span className="text-chalk"> · замена</span>}
        </p>
        <p className="mt-2 text-[13.5px] text-dust">
          {booking.seat && booking.status !== "cancelled" ? (
            <>
              Место <span className="digits text-[17px] text-chalk">{String(booking.seat).padStart(2, "0")}</span> из {s.capacity}
            </>
          ) : waitlist && booking.waitlistPosition ? (
            <>
              В очереди <span className="digits text-[17px] text-chalk">{booking.waitlistPosition}-й</span> из {s.waitlist}
            </>
          ) : (
            <>
              Код <span className="digits text-[17px] text-chalk">{booking.code}</span>
            </>
          )}
        </p>
      </div>

      <div className="col-span-2 flex flex-wrap items-center gap-2 sm:col-span-1 sm:flex-col sm:items-end sm:justify-center">
        <Link href={`/booking/${booking.code}`} className="btn-ghost min-h-[44px] px-4 text-[14px]" aria-label={`Билет: ${s.classTitle}, ${dayLabel} в ${s.time}`}>
          Билет
          <ArrowUpRight aria-hidden className="h-4 w-4" />
        </Link>
        {canCancel && !confirming && (
          <button type="button" className="btn-quiet min-h-[44px] text-[14px]" onClick={() => setConfirming(true)} aria-label={`${waitlist ? "Выйти из очереди" : "Отменить запись"}: ${s.classTitle}, ${dayLabel} в ${s.time}`}>
            {waitlist ? "Выйти из очереди" : "Отменить"}
          </button>
        )}
      </div>

      {canCancel && confirming && (
        <div className="col-span-full grid gap-3 rounded-xl border border-line/15 bg-asphalt/70 p-4">
          <p className="text-[14.5px] text-chalk">
            {waitlist ? "Выйти из листа ожидания" : "Отменить запись"} на «{s.classTitle}» {dayLabel} в <span className="digits text-[17px]">{s.time}</span>?{" "}
            {!waitlist && <span className="text-dust">Место сразу уйдёт первому из листа ожидания.</span>}
          </p>
          <FormError>{error}</FormError>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary min-h-[44px] text-[14px]" onClick={cancel} disabled={busy} aria-busy={busy || undefined}>
              {busy ? "Отменяем…" : waitlist ? "Да, выйти" : "Да, отменить"}
            </button>
            <button
              type="button"
              className="btn-quiet min-h-[44px] text-[14px]"
              onClick={() => {
                setConfirming(false);
                setError(null);
              }}
            >
              Оставить
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
