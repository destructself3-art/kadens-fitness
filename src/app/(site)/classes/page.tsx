import type { Metadata } from "next";
import Link from "next/link";
import { CLASSES } from "@/data/classes";
import { GOALS } from "@/data/goals";
import { SPACES } from "@/data/spaces";
import { ClassExplorer, type ExplorerItem } from "@/components/classes/ClassExplorer";
import type { FilterOptions } from "@/components/classes/filters";
import { roomName } from "@/components/classes/helpers";
import { PulseNote } from "@/components/classes/PulseNote";
import { ZoneMap } from "@/components/classes/ZoneMap";
import { BeatWord } from "@/components/pulse/Beat";
import { EcgMonitor } from "@/components/pulse/EcgMonitor";
import { ClassCard } from "@/components/ui/Cards";
import { Breadcrumbs, SectionHeading } from "@/components/ui/Kit";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { BOOKING } from "@/lib/club";
import { plural } from "@/lib/format";
import { LEVEL_LABELS, type ProgramLevel } from "@/lib/program";

// Filters live in the URL: render the filtered grid on the server, so a shared link opens without a flash.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Направления: 14 классов по пульсовым зонам",
  description:
    "Сайкл, бокс, HIIT, йога, пилатес на реформерах, бассейн и ещё восемь классов «Каденса». У каждого своя кривая пульса: выбирайте по зоне, цели, залу и опыту.",
};

