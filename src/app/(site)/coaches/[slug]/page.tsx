import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { CoachStats } from "@/components/coaches/CoachStats";
import { HeartCompare } from "@/components/coaches/HeartCompare";
import { HoloCard } from "@/components/coaches/HoloCard";
import { UpcomingByDay } from "@/components/coaches/UpcomingByDay";
import {
  cardData,
  cardNumber,
  classTitles,
  findCoach,
  nameFit,
  relatedCoaches,
  teamHeadFirst,
  teamStatAverages,
} from "@/components/coaches/coach-utils";
import { ClassCurve } from "@/components/classes/ClassCurve";
import { PersonalRange } from "@/components/pulse/Zones";
import { ClassCard, ReviewCard } from "@/components/ui/Cards";
import { ArrowLink, Breadcrumbs, EmptyState, SectionHeading, ZoneBadge } from "@/components/ui/Kit";
import { LeadForm } from "@/components/ui/LeadForm";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { getClass } from "@/data/classes";
import { REVIEWS } from "@/data/reviews";
import type { Coach } from "@/data/types";
import { BOOKING, CLUB } from "@/lib/club";
import { num, plural } from "@/lib/format";
import { getPhoto } from "@/lib/photos";
import { getUpcoming } from "@/lib/schedule";
import type { SessionView } from "@/lib/session-types";
import { zoneMeta } from "@/lib/zones";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const pad2 = (n: number) => String(n).padStart(2, "0");

