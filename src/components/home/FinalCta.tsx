import { ArrowLink } from "@/components/ui/Kit";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { HomeReveal } from "./HomeReveal";
import { CLUB, HOURS_LABEL } from "@/lib/club";

/** The last screen: the club at night, the free first class with a pulse test, address and hours. */
export function FinalCta() {
  return (
    <section aria-labelledby="trial-title" className="relative isolate flex min-h-[92svh] items-end overflow-hidden">
      <MediaFrame
        shot="facade-night"
        alt="Клуб ночью после дождя: на втором этаже красным светится сайкл-студия, вдали Кремль"
        sizes="100vw"
        className="absolute inset-0 -z-20"
        imgClassName="object-[62%_center]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(12_11_10)_0%,rgb(12_11_10/0.35)_22%,rgb(12_11_10/0.25)_45%,rgb(12_11_10/0.9)_78%,rgb(12_11_10)_100%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,rgb(12_11_10/0.85)_0%,rgb(12_11_10/0.35)_45%,transparent_70%)] md:block" />

      <div className="container-page grid gap-12 pb-16 pt-40 md:pb-24 lg:grid-cols-12 lg:items-end">
        <HomeReveal className="lg:col-span-8">
          <p className="eyebrow text-chalk/75">Первый визит</p>
          <h2 id="trial-title" className="display stretch-narrow mt-4 text-[clamp(3rem,9vw,8.5rem)] leading-[0.84]">
            Первая тренировка <span className="text-pulse">бесплатно</span>
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-chalk/80 md:text-[18px]">
            Занятие с тренером и пульс-тест: пульс в покое, тридцать приседаний и два замера после них. По этим цифрам тренер посчитает ваши пять
            зон и покажет, с каких занятий в расписании начать. Оставьте заявку, администратор перезвонит и договорится о времени.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <MagneticButton href="/trial">Записаться на пробную</MagneticButton>
            <ArrowLink href="/contacts">Как нас найти</ArrowLink>
          </div>
        </HomeReveal>

        <HomeReveal delay={0.12} className="lg:col-span-4">
          <address className="rounded-card border border-line/15 bg-asphalt/80 p-6 not-italic backdrop-blur-md">
            <p className="eyebrow">Адрес</p>
            <p className="mt-3 text-[18px] font-semibold text-chalk">
              {CLUB.city}, {CLUB.street}
            </p>
            <p className="mt-1 text-[14.5px] text-dust">
              {CLUB.district[0].toUpperCase() + CLUB.district.slice(1)}. Парковка на <span className="digits text-[18px] text-chalk">{CLUB.parkingSpots}</span> мест.
            </p>
            <dl className="mt-5 grid gap-2 border-t border-line/10 pt-4 text-[15px]">
              {HOURS_LABEL.map((h) => (
                <div key={h.days} className="flex items-baseline justify-between gap-4">
                  <dt className="text-dust">{h.days}</dt>
                  <dd className="digits text-[24px] leading-none text-chalk">{h.time}</dd>
                </div>
              ))}
            </dl>
            <a href={CLUB.phoneHref} className="mt-5 inline-flex min-h-[44px] items-center text-[18px] font-semibold text-chalk transition-colors hover:text-pulse">
              {CLUB.phone}
            </a>
          </address>
        </HomeReveal>
      </div>
    </section>
  );
}