export default function ClassesPage() {
  const studiosInUse = SPACES.filter((s) => CLASSES.some((c) => c.studio === s.slug));
  const minutes = CLASSES.map((c) => c.durationMin);
  const options: FilterOptions = {
    goals: GOALS.map((g) => ({ value: g.slug, label: g.title })),
    studios: studiosInUse.map((s) => ({ value: s.slug, label: roomName(s) })),
    levels: (Object.keys(LEVEL_LABELS) as ProgramLevel[]).map((l) => ({ value: l, label: LEVEL_LABELS[l] })),
  };
  const items: ExplorerItem[] = CLASSES.map((c) => ({
    slug: c.slug,
    zone: c.zone,
    goals: c.goals,
    studio: c.studio,
    level: c.level,
    card: <ClassCard cls={c} />,
  }));

  return (
    <>
      {/* ---------- Hero ---------- */}
      <header className="relative isolate overflow-hidden pb-16 pt-32 md:pb-20 md:pt-40">
        <div className="ecg-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_20%,transparent_95%)]" aria-hidden />
        <div className="container-page">
          <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Направления" }]} className="mb-8" />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <Reveal>
              <p className="eyebrow mb-5">
                Направления · {CLASSES.length} {plural(CLASSES.length, "класс", "класса", "классов")}
              </p>
              <h1 className="display text-d-1 stretch-narrow">
                Классы
                <br />
                по{" "}
                <BeatWord base={56} amp={26} className="text-pulse">
                  пульсу
                </BeatWord>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-xl text-[17px] leading-relaxed text-dust md:text-[19px]">
                От йоги, где пульс чуть выше покоя, до HIIT, где говорить уже не получается. У каждого класса своя кривая: где разогреваемся, где
                работаем, где отпускаем. Выбирайте по цели, по залу или по тому, насколько тяжело хотите сегодня.
              </p>
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line/10 pt-6">
                <div>
                  <dt className="sr-only">Классов</dt>
                  <dd className="digits whitespace-nowrap text-[44px] leading-[0.85] text-chalk sm:text-[52px] md:text-[64px]">{CLASSES.length}</dd>
                  <dd className="mt-2 text-[13.5px] text-dust">{plural(CLASSES.length, "класс", "класса", "классов")} в расписании</dd>
                </div>
                <div>
                  <dt className="sr-only">Залов</dt>
                  <dd className="digits whitespace-nowrap text-[44px] leading-[0.85] text-chalk sm:text-[52px] md:text-[64px]">{studiosInUse.length}</dd>
                  <dd className="mt-2 text-[13.5px] text-dust">{plural(studiosInUse.length, "зал", "зала", "залов")}, от «Тишины» до бассейна</dd>
                </div>
                <div>
                  <dt className="sr-only">Длительность</dt>
                  <dd className="digits whitespace-nowrap text-[44px] leading-[0.85] text-chalk sm:text-[52px] md:text-[64px]">
                    {Math.min(...minutes)}–{Math.max(...minutes)}
                  </dd>
                  <dd className="mt-2 text-[13.5px] text-dust">минут длится класс</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </header>

      {/* ---------- Zone map ---------- */}
      <section className="container-page mt-6 md:mt-10" aria-labelledby="zone-map-title">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
          <Reveal>
            <p className="eyebrow mb-4">Карта интенсивности</p>
            <h2 id="zone-map-title" className="display text-d-2 stretch-narrow">
              Пять ступеней пульса
            </h2>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-dust">
              Каждый класс построен вокруг одной зоны. В первой спокойно разговаривают, в пятой не хватает дыхания на слово. Под номером зоны
              ваш диапазон в ударах в минуту.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <PulseNote className="max-w-md lg:ml-auto" />
          </Reveal>
        </div>
        <ZoneMap classes={CLASSES} className="mt-12 md:mt-16" />
      </section>

      {/* ---------- Catalogue with filters ---------- */}
      <section id="list" className="container-page mt-24 scroll-mt-24 md:mt-36" aria-labelledby="list-title">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SectionHeading eyebrow="Все направления" title={<span id="list-title">Найдите свой класс</span>} stretch="narrow" />
          <Reveal className="max-w-sm text-[15px] text-dust lg:text-right">
            Запись на любой класс открывается за <span className="digits text-[18px] text-chalk">{BOOKING.daysAhead}</span>{" "}
            {plural(BOOKING.daysAhead, "день", "дня", "дней")} и закрывается за{" "}
            <span className="digits text-[18px] text-chalk">{BOOKING.closesBeforeMin}</span> минут до начала.
          </Reveal>
        </div>
        <div className="mt-10">
          <ClassExplorer items={items} options={options} />
        </div>
      </section>

      {/* ---------- Where to start ---------- */}
      <section className="container-page mt-28 md:mt-36" aria-labelledby="start-title">
        <Reveal className="relative isolate overflow-hidden rounded-card border border-line/10 bg-graphite">
          <EcgMonitor className="absolute inset-x-0 bottom-0 -z-10 h-40 w-full opacity-35" grid={false} />
          <div className="grid gap-12 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:p-14">
            <div>
              <p className="eyebrow mb-4">Первый раз в «Каденсе»</p>
              <h2 id="start-title" className="display text-d-2 stretch-narrow">
                Не знаете, с чего начать?
              </h2>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-dust">
                Приходите на пробную тренировку, она бесплатная. Тренер проведёт пульс-тест, посчитает ваши зоны и подскажет, какие классы подойдут
                для старта.
              </p>
              <MagneticButton href="/trial" className="mt-8">
                Записаться на пробную
              </MagneticButton>
            </div>
            <ul className="grid content-end gap-3">
              {[
                { href: "/program", title: "Программа под пульс", text: "Цель, опыт и удобное время: соберём неделю из реальных классов расписания в ваших зонах." },
                { href: "/schedule", title: "Расписание на неделю", text: "Все классы по дням и залам, свободные места видны сразу." },
                { href: "/zones", title: "Что такое зоны пульса", text: "Почему во второй зоне главное топливо — жир, а пятая нужна не каждый день." },
              ].map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="group grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border border-line/10 bg-asphalt/60 px-5 py-4 transition-colors hover:border-line/35">
                    <span>
                      <span className="block font-display text-[20px] uppercase leading-tight text-chalk" style={{ fontVariationSettings: '"wdth" 72', fontWeight: 800 }}>
                        {r.title}
                      </span>
                      <span className="mt-1 block text-[14px] text-dust">{r.text}</span>
                    </span>
                    <span aria-hidden className="text-[22px] text-dust transition-transform duration-300 ease-silk group-hover:translate-x-1 group-hover:text-chalk">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>
    </>
  );
}
