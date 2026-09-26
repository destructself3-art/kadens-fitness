import type { Metadata } from "next";
import Link from "next/link";
import { GOALS } from "@/data/goals";
import { getArticle } from "@/data/journal";
import { BeatWord } from "@/components/pulse/Beat";
import { Breadcrumbs, SectionHeading } from "@/components/ui/Kit";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { Accuracy } from "@/components/zones/Accuracy";
import { FormulaLive } from "@/components/zones/FormulaLive";
import { GoalMix } from "@/components/zones/GoalMix";
import { PersonalZones } from "@/components/zones/PersonalZones";
import { ZoneBands } from "@/components/zones/ZoneBands";
import { ZoneStair } from "@/components/zones/ZoneStair";

export const metadata: Metadata = {
  title: "Пять зон пульса",
  description:
    "Как «Каденс» считает пульсовые зоны: формула Танаки и метод Карвонена с вашими цифрами, что тренирует каждая зона, какие занятия в ней проходят и сколько времени в неделю проводить в каждой зоне под вашу цель.",
};

const MEASURE_STEPS = [
  "Посидите спокойно пять минут. Лучше утром, до кофе.",
  "Два пальца на шею под челюстью, мягко и с одной стороны.",
  "Нажимайте «Тап» в такт ударам около десяти секунд. Остановитесь, и сайт зафиксирует результат.",
];

const READ_MORE = ["pulse-zones-explained", "measure-resting-heart-rate"] as const;

