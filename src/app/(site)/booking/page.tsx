import type { Metadata } from "next";
import Link from "next/link";
import { CardioBarcode } from "@/components/booking/CardioBarcode";
import { MyBookings } from "@/components/booking/MyBookings";
import { CODE_PATTERN, normalizeCode } from "@/components/booking/ticket-state";
import { BeatWord } from "@/components/pulse/Beat";
import { ArrowLink, Breadcrumbs } from "@/components/ui/Kit";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { BOOKING, CLUB } from "@/lib/club";
import { plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Мои записи",
  description:
    "Все ваши занятия в «Каденсе» по коду записи и последним цифрам телефона: время, студия, место или очередь в листе ожидания. Отменить онлайн можно не позже чем за 2 часа до начала.",
};

const SAMPLE_CODE = `${BOOKING.codePrefix}7K3M9Q`;
const cancelHours = BOOKING.cancelBeforeMin / 60;

const RULES = [
  {
    value: BOOKING.daysAhead,
    unit: plural(BOOKING.daysAhead, "день", "дня", "дней"),
    title: "Запись открывается",
    text: "Каждую полночь в расписании открывается ещё один день. Вечерние занятия разбирают быстрее всего.",
  },
  {
    value: BOOKING.closesBeforeMin,
    unit: plural(BOOKING.closesBeforeMin, "минута", "минуты", "минут"),
    title: "Запись закрывается",
    text: "За четверть часа до начала онлайн-запись закрывается. Дальше только через ресепшен, если есть место.",
  },
  {
    value: cancelHours,
    unit: plural(cancelHours, "час", "часа", "часов"),
    title: "Отмена онлайн",
    text: "Не позже чем за два часа до начала. Освободившееся место сразу уходит первому из листа ожидания.",
  },
  {
    value: 1,
    unit: "место",
    title: "На человека",
    text: "Один номер телефона — одна запись на занятие. Если мест нет, вы встаёте в лист ожидания.",
  },
];

export default async function MyBookingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const raw = typeof sp.code === "string" ? normalizeCode(sp.code) : "";
  const initialCode = CODE_PATTERN.test(raw) ? raw : "";

  return (
    <>
      <section className="relative isolate overflow-hidden pb-14 pt-32 md:pb-20 md:pt-40">
        <div aria-hidden className="rubber absolute inset-0 -z-10 opacity-80 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="container-page grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Мои записи" }]} className="mb-10" />
            <Reveal>
              <p className="eyebrow mb-5">Ваши занятия на неделю вперёд</p>
              <h1 className="display text-d-1 stretch-narrow">
                Мои{" "}
                <BeatWord base={56} amp={22} className="text-pulse">
                  записи
                </BeatWord>
              </h1>
              <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-dust md:text-[19px]">
                Код записи вы видели на странице подтверждения, он же есть в событии календаря. Введите его и последние четыре цифры телефона — и здесь
                появятся все ваши занятия: где вы записаны, где стоите в листе ожидания и что уже прошло.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="hidden lg:col-span-4 lg:block">
            <MediaFrame
              shot="detail-wristband"
              alt="Запястье с чёрным браслетом-пропуском клуба, рука в тейпе лежит на грифе штанги"
              sizes="(min-width: 1360px) 420px, (min-width: 1100px) 30vw, 1px"
              className="aspect-[4/5] rounded-card border border-line/10"
            />
          </Reveal>
        </div>
      </section>

      <section aria-label="Поиск записей" className="container-page pb-24 md:pb-32">
        <MyBookings
          initialCode={initialCode}
          aside={
            <Reveal className="grid gap-6 rounded-card border border-line/10 p-5 sm:p-7">
              <h2 className="display text-d-4 stretch-normal">Где взять код</h2>
              <div aria-hidden className="relative overflow-hidden rounded-2xl border border-dashed border-line/25 bg-graphite p-5">
                <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-line/15 bg-asphalt" />
                <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-line/15 bg-asphalt" />
                <p className="eyebrow">Код записи</p>
                <p className="digits mt-1 text-[44px] leading-none text-chalk">{SAMPLE_CODE}</p>
                <CardioBarcode code={SAMPLE_CODE} className="mt-4 h-10 w-full opacity-80" />
              </div>
              <ol className="grid gap-5">
                {[
                  { title: "На странице подтверждения", text: "Сразу после записи: крупно на корешке билета, под кодом — кардиограмма-штрихкод." },
                  { title: "В событии календаря", text: "Если нажимали «Добавить в календарь», код записан в описании события." },
                  {
                    title: "Потеряли код",
                    text: (
                      <>
                        Позвоните на ресепшен{" "}
                        <a href={CLUB.phoneHref} className="link-underline digits whitespace-nowrap text-[18px] text-chalk">
                          {CLUB.phone}
                        </a>
                        : администратор найдёт запись по номеру телефона.
                      </>
                    ),
                  },
                ].map((item, i) => (
                  <li key={item.title} className="grid grid-cols-[36px_1fr] gap-3">
                    <span className="digits text-[28px] leading-none text-pulse">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block text-[15.5px] font-semibold text-chalk">{item.title}</span>
                      <span className="mt-1 block text-[14.5px] leading-relaxed text-dust">{item.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Reveal>
          }
        />
      </section>

      <section aria-labelledby="rules-title" className="relative isolate border-y border-line/10 py-20 md:py-28">
        <div aria-hidden className="ecg-grid absolute inset-0 -z-10 opacity-60" />
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow mb-4">Правила записи</p>
            <h2 id="rules-title" className="display text-d-2 stretch-narrow">
              Четыре цифры, которые стоит помнить
            </h2>
          </Reveal>
          <ol className="grid gap-px overflow-hidden rounded-card border border-line/10 bg-line/10 sm:grid-cols-2 lg:col-span-8">
            {RULES.map((rule, i) => (
              <Reveal as="li" key={rule.title} delay={i * 0.06} className="grid content-start gap-3 bg-asphalt p-6 sm:p-8">
                <p className="flex items-baseline gap-3">
                  <span className="digits text-[88px] leading-[0.8] text-chalk">{rule.value}</span>
                  <span className="text-[15px] text-dust">{rule.unit}</span>
                </p>
                <p className="text-[17px] font-semibold text-chalk">{rule.title}</p>
                <p className="text-[14.5px] leading-relaxed text-dust">{rule.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page flex flex-wrap items-end justify-between gap-6 py-20 md:py-24">
        <Reveal className="max-w-2xl">
          <p className="display text-d-3 stretch-narrow">Ещё не были в клубе?</p>
          <p className="mt-4 text-[16px] leading-relaxed text-dust">
            Первое занятие бесплатно, с тренером и пульс-тестом: свои зоны вы узнаете ещё до того, как выберете абонемент.
          </p>
        </Reveal>
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/trial" className="btn-primary">
            Записаться на пробную
          </Link>
          <ArrowLink href="/schedule">Расписание на неделю</ArrowLink>
        </div>
      </section>
    </>
  );
}