function describe(coach: Coach) {
  return `${coach.name}, ${coach.role.toLowerCase()} клуба «${CLUB.name}» в Казани. ${classTitles(coach).join(", ")}. Стаж ${coach.experienceYears} ${plural(coach.experienceYears, "год", "года", "лет")}, ближайшие занятия и запись${coach.personalPrice !== null ? ", персональные тренировки" : ""}.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const coach = findCoach(slug);
  if (!coach) return { title: "Тренер не найден", description: "Такого тренера в команде клуба нет. Вся команда на странице «Тренеры»." };
  const title = `${coach.name} — ${coach.role.toLowerCase()}`;
  const description = describe(coach);
  const photo = getPhoto(coach.photo);
  return {
    title,
    description,
    alternates: { canonical: `/coaches/${coach.slug}` },
    openGraph: {
      title,
      description,
      type: "profile",
      locale: "ru_RU",
      images: photo ? [{ url: photo.src, width: photo.width, height: photo.height, alt: `${coach.name} в контровом свете` }] : undefined,
    },
  };
}

export default async function CoachPage({ params }: Props) {
  const { slug } = await params;
  const coach = findCoach(slug);
  if (!coach) notFound();

  const now = new Date();
  let upcoming: SessionView[] = [];
  let scheduleFailed = false;
  try {
    upcoming = await getUpcoming({ coachSlug: coach.slug }, 8, BOOKING.daysAhead, now);
  } catch (error) {
    console.error(`[coaches/${coach.slug}] upcoming sessions failed`, error);
    scheduleFailed = true;
  }

  const z = zoneMeta(coach.zone);
  const [first, ...lastParts] = coach.name.split(" ");
  const classes = coach.classes.map(getClass);
  const reviews = REVIEWS.filter((r) => r.coach === coach.slug);
  const others = relatedCoaches(coach, 3).map((o) => {
    const shared = o.classes.filter((s) => coach.classes.includes(s)).map((s) => getClass(s).title);
    return {
      coach: o,
      reason: shared.length
        ? `Тоже ведёт: ${shared.join(", ")}`
        : o.zone === coach.zone
          ? `Та же зона: Z${o.zone} «${zoneMeta(o.zone).name}»`
          : `Ведёт: ${classTitles(o).join(", ")}`,
    };
  });
  const teamSize = teamHeadFirst().length;
  const longQuote = coach.quote.length > 70;
  const single = classes.length === 1 ? classes[0] : null;
  const titleFit = nameFit(coach.name);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: coach.name,
    jobTitle: coach.role,
    description: coach.bio[0],
    knowsAbout: coach.specialties,
    worksFor: { "@type": "SportsActivityLocation", name: `Фитнес-клуб «${CLUB.name}»`, address: `${CLUB.city}, ${CLUB.street}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* ---------- Split hero: portrait and the back of the card ---------- */}
      <section className="relative isolate overflow-hidden pb-16 pt-28 md:pb-24 md:pt-36">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-[90vh]"
          style={{ background: `radial-gradient(55% 60% at 18% 30%, ${z.color}24, transparent 70%)` }}
        />
        <div className="container-page">
          <Breadcrumbs items={[{ href: "/", label: "Главная" }, { href: "/coaches", label: "Тренеры" }, { label: coach.name }]} className="mb-8 md:mb-12" />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-x-16 lg:gap-y-10">
            <header className="lg:col-start-2 lg:row-start-1">
              <Reveal>
                <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>
                    Карточка <span className="digits text-[18px] tracking-normal text-chalk">№{pad2(cardNumber(coach))}</span> из{" "}
                    <span className="digits text-[18px] tracking-normal text-chalk">{teamSize}</span>
                  </span>
                  <span aria-hidden className="h-px w-8 bg-line/30" />
                  <span>{coach.role}</span>
                </p>
                <h1 className={clsx("display stretch-narrow mt-5", titleFit.className)} style={titleFit.style}>
                  <span className="block">{first}</span>
                  <span className="block">{lastParts.join(" ")}</span>
                </h1>
                <div className="mt-8 flex flex-wrap gap-3">
                  {coach.personalPrice !== null ? (
                    <>
                      <a href="#personal" className="btn-primary">
                        Записаться на персональную
                      </a>
                      <a href="#upcoming" className="btn-ghost">
                        Ближайшие занятия
                      </a>
                    </>
                  ) : (
                    <a href="#upcoming" className="btn-primary">
                      Записаться на занятие
                    </a>
                  )}
                </div>
              </Reveal>
            </header>

            <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
              <figure className="lg:sticky lg:top-28">
                <div className="relative overflow-hidden rounded-card border" style={{ borderColor: `${z.color}59`, boxShadow: `0 60px 140px -70px ${z.color}` }}>
                  <MediaFrame
                    shot={coach.photo}
                    alt={`${coach.name}, ${coach.role.toLowerCase()}: портрет в контровом свете`}
                    sizes="(min-width: 1100px) 40vw, 100vw"
                    priority
                    className="aspect-[3/4]"
                  />
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-asphalt/85 via-transparent to-transparent" />
                  <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
                    <span className="rounded-full bg-asphalt/75 px-3 py-1.5">
                      <ZoneBadge zone={coach.zone} />
                    </span>
                    <span className="digits text-[64px] leading-[0.8] text-chalk/90" aria-hidden>
                      {pad2(cardNumber(coach))}
                    </span>
                  </span>
                </div>
                <figcaption className="mt-3 max-w-md text-[13px] leading-snug text-dust">
                  Цвет контрового света — зона Z{z.id} «{z.name}»: в ней {first} обычно держит группу.
                </figcaption>
              </figure>
            </div>

            <div className="lg:col-start-2 lg:row-start-2">
              <Reveal delay={0.1}>
                <div className="card ecg-grid relative overflow-hidden p-5 sm:p-8" style={{ borderColor: `${z.color}40` }}>
                  <CoachStats coach={cardData(coach)} averages={teamStatAverages()} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line/10 bg-line/10">
                  <div className="col-span-2 bg-graphite p-5 sm:p-6">
                    <dt className="eyebrow">Пульс покоя</dt>
                    <dd className="mt-3">
                      <HeartCompare coachHr={coach.restingHr} color={z.color} />
                    </dd>
                  </div>
                  <div className="bg-graphite p-5 sm:p-6">
                    <dt className="eyebrow">В клубе с</dt>
                    <dd className="mt-2">
                      <span className="digits block text-[48px] leading-none text-chalk">{coach.since}</span>
                      <span className="mt-1 block text-[13px] text-dust">{coach.since === CLUB.openedYear ? "года открытия клуба" : "года"}</span>
                    </dd>
                  </div>
                  <div className="bg-graphite p-5 sm:p-6">
                    <dt className="eyebrow">Стаж</dt>
                    <dd className="mt-2">
                      <span className="digits block text-[48px] leading-none text-chalk">{coach.experienceYears}</span>
                      <span className="mt-1 block text-[13px] text-dust">{plural(coach.experienceYears, "год", "года", "лет")} тренерской работы</span>
                    </dd>
                  </div>
                  <div className="col-span-2 bg-graphite p-5 sm:p-6">
                    <dt className="eyebrow">Персональная тренировка</dt>
                    <dd className="mt-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                      {coach.personalPrice !== null ? (
                        <>
                          <span>
                            <span className="digits text-[48px] leading-none text-chalk">{num(coach.personalPrice)}</span>
                            <span className="ml-2 text-[14px] text-dust">₽ за занятие</span>
                          </span>
                          <a href="#personal" className="link-underline text-[14.5px] font-semibold text-chalk">
                            Оставить заявку
                          </a>
                        </>
                      ) : (
                        <span className="text-[16px] text-chalk">Не ведёт персональные тренировки</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- The quote ---------- */}
      <section className="relative isolate overflow-hidden border-y border-line/10 py-20 md:py-32">
        <div aria-hidden className="absolute inset-0 -z-10" style={{ background: `radial-gradient(50% 90% at 100% 50%, ${z.color}26, transparent 70%)` }} />
        <Reveal className="container-page">
          <figure className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)] md:gap-10">
            <span aria-hidden className="display stretch-wide text-[clamp(6rem,13vw,11rem)] leading-[0.75]" style={{ color: z.color }}>
              «
            </span>
            <div>
              <blockquote
                className={clsx(
                  "display stretch-narrow max-w-[24ch] leading-[0.95]",
                  longQuote ? "text-[clamp(2rem,4.8vw,4.6rem)]" : "text-[clamp(2.3rem,6vw,6rem)]",
                )}
              >
                <p>{coach.quote}</p>
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3 text-[15px] text-dust">
                <span aria-hidden className="h-px w-10 bg-line/30" />
                {coach.name}, {coach.role.toLowerCase()}
              </figcaption>
            </div>
          </figure>
        </Reveal>
      </section>

      {/* ---------- Bio, specialties, certifications ---------- */}
      <section className="container-page grid gap-14 py-20 md:py-28 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <SectionHeading eyebrow="Биография" title="О тренере" size="d-3" stretch="normal" />
          <div className="mt-10 grid gap-6">
            {coach.bio.map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p className={i === 0 ? "text-[19px] leading-relaxed text-chalk md:text-[21px]" : "text-[16.5px] leading-relaxed text-dust md:text-[17.5px]"}>{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>
        <aside className="grid content-start gap-12 lg:col-span-4 lg:col-start-9 lg:pt-3">
          <Reveal>
            <h2 className="eyebrow mb-4">Специализация</h2>
            <ol>
              {coach.specialties.map((s, i) => (
                <li key={s} className="flex gap-4 border-t border-line/10 py-3.5 last:border-b">
                  <span className="digits w-7 flex-none text-[20px] leading-6 text-dust">{pad2(i + 1)}</span>
                  <span className="text-[16px] leading-6 text-chalk">{s}</span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="eyebrow mb-4">Образование и сертификаты</h2>
            <ul className="grid gap-3">
              {coach.certifications.map((c) => (
                <li key={c} className="flex gap-3 text-[15px] leading-snug text-dust">
                  <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 flex-none rounded-full bg-line/40" />
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        </aside>
      </section>

      {/* ---------- Classes ---------- */}
      <section className="border-t border-line/10 py-20 md:py-28">
        <div className="container-page">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow={`${classes.length} ${plural(classes.length, "направление", "направления", "направлений")}`}
              title="Ведёт занятия"
              stretch="wide"
            />
            <ArrowLink href="/classes" className="min-h-[44px] md:mb-2">
              Все направления клуба
            </ArrowLink>
          </div>
          {single ? (
            <div className="grid gap-5 md:grid-cols-2">
              <Reveal>
                <ClassCard cls={single} className="h-full" sizes="(min-width: 820px) 45vw, 92vw" />
              </Reveal>
              <Reveal delay={0.08} className="card flex flex-col justify-between gap-8 p-6 sm:p-8">
                <div>
                  <p className="eyebrow">Пульс по ходу занятия</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-dust">
                    {single.durationMin} минут, большая часть в зоне Z{single.zone} «{zoneMeta(single.zone).name}». Для вас это{" "}
                    <PersonalRange zone={single.zone} className="text-[20px] text-chalk" withUnit />.
                  </p>
                </div>
                <ClassCurve structure={single.structure} height={180} />
              </Reveal>
            </div>
          ) : (
            <ul className={clsx("grid gap-5 sm:grid-cols-2", classes.length === 2 ? "" : "lg:grid-cols-3")}>
              {classes.map((c, i) => (
                <Reveal as="li" key={c.slug} delay={i * 0.06}>
                  <ClassCard cls={c} className="h-full" sizes={classes.length === 2 ? "(min-width: 560px) 45vw, 92vw" : undefined} />
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ---------- Upcoming sessions ---------- */}
      <section id="upcoming" className="scroll-mt-24 border-t border-line/10 py-20 md:py-28">
        <div className="container-page">
          <div className="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
            <SectionHeading eyebrow="Расписание" title="Ближайшие занятия" stretch="narrow" className="lg:col-span-7" />
            <Reveal delay={0.1} className="text-[15px] leading-relaxed text-dust lg:col-span-5">
              Запись открывается за <span className="digits text-[18px] text-chalk">{BOOKING.daysAhead}</span>{" "}
              {plural(BOOKING.daysAhead, "день", "дня", "дней")} и закрывается за{" "}
              <span className="digits text-[18px] text-chalk">{BOOKING.closesBeforeMin}</span> минут до начала. Если мест нет, встаньте в лист ожидания: освободившееся место достанется первому в
              очереди автоматически.
            </Reveal>
          </div>
          {upcoming.length > 0 ? (
            <UpcomingByDay sessions={upcoming} now={now} />
          ) : (
            <EmptyState
              title={scheduleFailed ? "Расписание не загрузилось" : "Пока без групповых занятий"}
              text={
                scheduleFailed
                  ? "Обновите страницу через минуту или откройте расписание целиком."
                  : `В ближайшие ${BOOKING.daysAhead} ${plural(BOOKING.daysAhead, "день", "дня", "дней")} занятий этого тренера в расписании нет. Те же направления ведут другие тренеры команды.`
              }
              action={<ArrowLink href="/schedule" className="min-h-[44px]">Открыть расписание</ArrowLink>}
            />
          )}
          {upcoming.length > 0 && (
            <div className="mt-10">
              <ArrowLink href={`/schedule?coach=${coach.slug}`} className="min-h-[44px]">Всё расписание тренера на неделю</ArrowLink>
            </div>
          )}
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      {reviews.length > 0 && (
        <section className="border-t border-line/10 py-20 md:py-28">
          <div className="container-page grid gap-10 lg:grid-cols-12">
            <SectionHeading
              eyebrow="Отзывы"
              title="Цифры клиентов"
              size="d-3"
              stretch="narrow"
              lead="Одна честная цифра в каждом отзыве: было и стало."
              className="lg:col-span-4"
            />
            <ul className={clsx("grid gap-5 lg:col-span-8", reviews.length > 1 && "md:grid-cols-2")}>
              {reviews.map((r, i) => (
                <Reveal as="li" key={r.id} delay={i * 0.08}>
                  <ReviewCard review={r} className={clsx(reviews.length === 1 && "max-w-2xl")} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- Personal training ---------- */}
      <section id="personal" className="scroll-mt-24 border-t border-line/10 py-20 md:py-28">
        {coach.personalPrice !== null ? (
          <div className="container-page grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeading eyebrow="Один на один" title="Персональная тренировка" size="d-3" stretch="narrow" />
              <Reveal delay={0.05}>
                <p className="mt-8 flex flex-wrap items-baseline gap-x-3">
                  <span className="digits text-[88px] leading-[0.8] text-chalk">{num(coach.personalPrice)}</span>
                  <span className="text-[15px] text-dust">₽ за занятие</span>
                </p>
                <ol className="mt-10 grid gap-6">
                  {[
                    ["Заявка", "Оставьте телефон и пару слов о цели. Администратор перезвонит в течение часа в рабочее время клуба и согласует время с тренером."],
                    ["Пульс", "Если вы уже измерили пульс на сайте, приложим его к заявке, и тренер заранее посчитает ваши зоны."],
                    ["Работа по цифрам", `Каждое занятие строится вокруг ваших зон, а не средней нормы: ${first} следит за пульсом, вы — за техникой.`],
                  ].map(([title, text], i) => (
                    <li key={title} className="grid grid-cols-[40px_minmax(0,1fr)] gap-3">
                      <span className="digits text-[26px] leading-7 text-pulse">{pad2(i + 1)}</span>
                      <span>
                        <span className="block text-[16px] font-semibold text-chalk">{title}</span>
                        <span className="mt-1 block text-[15px] leading-relaxed text-dust">{text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
            <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7">
              <div className="card p-5 sm:p-8">
                <h3 className="display stretch-normal text-d-4">Заявка на персональную</h3>
                <p className="mb-7 mt-2 text-[14.5px] text-dust">Тренер: {coach.name}</p>
                <LeadForm
                  kind="trial"
                  plan={coach.slug}
                  attachPulse
                  fields={["comment"]}
                  submitLabel="Записаться на персональную"
                  commentLabel="Цель и удобное время"
                  commentPlaceholder="Чего хотите добиться и когда удобно заниматься. Например: вернуться в форму после перерыва, по будням после 19:00"
                  successText="Администратор перезвонит в течение часа в рабочее время клуба и согласует с вами время первой тренировки."
                />
              </div>
            </Reveal>
          </div>
        ) : (
          <div className="container-page">
            <Reveal className="card relative grid gap-10 overflow-hidden p-7 sm:p-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-end md:p-14">
              <div>
                <p className="eyebrow">Персональные тренировки</p>
                <h2 className="display stretch-normal mt-4 text-d-3">Только в группе</h2>
                <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-dust">
                  {coach.name} не ведёт персональные тренировки. Зато ведёт {classes.length}{" "}
                  {plural(classes.length, "направление", "направления", "направлений")} в группах: {classTitles(coach).map((t) => `«${t}»`).join(", ")}.
                  Приходите на ближайшее занятие, а один на один можно заниматься с другими тренерами команды.
                </p>
              </div>
              <div className="flex flex-col gap-3 text-center">
                <a href="#upcoming" className="btn-primary">
                  Выбрать занятие
                </a>
                <Link href="/coaches#personal" className="btn-ghost">
                  Персональные у других тренеров
                </Link>
                <Link href="/trial" className="btn-quiet">
                  Пробная тренировка бесплатно
                </Link>
              </div>
            </Reveal>
          </div>
        )}
      </section>

      {/* ---------- Other coaches ---------- */}
      <section className="border-t border-line/10 pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="container-page">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Команда" title="Другие тренеры" stretch="wide" />
            <ArrowLink href="/coaches" className="min-h-[44px] md:mb-2">
              Все {teamSize} тренеров
            </ArrowLink>
          </div>
          <ul className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 [&_a.holo:focus-visible]:outline-[3px] [&_a.holo:focus-visible]:[--foil:1]">
            {others.map(({ coach: o, reason }) => (
              <li key={o.slug} className="mx-auto w-full max-w-[400px] sm:max-w-none">
                <HoloCard coach={cardData(o)} sizes="(min-width: 1100px) 30vw, (min-width: 560px) 45vw, 92vw" />
                <p className="mt-4 px-1 text-[13.5px] text-dust">{reason}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