export default function ZonesPage() {
  const goals = GOALS.map(({ slug, title, short, zoneMix }) => ({ slug, title, short, zoneMix }));
  const articles = READ_MORE.map((slug) => getArticle(slug)).filter((a) => a !== undefined);

  return (
    <>
      {/* Hero: the title beats, the stair shows the five ranges at once */}
      <header className="relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40">
        <div className="container-page">
          <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Пульсовые зоны" }]} className="mb-8" />
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-7">
              <p className="eyebrow mb-4">Пульсовые зоны · метод Карвонена</p>
              <h1 className="display stretch-narrow text-d-1">
                Пять зон{" "}
                <BeatWord className="block text-pulse" base={58} amp={26}>
                  пульса
                </BeatWord>
              </h1>
            </Reveal>
            <Reveal className="lg:col-span-5" delay={0.1}>
              <p className="max-w-xl text-[17px] leading-relaxed text-dust md:text-[19px]">
                Каждое занятие в «Каденсе» построено вокруг одной из пяти зон. Зона — это не «легко» или «тяжело», а конкретные удары в минуту, свои у каждого
                человека. Ниже они уже посчитаны для вас.
              </p>
            </Reveal>
          </div>
          <div className="mt-14 md:mt-20">
            <ZoneStair />
          </div>
        </div>
      </header>

      {/* Personal block */}
      <section aria-labelledby="mine" className="container-page pb-24 md:pb-32">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-10">
          <div className="lg:col-span-4 lg:row-start-1">
            <Reveal>
              <p className="eyebrow mb-4">Ваши цифры</p>
              <h2 id="mine" className="display stretch-normal text-d-3">
                Сначала пульс покоя
              </h2>
              <p className="mt-5 text-[16.5px] leading-relaxed text-dust">
                От него и от возраста считаются все пять зон. Замер займёт десять секунд, а результат сохранится в браузере: расписание и программа покажут занятия уже в
                ваших ударах.
              </p>
              <ol className="mt-8 grid gap-4">
                {MEASURE_STEPS.map((step, i) => (
                  <li key={step} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 text-[15px] leading-relaxed text-chalk/90">
                    <span className="digits text-[26px] leading-none text-pulse">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
          {/* The panel stays in view while the steps and the photo scroll past it */}
          <div className="lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1">
            <Reveal className="lg:sticky lg:top-28" delay={0.05}>
              <PersonalZones />
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-4 lg:row-start-2">
            <MediaFrame
              shot="pulse-check"
              alt="Два пальца прижаты к шее под челюстью: так считают пульс"
              sizes="(min-width: 1100px) 30vw, 92vw"
              className="aspect-[4/3] rounded-card"
            />
          </Reveal>
        </div>
      </section>

      {/* Formula with live numbers */}
      <section aria-labelledby="formula" className="container-page pb-24 md:pb-32">
        <div className="grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow mb-4">Формула с вашими цифрами</p>
            <h2 id="formula" className="display stretch-narrow text-d-2">
              Как мы считаем
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-5 lg:col-start-8 lg:self-end" delay={0.1}>
            <p className="text-[17px] leading-relaxed text-dust">
              Две формулы, которыми пользуются спортивные физиологи. Подчёркнутые цифры — ваши: поменяйте возраст или перемерьте пульс, и расчёт пересчитается на
              глазах.
            </p>
          </Reveal>
        </div>
        <div className="mt-12">
          <FormulaLive />
        </div>
      </section>

      {/* One band per zone */}
      <section aria-labelledby="bands" className="container-page pb-24 md:pb-32">
        <SectionHeading
          eyebrow="От разминки до максимума"
          title={<span id="bands">Что тренирует каждая зона</span>}
          stretch="narrow"
          lead="Как понять, что вы в зоне, без часов: по дыханию и речи. И какие занятия клуба построены вокруг каждой из пяти."
          className="mb-12"
        />
        <ZoneBands />
      </section>

      {/* Weekly mix per goal */}
      <section aria-labelledby="mix" className="border-y border-line/10 bg-graphite/40 py-24 md:py-32">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-12">
            <Reveal className="lg:col-span-6">
              <p className="eyebrow mb-4">Неделя под цель</p>
              <h2 id="mix" className="display stretch-narrow text-d-2">
                Сколько времени в какой зоне
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-5 lg:col-start-8 lg:self-end" delay={0.1}>
              <p className="text-[17px] leading-relaxed text-dust">
                По этим пропорциям конструктор программы раскладывает занятия на неделю. Почти при любой цели основа — вторая зона, а пятой нужно совсем немного.
              </p>
            </Reveal>
          </div>
          <Reveal className="mt-12">
            <GoalMix goals={goals} />
          </Reveal>
        </div>
      </section>

      {/* Accuracy */}
      <section aria-labelledby="accuracy" className="container-page py-24 md:py-32">
        <SectionHeading
          eyebrow="Честно о погрешности"
          title={<span id="accuracy">Насколько точны цифры</span>}
          stretch="narrow"
          lead="Любая формула описывает среднего человека: реальный максимум может отличаться от расчётного на 10–12 ударов в любую сторону. Поэтому цифры — ориентир, а проверка — ощущения."
          className="mb-14"
        />
        <Accuracy />
      </section>

      {/* CTA */}
      <section aria-labelledby="next" className="rubber border-t border-line/10">
        <div className="container-page grid gap-12 py-24 md:py-32 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow mb-4">Дальше</p>
            <h2 id="next" className="display stretch-narrow text-d-2">
              Зоны есть. Осталось собрать неделю
            </h2>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-dust">
              Конструктор возьмёт ваши зоны, цель и удобное время и соберёт неделю из реальных занятий расписания. Записаться можно сразу на все.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <MagneticButton href="/program">Собрать программу</MagneticButton>
              <Link href="/program/ruffier" className="btn-ghost">
                Пройти пробу Руфье
              </Link>
            </div>
            <p className="mt-5 max-w-lg text-[14px] text-dust">
              Проба Руфье — 30 приседаний за 45 секунд и три замера пульса. Покажет, как сердце отвечает на нагрузку и как быстро восстанавливается.
            </p>
          </Reveal>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
            <p className="eyebrow">Почитать в журнале</p>
            <ul className="mt-4 border-t border-line/10">
              {articles.map((a) => (
                <li key={a.slug} className="border-b border-line/10">
                  <Link href={`/journal/${a.slug}`} className="group block py-5">
                    <span className="block text-[17px] font-semibold leading-snug text-chalk">
                      <span className="link-underline">{a.title}</span>
                    </span>
                    <span className="mt-1 block text-[13px] text-dust">
                      <span className="digits text-[16px]">{a.readMinutes}</span> мин чтения
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
