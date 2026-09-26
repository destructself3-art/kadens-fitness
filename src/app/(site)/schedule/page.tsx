import type { Metadata } from "next";
import Link from "next/link";
import { BeatDot, BeatWord } from "@/components/pulse/Beat";
import { parseBoardState } from "@/components/schedule/board-state";
import { ScheduleBoard } from "@/components/schedule/ScheduleBoard";
import { Breadcrumbs } from "@/components/ui/Kit";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { SPACES } from "@/data/spaces";
import { BOOKING, CLUB } from "@/lib/club";
import { num, plural } from "@/lib/format";
import { getWeekSessions } from "@/lib/schedule";
import { addDays, dateKeyOf, formatDay, isDateKey, weekDays, weekRangeLabel, weekStartOf } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Расписание",
  description:
    "Расписание групповых занятий «Каденса» в Казани на неделю: сайкл, бокс, HIIT, йога, пилатес на реформерах, бассейн. Фильтры по студии, тренеру и пульсовой зоне, запись онлайн за 7 дней и лист ожидания.",
};

type SearchParams = Record<string, string | string[] | undefined>;

const RULES = [
  {
    value: String(BOOKING.daysAhead),
    unit: plural(BOOKING.daysAhead, "день", "дня", "дней"),
    title: "вперёд открыта запись",
    text: "Каждую полночь в расписании открывается ещё один день. Вечерний сайкл и реформеры разбирают в первые часы.",
  },
  {
    value: String(BOOKING.closesBeforeMin),
    unit: "минут",
    title: "до начала запись закрывается",
    text: "Опоздали с записью? Подходите на ресепшен: если место свободно, вас впустят.",
  },
  {
    value: String(BOOKING.cancelBeforeMin / 60),
    unit: plural(BOOKING.cancelBeforeMin / 60, "час", "часа", "часов"),
    title: "до начала можно отменить онлайн",
    text: "Нужны код записи и четыре последние цифры телефона. Позже отменить можно только звонком на ресепшен.",
  },
  {
    value: "1",
    unit: "запись",
    title: "на одного человека в одно занятие",
    text: "Мест нет — вставайте в лист ожидания. Освободившееся место уходит первому в очереди автоматически.",
  },
];

