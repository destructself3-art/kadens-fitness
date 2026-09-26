"use client";

import { useId, useMemo, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ClassSlug, Coach, ZoneId } from "@/data/types";
import { EmptyState } from "@/components/ui/Kit";
import { num, plural } from "@/lib/format";
import { ZONES } from "@/lib/zones";
import { HoloCard } from "./HoloCard";

export type ClassOption = { slug: ClassSlug; title: string };

const EASE = [0.16, 1, 0.3, 1] as const;

const coachesLabel = (n: number) => `${n} ${plural(n, "тренер", "тренера", "тренеров")}`;

/** Filters by heart-rate zone and class, then the holographic cards. Filters live in the URL (?zone=3&class=cycle). */
export function CoachesExplorer({
  coaches,
  classes,
  initialZone,
  initialClass,
}: {
  /** Head coach first */
  coaches: Coach[];
  classes: ClassOption[];
  initialZone: ZoneId | null;
  initialClass: ClassSlug | null;
}) {
  const [zone, setZone] = useState<ZoneId | null>(initialZone);
  const [cls, setCls] = useState<ClassSlug | null>(initialClass);
  const reduce = useReducedMotion();
  const selectId = useId();

  const titles = useMemo(() => new Map(classes.map((c) => [c.slug, c.title])), [classes]);
  const byClass = (c: Coach, slug: ClassSlug | null) => !slug || c.classes.includes(slug);
  const byZone = (c: Coach, id: ZoneId | null) => !id || c.zone === id;
  const shown = coaches.filter((c) => byZone(c, zone) && byClass(c, cls));
  const filtered = zone !== null || cls !== null;

  function apply(nextZone: ZoneId | null, nextClass: ClassSlug | null) {
    setZone(nextZone);
    setCls(nextClass);
    const url = new URL(window.location.href);
    if (nextZone) url.searchParams.set("zone", String(nextZone));
    else url.searchParams.delete("zone");
    if (nextClass) url.searchParams.set("class", nextClass);
    else url.searchParams.delete("class");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  const zoneCount = (id: ZoneId | null) => coaches.filter((c) => byZone(c, id) && byClass(c, cls)).length;
  const classCount = (slug: ClassSlug | null) => coaches.filter((c) => byZone(c, zone) && byClass(c, slug)).length;

  return (
    <div>
      <div className="flex flex-col gap-6 border-y border-line/10 py-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <fieldset className="min-w-0">
          <legend className="field-label">Зона, в которой тренер обычно ведёт занятия</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="chip min-h-[44px] px-4" aria-pressed={zone === null} onClick={() => apply(null, cls)}>
              Все <span className="digits text-[17px] leading-none opacity-70">{zoneCount(null)}</span>
            </button>
            {ZONES.map((z) => {
              const count = zoneCount(z.id);
              const active = zone === z.id;
              return (
                <button
                  key={z.id}
                  type="button"
                  className="chip min-h-[44px] px-4 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-pressed={active}
                  disabled={count === 0 && !active}
                  onClick={() => apply(active ? null : z.id, cls)}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: z.color, boxShadow: `0 0 10px ${z.color}` }} aria-hidden />
                  Z{z.id} {z.name}
                  <span className="digits text-[17px] leading-none opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="w-full lg:w-[320px] lg:flex-none">
          <label htmlFor={selectId} className="field-label">
            Направление
          </label>
          <select id={selectId} className="field cursor-pointer" value={cls ?? ""} onChange={(e) => apply(zone, (e.target.value || null) as ClassSlug | null)}>
            <option value="">Все направления</option>
            {classes.map((c) => {
              const count = classCount(c.slug);
              return (
                <option key={c.slug} value={c.slug} disabled={count === 0 && cls !== c.slug}>
                  {c.title} · {count}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="mt-5 flex min-h-[44px] flex-wrap items-center justify-between gap-3">
        <p className="text-[14.5px] text-dust" aria-live="polite">
          {filtered ? (
            <>
              Показаны <span className="text-chalk">{coachesLabel(shown.length)}</span> из {coaches.length}
            </>
          ) : (
            <>Вся команда: {coachesLabel(coaches.length)}, главный тренер первым</>
          )}
        </p>
        {filtered && (
          <button type="button" className="btn-quiet !min-h-[44px] !px-0 underline decoration-line/30 underline-offset-4 hover:decoration-chalk" onClick={() => apply(null, null)}>
            Сбросить фильтры
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="Никого с таким сочетанием"
          text="В этой зоне никто не ведёт выбранное направление. Уберите один из фильтров: зону или направление."
          action={
            <button type="button" className="btn-ghost mt-2" onClick={() => apply(null, null)}>
              Показать всю команду
            </button>
          }
        />
      ) : (
        <ul className="relative mt-8 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&_a.holo:focus-visible]:outline-[3px] [&_a.holo:focus-visible]:[--foil:1]">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((coach) => (
              <motion.li
                key={coach.slug}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="mx-auto w-full max-w-[400px] sm:max-w-none"
              >
                <HoloCard coach={coach} sizes="(min-width: 1360px) 22vw, (min-width: 1100px) 30vw, (min-width: 560px) 45vw, 92vw" />
                <div className="mt-4 px-1">
                  <p className="text-[13.5px] leading-snug text-dust">
                    {coach.classes.map((slug, i) => (
                      <span key={slug}>
                        {i > 0 && <span aria-hidden> · </span>}
                        <span className={clsx(cls === slug && "text-chalk")}>{titles.get(slug)}</span>
                      </span>
                    ))}
                  </p>
                  <p className="mt-1.5 text-[13.5px] text-dust">
                    {coach.personalPrice !== null ? (
                      <>
                        Персонально <span className="digits text-[18px] text-chalk">{num(coach.personalPrice)}</span> ₽ за занятие
                      </>
                    ) : (
                      "Только групповые занятия"
                    )}
                  </p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
