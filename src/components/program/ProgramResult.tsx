"use client";

import Link from "next/link";
import { useEffect, useState, type RefObject } from "react";
import { RotateCcw } from "lucide-react";
import { GOALS, getGoal } from "@/data/goals";
import { usePulse } from "@/components/pulse/PulseProvider";
import { BeatWord } from "@/components/pulse/Beat";
import { LeadForm } from "@/components/ui/LeadForm";
import { BOOKING } from "@/lib/club";
import { plural } from "@/lib/format";
import { LEVEL_LABELS, type Program } from "@/lib/program";
import { weekRangeLabel } from "@/lib/time";
import { BookWeekForm } from "./BookWeekForm";
import { formatIndex } from "./RuffierScale";
import { readRuffier, type StoredRuffier } from "./ruffier-storage";
import type { ProgramAnswers } from "./ProgramBuilder";
import { timesWord } from "./BuilderSteps";
import { WeekStrip } from "./WeekStrip";
import { ZoneTimeChart } from "./ZoneTimeChart";

type Props = {
  program: Program;
  answers: ProgramAnswers;
  today: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onRebuild: () => void;
  onEditTimes: () => void;
};

export function ProgramResult({ program, answers, today, headingRef, onRebuild, onEditTimes }: Props) {
  const { measured, hydrated, rest, age } = usePulse();
  const goal = getGoal(answers.goal);
  const count = program.items.length;
  // The last Ruffier test in this browser, if any, goes to the coach too. Read after mount: localStorage.
  const [ruffier, setRuffier] = useState<StoredRuffier | null>(null);
  useEffect(() => setRuffier(readRuffier()), []);

  // What the coach receives with the request.
  const programJson = JSON.stringify({
    goal: answers.goal,
    level: answers.level,
    days: answers.days,
    times: answers.times,
    ...(ruffier && { ruffier: { index: ruffier.index, grade: ruffier.grade, p1: ruffier.p1, p2: ruffier.p2, p3: ruffier.p3 } }),
    items: program.items.map((i) => ({
      sessionId: i.session.id,
      class: i.session.classTitle,
      date: i.session.dateKey,
      time: i.session.time,
      zone: i.session.zone,
    })),
  });
  const goalOptions: [string, string][] = [goal, ...GOALS.filter((g) => g.slug !== goal.slug)].map((g) => [g.slug, g.title]);

  return (
    <div>
      {/* Head */}
      <div className="ecg-grid border-b border-line/10 p-5 sm:p-8 lg:p-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">
              Ваша неделя · <span className="digits text-[17px] tracking-normal text-chalk">{weekRangeLabel(today)}</span>
            </p>
            <h2 ref={headingRef} tabIndex={-1} className="display mt-4 text-d-2 stretch-narrow focus:outline-none">
              {count > 0 ? (
                <>
                  {count} {plural(count, "занятие", "занятия", "занятий")} <br className="hidden sm:block" />
                  под <BeatWord className="text-pulse" base={56} amp={30}>ваш пульс</BeatWord>
                </>
              ) : (
                "Под эти условия мест нет"
              )}
            </h2>
            <p className="mt-5 text-[15.5px] leading-relaxed text-dust">
              {goal.title} · {LEVEL_LABELS[answers.level].toLowerCase()} · {answers.days} {timesWord(answers.days)} в неделю. Неделя собрана из настоящего расписания
              на {BOOKING.daysAhead} дней вперёд: только занятия, где прямо сейчас есть свободные места.{" "}
              {hydrated && measured ? (
                <>
                  Пульсовые коридоры посчитаны от вашего пульса покоя <span className="digits text-[18px] text-chalk">{rest}</span> и возраста{" "}
                  <span className="digits text-[18px] text-chalk">{age}</span>.
                </>
              ) : (
                <>Коридоры пока по средним данным: измерьте пульс на первом шаге, и цифры станут вашими.</>
              )}
            </p>
          </div>
          <button type="button" className="btn-ghost self-start lg:self-end" onClick={onRebuild}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Пересобрать
          </button>
        </div>
      </div>

      <div className="grid gap-12 p-5 sm:p-8 lg:gap-16 lg:p-12">
        {program.shortfall && (
          <div className="flex flex-col gap-4 rounded-2xl border border-z2/40 bg-z2/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between" role="note">
            <p className="text-[15px] leading-relaxed text-chalk">{program.shortfall}</p>
            <button type="button" className="btn-ghost flex-none" onClick={onEditTimes}>
              Изменить время
            </button>
          </div>
        )}

        {count === 0 ? (
          <div className="grid place-items-start gap-4 py-6">
            <p className="max-w-xl text-[16px] leading-relaxed text-dust">
              В ближайшие {BOOKING.daysAhead} дней в выбранное время нет подходящих занятий со свободными местами. Добавьте другое время дня или загляните в расписание:
              места освобождаются, когда кто-то отменяет запись.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={onEditTimes}>
                Выбрать другое время
              </button>
              <Link href="/schedule" className="btn-ghost">
                Открыть расписание
              </Link>
            </div>
          </div>
        ) : (
          <>
            <section aria-label="Неделя по дням">
              <WeekStrip items={program.items} today={today} />
            </section>

            <section aria-label="Время в пульсовых зонах" className="border-t border-line/10 pt-12 lg:pt-16">
              <ZoneTimeChart minutes={program.minutesByZone} goal={goal} />
            </section>

            <section aria-label="Запись и заявка тренеру" className="grid gap-6 border-t border-line/10 pt-12 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:pt-16">
              <div className="rounded-[24px] border border-pulse/30 bg-asphalt/60 p-5 sm:p-8">
                <h3 className="display text-d-3 stretch-narrow">Записаться на всю неделю</h3>
                <p className="mb-7 mt-4 max-w-lg text-[15px] leading-relaxed text-dust">
                  Одна форма — {count} {plural(count, "запись", "записи", "записей")}. Если место успели занять, встанете в лист ожидания, и освободившееся место достанется вам
                  автоматически. На одно занятие один человек записывается один раз.
                </p>
                <BookWeekForm items={program.items} today={today} />
              </div>
              <div className="rounded-[24px] border border-line/10 p-5 sm:p-8">
                <h3 className="display text-d-3 stretch-narrow">Отправить программу тренеру</h3>
                <p className="mb-7 mt-4 max-w-lg text-[15px] leading-relaxed text-dust">
                  Тренер посмотрит неделю и ваши зоны, а администратор перезвонит и предложит время бесплатной пробной тренировки с пульсовым тестом.
                  {ruffier && (
                    <>
                      {" "}
                      Приложим и вашу пробу Руфье: индекс <span className="digits text-[18px] text-chalk">{formatIndex(ruffier.index)}</span>.
                    </>
                  )}
                </p>
                <LeadForm
                  key={answers.goal}
                  kind="program"
                  attachPulse
                  program={programJson}
                  fields={["goal", "comment"]}
                  goals={goalOptions}
                  submitLabel="Отправить тренеру"
                  commentLabel="Что важно знать тренеру"
                  commentPlaceholder="Травмы и ограничения, удобное время для звонка"
                  successTitle="Программа у тренера"
                  successText="Администратор перезвонит в рабочее время клуба и договорится о пробной тренировке."
                />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
