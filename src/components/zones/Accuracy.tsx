// How precise the numbers are: measuring methods, what shifts the pulse, and the medical note.
import clsx from "clsx";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { METHODS, MEDICAL_NOTE, SHIFTERS } from "./copy";

function Meter({ score }: { score: 1 | 2 | 3 }) {
  return (
    <span className="flex gap-1" aria-hidden>
      {[1, 2, 3].map((i) => (
        <span key={i} className={clsx("h-1.5 w-8 rounded-full", i <= score ? "bg-pulse" : "bg-raised")} />
      ))}
    </span>
  );
}

export function Accuracy() {
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
      <Reveal className="lg:col-span-5">
        <figure className="lg:sticky lg:top-28">
          <MediaFrame
            shot="detail-hr-strap"
            alt="Нагрудный пульсометр на резиновом полу рядом со сложенным полотенцем"
            sizes="(min-width: 1100px) 38vw, 92vw"
            className="aspect-square rounded-card"
          />
          <figcaption className="mt-3 text-[13.5px] text-dust">Если у вас есть нагрудный датчик, возьмите его на тренировку: он точнее часов.</figcaption>
        </figure>
      </Reveal>

      <div className="lg:col-span-7">
        <h3 className="eyebrow">Чем мерить</h3>
        <ol className="mt-4 border-t border-line/10">
          {METHODS.map((m) => (
            <li key={m.name} className="grid gap-3 border-b border-line/10 py-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] sm:gap-8">
              <div>
                <p className="font-display text-[26px] uppercase leading-none text-chalk" style={{ fontWeight: 820, fontVariationSettings: '"wdth" 70' }}>
                  {m.name}
                </p>
                <p className="mt-3 flex items-center gap-3 text-[13px] text-dust">
                  <Meter score={m.score} />
                  <span>
                    <span className="sr-only">Точность на тренировке: {m.score} из 3. </span>
                    {m.verdict}
                  </span>
                </p>
              </div>
              <p className="text-[15.5px] leading-relaxed text-dust">{m.text}</p>
            </li>
          ))}
        </ol>

        <h3 className="eyebrow mt-14">Что сдвигает пульс</h3>
        <ul className="mt-4 grid gap-px overflow-hidden rounded-card border border-line/10 bg-line/10 sm:grid-cols-2">
          {SHIFTERS.map((s) => (
            <li key={s.what} className="bg-asphalt p-5 sm:p-6">
              <p className="flex items-baseline justify-between gap-4">
                <span className="text-[16px] font-semibold text-chalk">{s.what}</span>
                <span className="digits flex-none text-[30px] leading-none text-pulse">{s.shift}</span>
              </p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-dust">{s.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] text-dust">Цифры — удары в минуту сверх обычного, типичный разброс.</p>

        <Reveal className="mt-14 rounded-card border border-pulse/40 bg-pulse/[0.06] p-6 sm:p-8">
          <p className="font-display text-[26px] uppercase leading-none text-chalk sm:text-[32px]" style={{ fontWeight: 820, fontVariationSettings: '"wdth" 70' }}>
            {MEDICAL_NOTE.title}
          </p>
          <p className="mt-4 max-w-[62ch] text-[15.5px] leading-relaxed text-chalk/85">{MEDICAL_NOTE.text}</p>
        </Reveal>
      </div>
    </div>
  );
}
