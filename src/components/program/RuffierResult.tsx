"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";
import { usePulse } from "@/components/pulse/PulseProvider";
import { ZoneScale } from "@/components/pulse/Zones";
import { REST_MAX, REST_MIN, RUFFIER_GRADES, restingVerdict, ruffierGrade, ruffierIndex } from "@/lib/zones";
import { RuffierScale, formatIndex, gradeIndex } from "./RuffierScale";
import { saveRuffier } from "./ruffier-storage";

const VALUES = [
  { key: "p1", title: "P1", text: "в покое" },
  { key: "p2", title: "P2", text: "сразу после" },
  { key: "p3", title: "P3", text: "через минуту" },
] as const;

/** Per-minute values in, index, grade, scale and next steps out. Saves P1 as the resting pulse of the site. */
export function RuffierResult({ p1, p2, p3, onRestart }: { p1: number; p2: number; p3: number; onRestart: () => void }) {
  const { setRest, age } = usePulse();
  const index = ruffierIndex(p1, p2, p3);
  const grade = ruffierGrade(index);
  const poor = gradeIndex(index) === RUFFIER_GRADES.length - 1;
  const rest = Math.min(REST_MAX, Math.max(REST_MIN, p1));
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    setRest(p1, "ruffier");
    saveRuffier({ index, grade: grade.label, p1, p2, p3, date: new Date().toISOString() });
  }, [p1, p2, p3, index, grade.label, setRest]);

  const values = { p1, p2, p3 };

  return (
    <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16 [&>*]:min-w-0">
      <div>
        <p className="eyebrow">Индекс Руфье</p>
        <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-3">
          <p className="digits text-[128px] leading-[0.78] text-pulse sm:text-[168px]">{formatIndex(index)}</p>
          <p className="display max-w-full break-words pb-1 text-[clamp(24px,7.2vw,30px)] leading-none stretch-narrow sm:text-d-3">{grade.label}</p>
        </div>
        <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-chalk/90">{grade.note}</p>
        <RuffierScale index={index} className="mt-10 max-w-xl" />
        <p className="mt-8 text-[14px] text-dust">
          <span className="digits text-[22px] text-chalk">
            ({p1} + {p2} + {p3} − 200) / 10 = {formatIndex(index)}
          </span>
        </p>
      </div>

      <div className="grid content-start gap-6">
        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line/10 bg-line/10">
          {VALUES.map((v) => (
            <div key={v.key} className="flex flex-col-reverse justify-end bg-asphalt p-4 sm:p-5">
              <dt className="mt-2 text-[12.5px] leading-snug text-dust">
                <span className="font-semibold text-chalk">{v.title}</span> {v.text}
              </dt>
              <dd className="text-chalk">
                <span className="digits block text-[44px] leading-[0.85] sm:text-[52px]">{values[v.key]}</span>
                <span className="mt-1 block text-[12.5px] text-dust">уд/мин</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="rounded-2xl border border-line/10 p-5 sm:p-6">
          <p className="text-[15px] leading-relaxed text-chalk/90">
            <span className="digits text-[20px] text-pulse">{rest}</span> уд/мин теперь ваш пульс покоя на сайте. {restingVerdict(rest)}.
            {rest !== p1 && ` Сайт принимает пульс покоя от ${REST_MIN} до ${REST_MAX}, поэтому записали ${rest}.`}
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-dust">
            От него посчитаны зоны: они уже в расписании и у каждого занятия. Возраст сейчас <span className="digits text-[18px] text-chalk">{age}</span>, поправить его
            можно{" "}
            <Link href="/zones" className="text-chalk underline decoration-line/40 underline-offset-4 hover:decoration-chalk">
              на странице зон
            </Link>
            .
          </p>
        </div>
        <ZoneScale />
      </div>

      <div className="flex flex-col gap-3 border-t border-line/10 pt-8 sm:flex-row sm:flex-wrap sm:items-center lg:col-span-2">
        {poor ? (
          <p className="w-full rounded-2xl border border-pulse/40 bg-pulse/10 px-5 py-4 text-[15px] leading-relaxed text-chalk sm:mb-2">
            С таким результатом сначала к врачу. Когда он разрешит нагрузку, приходите на пробную тренировку: тренер начнёт с первой и второй зоны.
          </p>
        ) : null}
        <Link href="/program#builder" className={poor ? "btn-ghost" : "btn-primary"}>
          Собрать неделю под этот пульс
        </Link>
        <Link href="/trial" className="btn-ghost">
          Пробная тренировка с пульсовым тестом
        </Link>
        <button type="button" className="btn-quiet sm:ml-auto" onClick={onRestart}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          Пройти ещё раз
        </button>
      </div>
    </div>
  );
}
