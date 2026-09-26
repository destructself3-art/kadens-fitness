import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { RUFFIER_ABOUT, RUFFIER_RANGES, RUFFIER_TIMELINE } from "@/components/program/copy";
import { RuffierScale } from "@/components/program/RuffierScale";
import { RuffierTest } from "@/components/program/RuffierTest";
import { BeatWord } from "@/components/pulse/Beat";
import { ArrowLink, Breadcrumbs } from "@/components/ui/Kit";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { RUFFIER_GRADES } from "@/lib/zones";

export const metadata: Metadata = {
  title: "Проба Руфье онлайн: 30 приседаний и три замера пульса",
  description:
    "Пройдите пробу Руфье с телефоном: таймер на 15 секунд, метроном для 30 приседаний за 45 секунд и индекс с оценкой. Пульс покоя сохранится, и сайт пересчитает ваши пульсовые зоны.",
};

const TOTAL_SEC = RUFFIER_TIMELINE.reduce((sum, s) => sum + s.sec, 0);

export default function RuffierPage() {
  return (
    <>
      <header className="relative isolate overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40">
        <div className="ecg-grid absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,black_25%,transparent)]" aria-hidden />
        <div className="container-page">
          <Breadcrumbs
            items={[
              { href: "/", label: "Главная" },
              { href: "/program", label: "Программа" },
              { label: "Проба Руфье" },
            ]}
            className="mb-10"
          />
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
            <Reveal>
              <p className="eyebrow mb-5">Самопроверка сердца · 2 минуты · телефон в руке</p>
              <h1 className="display text-d-1">
                <span className="block stretch-wide">Проба</span>{" "}
                <BeatWord className="block text-pulse" base={56} amp={40}>
                  Руфье
                </BeatWord>
              </h1>
              <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-dust md:text-[19px]">
                Тридцать приседаний и три замера пульса. Экран ведёт по шагам: считает секунды, задаёт темп и сам выводит индекс. Пульс покоя сохранится, и пульсовые
                зоны на сайте станут вашими.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
                <a href="#test" className="btn-primary">
                  Пройти пробу
                </a>
                <ArrowLink href="/journal/ruffier-test">Статья Игоря Семёнова о пробе</ArrowLink>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="relative">
              <MediaFrame
                shot="pulse-check"
                alt="Два пальца на шее под челюстью: так считают пульс"
                sizes="(min-width: 1100px) 40vw, 92vw"
                priority
                className="aspect-[5/4] rounded-card lg:aspect-[4/5]"
              />
              <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-line/10 bg-asphalt/90 px-4 py-3.5 sm:inset-x-5 sm:bottom-5 sm:px-5 sm:py-4">
                <p className="text-[12.5px] text-dust">Индекс Руфье, пульс в ударах в минуту</p>
                <p className="digits mt-1.5 text-[23px] leading-none text-chalk sm:text-[32px]">(P1 + P2 + P3 − 200) / 10</p>
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      <section aria-labelledby="about-title" className="container-page py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow mb-4">Что это</p>
            <h2 id="about-title" className="display text-d-2 stretch-narrow">
              Школьный тест,{" "}
              <br />
              взрослые цифры
            </h2>
            {RUFFIER_ABOUT.map((text) => (
              <p key={text} className="mt-6 max-w-xl text-[17px] leading-relaxed text-dust">
                {text}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.08}>
            <figure>
              <figcaption className="flex items-baseline justify-between gap-4">
                <span className="eyebrow">Две минуты по секундам</span>
                <span className="text-[13px] text-dust">до этого 5 минут покоя лёжа</span>
              </figcaption>
              <div className="mt-6 flex h-28 gap-[3px] sm:h-36" aria-hidden>
                {RUFFIER_TIMELINE.map((s) => (
                  <div
                    key={s.label}
                    style={{ flexGrow: s.sec, flexBasis: 0 }}
                    className={clsx(
                      "flex min-w-0 flex-col justify-between overflow-hidden rounded-lg p-1.5 sm:p-3",
                      s.count ? "bg-pulse text-asphalt" : s.sec === 45 ? "bg-chalk text-asphalt" : "border border-dashed border-line/25 text-dust",
                    )}
                  >
                    {s.label === "·" ? (
                      <span className="text-[12.5px] leading-none sm:text-[14px]">отдых</span>
                    ) : (
                      <span className="digits text-[22px] leading-none sm:text-[34px]">{s.label}</span>
                    )}
                    <span className="digits text-[14px] leading-none sm:text-[17px]">{s.sec}с</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between font-digits text-[15px] text-dust" aria-hidden>
                <span>0:00</span>
                <span>
                  {Math.floor(TOTAL_SEC / 60)}:{String(TOTAL_SEC % 60).padStart(2, "0")}
                </span>
              </div>
              <ol className="mt-8 border-t border-line/10">
                {RUFFIER_TIMELINE.map((s) => (
                  <li key={s.label} className="grid grid-cols-[48px_1fr_auto] items-baseline gap-4 border-b border-line/10 py-4">
                    <span className={clsx("digits text-[26px] leading-none", s.count ? "text-pulse" : "text-chalk")}>{s.label === "·" ? "—" : s.label}</span>
                    <span className="text-[15px] leading-snug text-chalk/90">{s.text}</span>
                    <span className="text-[13px] text-dust">
                      <span className="digits text-[20px] text-chalk">{s.sec}</span> с
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-[14.5px] leading-relaxed text-dust">
                Каждый замер длится 15 секунд, в формулу идёт число ударов, умноженное на четыре: так получаются удары в минуту.
              </p>
            </figure>
          </Reveal>
        </div>
      </section>

      <section id="test" aria-labelledby="test-title" className="container-page scroll-mt-24 pb-20 md:pb-28">
        <Reveal className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-12">
          <h2 id="test-title" className="display text-d-2 stretch-normal">
            Пройти пробу
          </h2>
          <p className="max-w-md text-[15.5px] leading-relaxed text-dust">
            Таймер и метроном на экране. Звук включается по желанию: короткий сигнал на старте и в конце каждого замера и на каждое приседание.
          </p>
        </Reveal>
        <RuffierTest />
      </section>

      <section id="grades" aria-labelledby="grades-title" className="rubber border-y border-line/10 py-20 md:py-28">
        <div className="container-page grid gap-14 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-4">Как читать результат</p>
            <h2 id="grades-title" className="display text-d-2 stretch-narrow">
              Чем меньше,{" "}
              <br />
              тем лучше
            </h2>
            <p className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-dust">
              Пример: за 15 секунд насчитали 16, 30 и 21 удар. В минуту это 64, 120 и 84, а индекс{" "}
              <span className="digits whitespace-nowrap text-[20px] text-chalk">(64 + 120 + 84 − 200) / 10 = 6,8</span>, то есть удовлетворительно.
            </p>
            <RuffierScale className="mt-10 max-w-md" />
          </Reveal>
          <ol className="border-t border-line/10">
            {RUFFIER_GRADES.map((g, i) => (
              <Reveal as="li" key={g.label} delay={i * 0.05} className="grid gap-x-6 gap-y-2 border-b border-line/10 py-7 sm:grid-cols-[150px_1fr] md:py-9">
                <span className="digits text-[34px] leading-none text-chalk md:text-[42px]">{RUFFIER_RANGES[i]}</span>
                <span>
                  <span className={clsx("display block text-d-4", i === 0 ? "stretch-wide" : "stretch-normal")}>{g.label}</span>
                  <span className="mt-2 block max-w-lg text-[15.5px] leading-relaxed text-dust">{g.note}</span>
                </span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="next-title" className="container-page py-20 md:py-28">
        <Reveal className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
          <h2 id="next-title" className="display text-d-2 stretch-wide">
            Пульс есть.{" "}
            <br />
            <span className="text-pulse">Теперь неделя</span>
          </h2>
          <div>
            <p className="max-w-md text-[16.5px] leading-relaxed text-dust">
              Программа разложит неделю по зонам, посчитанным от вашего P1, и подберёт настоящие занятия ближайших 7 дней, где есть свободные места.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Link href="/program#builder" className="btn-primary">
                Собрать программу
              </Link>
              <ArrowLink href="/trial">Бесплатная пробная тренировка</ArrowLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