export default async function SchedulePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const get = (key: string) => {
    const v = sp[key];
    return (Array.isArray(v) ? v[0] : v) ?? null;
  };

  const now = new Date();
  const today = dateKeyOf(now);
  const currentWeek = weekStartOf(today);
  const allowed = [addDays(currentWeek, -7), currentWeek, addDays(currentWeek, 7)];
  const asked = get("week");
  const askedWeek = asked && isDateKey(asked) ? weekStartOf(asked) : null;
  const week = askedWeek && allowed.includes(askedWeek) ? askedWeek : currentWeek;
  const index = allowed.indexOf(week);

  const sessions = await getWeekSessions(week, {}, now);
  const days = weekDays(week);
  const defaultDay = days.includes(today) ? today : week;
  const initial = parseBoardState(get, sessions, days, defaultDay);
  const studioOrder = SPACES.filter((s) => s.capacity).map((s) => ({ slug: s.slug, name: s.name }));

  const held = sessions.filter((s) => s.status === "scheduled");
  const upcoming = held.filter((s) => !s.started);
  const freePlaces = upcoming.reduce((sum, s) => sum + s.left, 0);
  const takenPlaces = held.reduce((sum, s) => sum + s.taken, 0);
  const coaches = new Set(held.map((s) => s.coachSlug)).size;
  const live = held.filter((s) => s.live);

  const past = week < currentWeek;
  const lastOpenDay = addDays(today, BOOKING.daysAhead - 1);
  const partlyClosed = !past && addDays(week, 6) > lastOpenDay;
  const weekName = past ? "Прошлая неделя" : week === currentWeek ? "Эта неделя" : "Следующая неделя";

  const stats = [
    { value: num(held.length), label: `${plural(held.length, "занятие", "занятия", "занятий")} на неделе` },
    past
      ? { value: num(takenPlaces), label: `${plural(takenPlaces, "место было занято", "места было занято", "мест было занято")}` }
      : { value: num(freePlaces), label: `${plural(freePlaces, "свободное место", "свободных места", "свободных мест")} на предстоящих занятиях` },
    { value: String(coaches), label: `${plural(coaches, "тренер ведёт", "тренера ведут", "тренеров ведут")} группы` },
  ];

  return (
    <>
      <header className="relative isolate overflow-hidden pb-12 pt-32 md:pb-16 md:pt-40">
        <div className="ecg-grid absolute inset-0 -z-10 opacity-70 [mask-image:linear-gradient(to_bottom,black_10%,transparent_85%)]" aria-hidden />
        <div className="container-page">
          <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Расписание" }]} className="mb-8" />
          {/* The word runs the full width; the lead and the week in numbers share the line below it. */}
          <Reveal>
            <p className="eyebrow mb-4">
              {weekName} · <span className="tabular">{weekRangeLabel(week)}</span>
            </p>
            <h1 className="display text-d-1 stretch-narrow">Расписание</h1>
          </Reveal>
          <div className="mt-8 grid gap-10 md:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-end lg:gap-16">
            <Reveal delay={0.05}>
              <p className="max-w-2xl text-[17px] leading-relaxed text-dust md:text-[19px]">
                {past
                  ? "Запись на прошлую неделю закрыта, но видно, кто что вёл и насколько были заполнены залы. Та же сетка повторяется каждую неделю."
                  : `Все групповые занятия в шести студиях, бассейне и зонах клуба. Запись открывается за ${BOOKING.daysAhead} дней и закрывается за ${BOOKING.closesBeforeMin} минут до начала. У каждого класса своя пульсовая зона, а рядом — ваши цифры.`}
              </p>
              {partlyClosed && (
                <p className="mt-4 max-w-2xl text-[14.5px] text-dust">
                  Сейчас открыта запись по {formatDay(lastOpenDay).dayMonth} включительно. Остальные дни недели откроются позже, по одному в сутки.
                </p>
              )}
              {live.length > 0 && (
                <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-pulse/40 bg-pulse/10 px-4 py-2 text-[14px] text-chalk">
                  <BeatDot className="h-2 w-2 text-pulse" />
                  Сейчас идёт <span className="digits text-[19px] leading-none">{live.length}</span> {plural(live.length, "занятие", "занятия", "занятий")}
                </p>
              )}
            </Reveal>

            <Reveal delay={0.1}>
              <dl className="grid grid-cols-3 gap-4 border-t border-line/15 pt-6 sm:gap-8">
                {stats.map((s) => (
                  <div key={s.label} className="min-w-0">
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <span className="digits block text-[44px] leading-[0.85] text-chalk sm:text-[64px] lg:text-[76px]">{s.value}</span>
                      <span className="mt-2 block text-[12.5px] leading-snug text-dust sm:text-[14px]" aria-hidden>
                        {s.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </header>

      <div className="container-page pb-24 md:pb-32">
        <ScheduleBoard
          key={week}
          sessions={sessions}
          week={week}
          days={days}
          today={today}
          defaultDay={defaultDay}
          currentWeek={currentWeek}
          prevWeek={index > 0 ? allowed[index - 1] : null}
          nextWeek={index < allowed.length - 1 ? allowed[index + 1] : null}
          studioOrder={studioOrder}
          initial={initial}
          serverNow={now.getTime()}
        />
      </div>

      {/* Booking rules as four numbers on cardiogram paper */}
      <section aria-labelledby="rules-title" className="relative isolate overflow-hidden border-y border-line/10 py-20 md:py-28">
        <div className="ecg-grid absolute inset-0 -z-10 opacity-50" aria-hidden />
        <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-4">Как устроена запись</p>
            <h2 id="rules-title" className="display text-d-2 stretch-wide">
              Четыре цифры
            </h2>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-dust">
              Правила одинаковые для всех занятий, и запись следит за ними сама: лишнего места не выдаст, второй раз на один класс не запишет.
            </p>
            <Link href="/booking" className="btn-ghost mt-8">
              Найти мою запись
            </Link>
          </Reveal>
          <ol className="grid gap-px overflow-hidden rounded-card border border-line/10 bg-line/10 sm:grid-cols-2">
            {RULES.map((r, i) => (
              <Reveal as="li" key={r.title} delay={i * 0.06} className="flex flex-col bg-asphalt p-6 md:p-8">
                <p className="flex items-baseline gap-2">
                  <span className="digits text-[96px] leading-[0.8] text-chalk md:text-[120px]">{r.value}</span>
                  <span className="text-[15px] font-semibold text-pulse">{r.unit}</span>
                </p>
                <p className="mt-4 text-[17px] font-semibold leading-snug text-chalk">{r.title}</p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-dust">{r.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* First visit */}
      <section aria-labelledby="trial-title" className="container-page py-20 md:py-28">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-16">
          <Reveal>
            <p className="eyebrow mb-4">Первый раз в «{CLUB.name}е»</p>
            <h2 id="trial-title" className="display text-d-2 stretch-normal">
              Начните с <BeatWord base={62} amp={26}>пульса</BeatWord>, а не с&nbsp;записи
            </h2>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-dust">
              Пробная тренировка бесплатная. Тренер измерит пульс покоя, проведёт короткий тест и покажет ваши пять зон. После неё понятно, с каких
              классов начинать и где в расписании ваша зона.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/trial" className="btn-primary">
                Записаться на пробную
              </Link>
              <Link href="/zones" className="btn-ghost">
                Что такое пульсовые зоны
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <MediaFrame
              shot="pulse-check"
              alt="Два пальца на сонной артерии: человек считает свой пульс"
              sizes="(min-width: 820px) 38vw, 92vw"
              className="aspect-[4/5] rounded-card"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
