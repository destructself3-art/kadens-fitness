// The ticket: a perforated card with the class on the left and a tear-off stub with the code on the right.
// Server-safe; the personal zone range and the code animation are small client islands.
import type { ReactNode } from "react";
import clsx from "clsx";
import { ClassCurve } from "@/components/classes/ClassCurve";
import { PersonalRange } from "@/components/pulse/Zones";
import { ZoneBadge } from "@/components/ui/Kit";
import { getClass } from "@/data/classes";
import { getCoach } from "@/data/coaches";
import { getSpace } from "@/data/spaces";
import type { BookingView } from "@/lib/session-types";
import { zoneMeta } from "@/lib/zones";
import { placeKind, placeName } from "@/components/schedule/place";
import { CardioBarcode } from "./CardioBarcode";
import { StatusChip } from "./StatusChip";
import { ScrambleCode } from "./TicketReveal";
import { STATE_META, type TicketState, type Tone } from "./ticket-state";

const STAMP_COLOR: Record<Tone, string> = {
  pulse: "#FF3A24",
  chalk: "#F2EFEA",
  dust: "#968F89",
};

function Item({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={clsx("min-w-0", className)}>
      <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-dust">{label}</dt>
      <dd className="mt-1.5 text-[15px] leading-snug text-chalk">{children}</dd>
    </div>
  );
}

export function Ticket({ booking, state, dayLabel }: { booking: BookingView; state: TicketState; dayLabel: string }) {
  const s = booking.session;
  const cls = getClass(s.classSlug);
  const space = getSpace(s.studioSlug);
  const coach = getCoach(s.coachSlug);
  const z = zoneMeta(s.zone);
  const meta = STATE_META[state];
  const faded = meta.stamp !== null && state !== "attended";
  const place = placeName(space);
  const firstName = booking.name.trim().split(/\s+/)[0];

  return (
    <article aria-label={`Билет на занятие «${s.classTitle}», код ${booking.code}`} className="relative overflow-hidden rounded-[28px] border border-line/10 bg-graphite shadow-[0_50px_90px_-50px_rgb(0_0_0/0.9)]">
      <span aria-hidden className="absolute inset-x-0 top-0 z-[1] h-1.5" style={{ background: z.color }} />

      <div className={clsx("grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]", faded && "opacity-50 grayscale-[0.6]")}>
        {/* Main part */}
        <div className="relative min-w-0 p-5 pt-8 sm:p-8 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow">Каденс · пропуск на занятие</p>
            <StatusChip state={state} position={booking.waitlistPosition} />
          </div>

          <h2 className="display mt-7 break-words text-[clamp(2.5rem,7.2vw,6.2rem)] leading-[0.84] stretch-narrow">{s.classTitle}</h2>

          <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-3">
            <p className="digits whitespace-nowrap text-[clamp(4.2rem,13vw,8.5rem)] leading-[0.78] text-chalk">
              {s.time}
              <span className="text-[0.42em] text-dust">–{s.endTime}</span>
            </p>
            <p className="pb-1.5 text-[16px] font-medium text-chalk first-letter:uppercase md:text-[18px]">{dayLabel}</p>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line/10 pt-6 md:grid-cols-4">
            <Item label={placeKind(space)}>
              <span className="font-semibold">{place}</span>
              <span className="block text-[13.5px] text-dust">
                {space.floor} этаж · {space.label}
              </span>
            </Item>
            <Item label="Тренер">
              <span className="font-semibold">{s.coachName}</span>
              <span className="block text-[13.5px] text-dust">{s.regularCoachName ? `Замена, обычно ведёт ${s.regularCoachName}` : coach.role}</span>
            </Item>
            {booking.status === "waitlist" && booking.waitlistPosition ? (
              <Item label="Очередь">
                <span className="digits text-[34px] leading-none">{booking.waitlistPosition}-й</span>
                <span className="block text-[13.5px] text-dust">
                  в листе из <span className="digits text-[16px] text-chalk">{s.waitlist}</span>
                </span>
              </Item>
            ) : (
              <Item label="Место">
                {booking.seat ? (
                  <>
                    <span className="digits text-[34px] leading-none">{String(booking.seat).padStart(2, "0")}</span>
                    <span className="block text-[13.5px] text-dust">
                      из <span className="digits text-[16px] text-chalk">{s.capacity}</span> в {space.kind === "studio" ? "студии" : "группе"}
                    </span>
                  </>
                ) : (
                  <span className="digits text-[34px] leading-none text-dust">—</span>
                )}
              </Item>
            )}
            <Item label="Длительность">
              <span className="digits text-[34px] leading-none">{s.durationMin}</span> <span className="text-dust">мин</span>
              <span className="block text-[13.5px] text-dust">
                <span className="digits text-[16px] text-chalk">
                  {cls.kcal[0]}–{cls.kcal[1]}
                </span>{" "}
                ккал
              </span>
            </Item>
          </dl>

          <div className="mt-8 grid gap-5 rounded-2xl border border-line/10 bg-asphalt/70 p-4 sm:p-5 md:grid-cols-[minmax(0,250px)_1fr] md:items-center md:gap-7">
            <div>
              <ZoneBadge zone={s.zone} />
              <p className="mt-3 text-[12.5px] text-dust">Ваш коридор пульса</p>
              <PersonalRange zone={s.zone} withUnit className="whitespace-nowrap text-[44px] leading-none text-chalk" />
            </div>
            <div className="min-w-0">
              <ClassCurve structure={cls.structure} showLabels={false} height={78} />
              <div className="mt-2 flex justify-between text-[12px] text-dust">
                <span>
                  <span className="digits text-[15px] text-chalk">{s.time}</span> {cls.structure[0].title.toLowerCase()}
                </span>
                <span>
                  <span className="digits text-[15px] text-chalk">{s.endTime}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tear-off stub */}
        <div className="relative flex min-w-0 flex-col border-t border-dashed border-line/25 p-5 sm:p-8 lg:border-l lg:border-t-0">
          <span aria-hidden className="absolute -left-4 -top-4 h-8 w-8 rounded-full border border-line/10 bg-asphalt" />
          <span aria-hidden className="absolute -right-4 -top-4 h-8 w-8 rounded-full border border-line/10 bg-asphalt lg:-bottom-4 lg:-left-4 lg:right-auto lg:top-auto" />

          <p className="eyebrow">Код записи</p>
          <ScrambleCode code={booking.code} className="digits mt-2 block whitespace-nowrap text-[clamp(3rem,13vw,4.4rem)] leading-none tracking-[0.03em] text-chalk" />
          <CardioBarcode code={booking.code} className="mt-5 h-16 w-full" />

          <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5">
            <Item label="На имя">{firstName}</Item>
            <Item label="Телефон">
              <span className="tabular whitespace-nowrap">{booking.phoneMasked}</span>
            </Item>
          </dl>

          <p className="mt-7 text-[13px] leading-snug text-dust lg:mt-auto lg:pt-8">
            По коду и последним четырём цифрам телефона запись можно найти и отменить в разделе «Мои записи».
          </p>
        </div>
      </div>

      {meta.stamp && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[2] grid place-items-center">
          <span
            className="-rotate-[9deg] rounded-2xl border-[3px] border-current px-5 py-2 font-display text-[clamp(2.2rem,7vw,5rem)] uppercase leading-none"
            style={{ color: STAMP_COLOR[meta.tone], fontVariationSettings: '"wdth" 118', fontWeight: 900, textShadow: "0 0 30px rgb(12 11 10 / 0.8)" }}
          >
            {meta.stamp}
          </span>
        </div>
      )}
    </article>
  );
}
