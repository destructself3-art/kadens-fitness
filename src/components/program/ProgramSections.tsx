// Static sections of /program around the builder. Server components.
import Link from "next/link";
import { GOALS } from "@/data/goals";
import { ZoneLegend } from "@/components/ui/Cards";
import { ArrowLink } from "@/components/ui/Kit";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { ZONES } from "@/lib/zones";
import { HOW_IT_WORKS } from "./copy";
import { ZoneMixBar, pct } from "./ZoneMix";

export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="container-page py-24 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow mb-4">Как это устроено</p>
          <h2 id="how-title" className="display text-d-2 stretch-narrow">
            Не шаблон,{" "}
            <br />а ваша неделя
          </h2>
          <div className="mt-10 grid gap-3 rounded-2xl border border-line/10 p-5">
            <p className="text-[13px] text-dust">Максимальный пульс</p>
            <p className="digits text-[30px] leading-none text-chalk">HRmax = 208 − 0,7 × возраст</p>
            <p className="mt-3 text-[13px] text-dust">Граница зоны</p>
            <p className="digits text-[30px] leading-none text-chalk">покой + (HRmax − покой) × доля</p>
          </div>
        </Reveal>
        <ol className="grid">
          {HOW_IT_WORKS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.05} className="grid grid-cols-[64px_1fr] gap-x-5 border-t border-line/10 py-8 last:border-b md:grid-cols-[96px_1fr] md:py-10">
              <span className="digits text-[56px] leading-[0.8] text-pulse md:text-[76px]">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="display block text-d-4 stretch-normal">{step.title}</span>
                <span className="mt-3 block max-w-xl text-[16px] leading-relaxed text-dust">{step.text}</span>
              </span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function GoalMixes() {
  return (
    <section aria-labelledby="mix-title" className="rubber border-y border-line/10 py-24 md:py-32">
      <div className="container-page">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">Четыре цели</p>
            <h2 id="mix-title" className="display text-d-2 stretch-narrow md:stretch-wide">
              Сколько недели{" "}
              <br />в какой зоне
            </h2>
          </div>
          <p className="max-w-md text-[16px] leading-relaxed text-dust">
            У каждой цели своя раскладка времени по зонам. Программа подбирает занятия так, чтобы неделя легла как можно ближе к ней.
          </p>
        </Reveal>
        <ul className="mt-14 grid gap-2">
          {GOALS.map((g, i) => (
            <Reveal as="li" key={g.slug} delay={i * 0.06}>
              <Link
                href={`/program?goal=${g.slug}#builder`}
                className="group grid gap-4 rounded-2xl border border-line/10 bg-asphalt/70 p-4 transition-colors duration-300 hover:border-line/30 sm:p-5 md:grid-cols-[88px_minmax(0,220px)_1fr_auto] md:items-center md:gap-6"
              >
                <MediaFrame shot={g.photo} alt="" quiet sizes="88px" className="hidden aspect-square rounded-xl md:block" />
                <span>
                  <span className="display block text-[26px] leading-[0.95] stretch-narrow">{g.title}</span>
                  <span className="mt-1 block text-[13px] text-dust md:hidden">{g.short}</span>
                </span>
                <span className="grid gap-2">
                  <ZoneMixBar shares={g.zoneMix} showShare className="h-10" label={`${g.title}: ${ZONES.filter((z) => g.zoneMix[z.id] > 0).map((z) => `Z${z.id} ${pct(g.zoneMix[z.id])}`).join(", ")}`} />
                </span>
                <span className="inline-flex items-center gap-2 text-[14.5px] font-semibold text-chalk">
                  <span className="link-underline">Собрать неделю</span>
                  <span aria-hidden className="transition-transform duration-300 ease-silk group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
        <ZoneLegend className="mt-8" />
      </div>
    </section>
  );
}

export function RuffierTeaser() {
  return (
    <section aria-labelledby="ruffier-title" className="container-page py-24 md:py-32">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <Reveal>
          <MediaFrame shot="pulse-check" alt="Два пальца на шее под челюстью: так считают пульс" sizes="(min-width: 1100px) 44vw, 92vw" className="aspect-[4/5] rounded-card sm:aspect-[5/4] lg:aspect-[4/5]" />
        </Reveal>
        <Reveal delay={0.08}>
          <p className="eyebrow mb-4">Точнее, чем тап</p>
          <h2 id="ruffier-title" className="display text-d-2 stretch-normal lg:stretch-wide">
            Проба{" "}
            <br />
            <span className="text-pulse">Руфье</span>
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-dust">
            Тест со школьной физкультуры: пульс в покое, 30 приседаний за 45 секунд и ещё два замера. Пара минут — и вы знаете не только пульс покоя, но и то, как
            быстро сердце восстанавливается после нагрузки.
          </p>
          <ol className="mt-10 grid grid-cols-3 gap-2 border-y border-line/10 py-6">
            {[
              ["P1", "в покое"],
              ["30", "приседаний"],
              ["P2 · P3", "после"],
            ].map(([big, small]) => (
              <li key={big}>
                <span className="digits block text-[40px] leading-none text-chalk">{big}</span>
                <span className="mt-2 block text-[13px] text-dust">{small}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            <Link href="/program/ruffier" className="btn-primary">
              Пройти пробу
            </Link>
            <ArrowLink href="/trial">Или бесплатная пробная тренировка с тренером</ArrowLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
