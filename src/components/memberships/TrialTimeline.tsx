// The first visit, step by step. Server component; the zones step embeds the visitor's live zones.
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { ZoneScale } from "@/components/pulse/Zones";
import { DEFAULT_AGE, DEFAULT_REST } from "@/lib/zones";
import type { TrialStep } from "./content";

type Props = {
  eyebrow: string;
  title: string;
  steps: TrialStep[];
  photoAlt: string;
  photoCaption: string;
};

export function TrialTimeline({ eyebrow, title, steps, photoAlt, photoCaption }: Props) {
  return (
    <section aria-labelledby="trial-steps-title" className="container-page py-24 md:py-32">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <p className="eyebrow mb-4">{eyebrow}</p>
            <h2 id="trial-steps-title" className="display stretch-narrow text-d-2">
              {title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <figure className="mt-10">
              <MediaFrame
                shot="pulse-check"
                alt={photoAlt}
                sizes="(min-width: 1100px) 38vw, 92vw"
                className="aspect-[4/3] rounded-card lg:aspect-[4/5]"
              />
              <figcaption className="mt-4 max-w-sm text-[14px] text-dust">{photoCaption}</figcaption>
            </figure>
          </Reveal>
        </div>

        <ol className="relative">
          <span aria-hidden className="absolute bottom-10 left-[27px] top-2 w-px bg-gradient-to-b from-pulse via-pulse/30 to-transparent" />
          {steps.map((step, i) => (
            <Reveal as="li" key={step.title} className="relative grid grid-cols-[56px_1fr] gap-5 pb-16 last:pb-0 sm:gap-8">
              <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full border border-pulse/60 bg-asphalt">
                <span className="digits text-[26px] leading-none text-chalk">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <div className="min-w-0 pt-1">
                <p className="digits text-[20px] leading-none text-pulse">{step.minutes}</p>
                <h3 className="display stretch-normal mt-3 text-d-4">{step.title}</h3>
                <p className="mt-4 max-w-[60ch] text-[16.5px] leading-relaxed text-dust">{step.text}</p>
                {step.formula && (
                  <p className="ecg-grid mt-6 inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl border border-line/10 px-5 py-4">
                    <span className="sr-only">Индекс Руфье: сумма трёх замеров пульса минус двести, делённая на десять.</span>
                    <span className="text-[13px] text-dust" aria-hidden>
                      Индекс
                    </span>
                    <span className="digits text-[30px] leading-none text-chalk" aria-hidden>
                      (P1 + P2 + P3 − 200) / 10
                    </span>
                  </p>
                )}
                {step.zones && (
                  <div className="mt-6 max-w-xl">
                    <ZoneScale showFeel />
                    <p className="mt-3 text-[13px] text-dust">
                      Если вы ещё не измеряли пульс на сайте, цифры посчитаны для {DEFAULT_AGE} лет и пульса покоя {DEFAULT_REST}.
                    </p>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
