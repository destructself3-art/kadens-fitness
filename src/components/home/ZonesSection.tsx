import Link from "next/link";
import { CLASSES } from "@/data/classes";
import { ArrowLink } from "@/components/ui/Kit";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { HomeReveal } from "./HomeReveal";
import { PersonalRange } from "@/components/pulse/Zones";
import { ZONES } from "@/lib/zones";
import { PulseNote } from "./PulseNote";

/** Height of the colored part of each column on wide screens: the tops form a staircase, like a rising pulse. */
const FILL_PX = [168, 224, 280, 336, 392];

/** «Пять зон — пять разных тренировок»: five columns in zone colors with the visitor's own numbers. */
export function ZonesSection() {
  return (
    <section id="zones" aria-labelledby="zones-title" className="scroll-mt-24 py-24 md:py-36">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end lg:gap-16">
          <HomeReveal>
            <p className="eyebrow">Пульсовые зоны</p>
            <h2 id="zones-title" className="display stretch-narrow mt-4 text-d-2">
              Пять зон — пять разных тренировок
            </h2>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-dust md:text-[18px]">
              Зона — это диапазон пульса, а не ощущение «тяжело». Считаем по Карвонену: к пульсу покоя прибавляем долю резерва, то есть разницы
              между максимумом и покоем. Каждое занятие в расписании построено вокруг своей зоны, и тренер ведёт группу по цифрам, а не по
              громкости музыки.
            </p>
            <PulseNote className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-dust" />
          </HomeReveal>
          <HomeReveal as="div" delay={0.1}>
            <figure>
              <MediaFrame
                shot="pulse-check"
                alt="Два пальца прижаты к шее под челюстью: человек считает пульс"
                sizes="(min-width: 1100px) 380px, 92vw"
                className="aspect-[4/3] rounded-card lg:aspect-[4/5]"
                imgClassName="object-[60%_35%]"
              />
              <figcaption className="mt-3 text-[13.5px] text-dust">Два пальца под челюсть, сбоку от кадыка. Считайте удары, а не секунды.</figcaption>
            </figure>
          </HomeReveal>
        </div>

        <ol className="mt-14 grid gap-3 md:mt-20 lg:grid-cols-5 lg:gap-2.5">
          {ZONES.map((z, i) => {
            const classes = CLASSES.filter((c) => c.zone === z.id).slice(0, 3);
            return (
              <HomeReveal
                as="li"
                key={z.id}
                delay={i * 0.06}
                className="grid grid-cols-[104px_minmax(0,1fr)] overflow-hidden rounded-card border border-line/10 bg-graphite sm:grid-cols-[150px_minmax(0,1fr)] lg:flex lg:flex-col"
              >
                <div className="p-4 sm:p-5 lg:order-1 lg:flex-1">
                  <h3 className="display stretch-narrow text-[28px] leading-none sm:text-[32px] lg:text-[30px] xl:text-[34px]">{z.name}</h3>
                  <p className="mt-2 text-[13px] text-dust">
                    <span className="digits text-[19px] text-chalk">
                      {Math.round(z.reserve[0] * 100)}–{Math.round(z.reserve[1] * 100)}%
                    </span>{" "}
                    резерва пульса
                  </p>
                  <p className="mt-4 text-[14.5px] leading-snug text-chalk/90">{z.feel}</p>
                  <p className="mt-2 text-[14px] leading-snug text-dust">{z.effect}</p>
                  <ul className="mt-4 border-b border-line/10">
                    {classes.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/classes/${c.slug}`}
                          className="group flex min-h-[44px] items-center justify-between gap-2 border-t border-line/10 text-[14.5px] font-medium text-chalk"
                        >
                          <span className="link-underline">{c.title}</span>
                          <span aria-hidden className="text-dust transition-transform duration-300 ease-silk group-hover:translate-x-1 group-hover:text-chalk">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className="order-first flex flex-col justify-between gap-6 p-4 sm:p-5 lg:order-2 lg:min-h-[var(--fill)]"
                  style={{ background: z.color, color: z.ink, ["--fill" as string]: `${FILL_PX[i]}px` }}
                >
                  <p>
                    <span className="sr-only">Ваш диапазон: </span>
                    <PersonalRange zone={z.id} className="block text-[34px] leading-[0.85] sm:text-[44px] lg:text-[46px] xl:text-[54px]" />
                    <span className="mt-1 block text-[11.5px] font-semibold uppercase tracking-[0.14em] opacity-75">уд/мин</span>
                  </p>
                  <p aria-hidden className="font-display text-[56px] uppercase leading-[0.78] sm:text-[72px]" style={{ fontWeight: 900, fontVariationSettings: '"wdth" 60' }}>
                    Z{z.id}
                  </p>
                </div>
              </HomeReveal>
            );
          })}
        </ol>

        <HomeReveal className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-[14.5px] text-dust">Цифры обновятся везде на сайте, как только вы измерите пульс: в расписании, у занятий и в программе.</p>
          <ArrowLink href="/zones">Как считаем зоны и зачем они нужны</ArrowLink>
        </HomeReveal>
      </div>
    </section>
  );
}
