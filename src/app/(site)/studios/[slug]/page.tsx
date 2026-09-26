import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { CLASSES } from "@/data/classes";
import { SPACES } from "@/data/spaces";
import { FLOOR_NAMES, spaceCta } from "@/components/club/copy";
import { FloorDirectory } from "@/components/club/FloorDirectory";
import { FloorMap } from "@/components/club/FloorMap";
import { splitHours, spaceTitle, toPlanSpace } from "@/components/club/plan";
import { UpcomingList } from "@/components/club/UpcomingList";
import { ClassCard } from "@/components/ui/Cards";
import { ArrowLink, EmptyState, PageHero, Stat } from "@/components/ui/Kit";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { BOOKING, HOURS_LABEL } from "@/lib/club";
import { num, placesLabel, plural } from "@/lib/format";
import { getPhoto } from "@/lib/photos";
import { getUpcoming } from "@/lib/schedule";
import type { SessionView } from "@/lib/session-types";

// The upcoming classes come from the database and depend on the clock.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const findSpace = (slug: string) => SPACES.find((s) => s.slug === slug);

/** Long single words ("Функциональная") get a smaller hero size so they never overflow a 375 px screen. */
function heroTitleClass(title: string): string | undefined {
  const longest = Math.max(...title.split(/\s+/).map((w) => w.length));
  if (longest >= 13) return "text-[clamp(2.3rem,8.4vw,8.6rem)]";
  if (longest >= 11) return "text-[clamp(2.8rem,9.6vw,9.8rem)]";
  return undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const space = findSpace((await params).slug);
  if (!space) return { title: "Помещение не найдено" };
  const title = `${spaceTitle(space)}: ${space.label.toLowerCase()}`;
  const description = `${space.mood} ${space.floor} этаж, ${num(space.area)} м²${space.capacity ? `, ${placesLabel(space.capacity)} на занятии` : ""}. Что внутри, часы работы и ближайшие занятия.`;
  const photo = getPhoto(space.photo);
  return {
    title,
    description,
    openGraph: { title: `${title} · Каденс`, description, images: photo ? [{ url: photo.src, width: photo.width, height: photo.height }] : undefined },
  };
}

export default async function SpacePage({ params }: Props) {
  const { slug } = await params;
  const space = findSpace(slug);
  if (!space) notFound();

  const title = spaceTitle(space);
  const classes = CLASSES.filter((c) => c.studio === space.slug);
  const hostsClasses = Boolean(space.capacity) && classes.length > 0;
  const onFloor = SPACES.filter((s) => s.floor === space.floor);
  const neighbours = onFloor.filter((s) => s.slug !== space.slug);
  const hours = space.hours ? splitHours(space.hours) : HOURS_LABEL.map((h) => ({ days: h.days, time: h.time }));
  const cta = spaceCta(space.slug);
  const scheduleHref = `/schedule?studio=${space.slug}`;
  const [lead, ...paragraphs] = space.description;

  const now = new Date();
  let sessions: SessionView[] = [];
  let scheduleFailed = false;
  if (hostsClasses) {
    try {
      sessions = await getUpcoming({ studioSlug: space.slug }, 8, BOOKING.daysAhead, now);
    } catch (error) {
      console.error(`[studios/${space.slug}] upcoming sessions failed`, error);
      scheduleFailed = true;
    }
  }

  return (
    <>
      <PageHero
        eyebrow={`${space.label} · ${space.floor} этаж`}
        title={<span className={clsx("block", heroTitleClass(title))}>{title}</span>}
        lead={space.mood}
        photo={space.photo}
        photoAlt={`${space.label} ${title}`}
        crumbs={[
          { href: "/", label: "Главная" },
          { href: "/studios", label: "Студии и зоны" },
          { label: title },
        ]}
      >
        <Reveal delay={0.1} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          {hostsClasses ? (
            <>
              <MagneticButton href="#upcoming">Ближайшие занятия</MagneticButton>
              <ArrowLink href={scheduleHref} className="min-h-[44px]">Расписание {space.kind === "studio" ? "студии" : "зоны"} на неделю</ArrowLink>
            </>
          ) : (
            <>
              <MagneticButton href={cta.href}>{cta.label}</MagneticButton>
              <ArrowLink href="/studios" className="min-h-[44px]">План клуба</ArrowLink>
            </>
          )}
        </Reveal>
      </PageHero>

      {/* ---------- Three numbers ---------- */}
      <section aria-label="В цифрах" className="container-page mt-6 md:mt-10">
        <div className="grid border-t border-line/10 sm:grid-cols-3">
          {space.facts.map((f, i) => (
            <Reveal key={f.label} delay={0.06 * i} className="border-b border-line/10 py-7 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0 md:py-10">
              <Stat value={f.value} label={f.label} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Story and the spec sheet ---------- */}
      <section aria-labelledby="space-about" className="container-page mt-24 md:mt-32">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <p className="eyebrow mb-4">Внутри</p>
            <h2 id="space-about" className="display text-d-2 stretch-normal">
              Как здесь устроено
            </h2>
            <p className="mt-8 text-[19px] leading-relaxed text-chalk md:text-[22px]">{lead}</p>
            {paragraphs.map((p) => (
              <p key={p.slice(0, 32)} className="mt-5 max-w-2xl text-[16.5px] leading-relaxed text-dust">
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.1} className="self-start lg:sticky lg:top-28">
            <div className="card p-6 md:p-8">
              <p className="eyebrow">Паспорт помещения</p>
              <dl className="mt-5 grid gap-0 text-[15px]">
                <div className="flex items-baseline justify-between gap-4 border-b border-line/10 py-3">
                  <dt className="text-dust">Этаж</dt>
                  <dd className="digits text-[26px] leading-none text-chalk">{space.floor}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-line/10 py-3">
                  <dt className="text-dust">Площадь</dt>
                  <dd className="text-dust">
                    <span className="digits text-[26px] leading-none text-chalk">{num(space.area)}</span> м²
                  </dd>
                </div>
                {space.capacity ? (
                  <div className="flex items-baseline justify-between gap-4 border-b border-line/10 py-3">
                    <dt className="text-dust">На занятии</dt>
                    <dd className="text-dust">
                      <span className="digits text-[26px] leading-none text-chalk">{space.capacity}</span> {plural(space.capacity, "место", "места", "мест")}
                    </dd>
                  </div>
                ) : null}
                <div className="grid gap-2 py-3">
                  <dt className="text-dust">{space.hours ? "Часы работы" : "Часы работы, как у клуба"}</dt>
                  {hours.map((h) => (
                    <dd key={h.days} className="flex items-baseline justify-between gap-4">
                      <span className="text-chalk/85">{h.days.charAt(0).toUpperCase() + h.days.slice(1)}</span>
                      <span className="digits whitespace-nowrap text-[24px] leading-none text-chalk">{h.time}</span>
                    </dd>
                  ))}
                </div>
              </dl>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-16 md:mt-20">
          <h3 className="eyebrow mb-2">Что есть в {space.kind === "studio" ? "студии" : "зоне"}</h3>
          <ol className="grid border-t border-line/10 sm:grid-cols-2 sm:gap-x-10">
            {space.features.map((f, i) => (
              <li key={f} className="flex items-baseline gap-5 border-b border-line/10 py-4">
                <span className="digits w-8 flex-none text-[22px] leading-none text-pulse">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[16.5px] text-chalk">{f}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* ---------- Classes held here ---------- */}
      {hostsClasses && (
        <section aria-labelledby="space-classes" className="container-page mt-28 md:mt-36">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <Reveal>
              <p className="eyebrow mb-4">{classes.length > 1 ? "Направления" : "Направление"}</p>
              <h2 id="space-classes" className="display text-d-2 stretch-narrow">
                {classes.length > 1 ? "Что здесь проходит" : "Здесь проходит"}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-sm text-[15.5px] leading-relaxed text-dust">
                У каждого класса своя пульсовая зона и своя кривая нагрузки. Откройте класс, чтобы увидеть её и ваши цифры.
              </p>
            </Reveal>
          </div>
          <ul className={clsx("mt-10 grid gap-4", classes.length === 1 ? "sm:max-w-md" : "sm:grid-cols-2", classes.length > 2 && "lg:grid-cols-3")}>
            {classes.map((c, i) => (
              <li key={c.slug}>
                <Reveal delay={0.06 * i}>
                  <ClassCard cls={c} sizes="(min-width: 1100px) 30vw, (min-width: 560px) 45vw, 92vw" />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Upcoming ---------- */}
      {hostsClasses && (
        <section id="upcoming" aria-labelledby="space-upcoming" className="container-page mt-28 scroll-mt-28 md:mt-36">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-16">
            <Reveal className="self-start lg:sticky lg:top-28">
              <p className="eyebrow mb-4">Живое расписание</p>
              <h2 id="space-upcoming" className="display text-d-2 stretch-narrow lg:text-[clamp(3rem,5vw,5.2rem)]">
                Ближайшие занятия
              </h2>
              <p className="mt-6 max-w-md text-[16px] leading-relaxed text-dust">
                Места обновляются в реальном времени. Запись открывается за {BOOKING.daysAhead} дней и закрывается за {BOOKING.closesBeforeMin} минут до
                начала. Если мест нет, встаньте в лист ожидания: освободившееся место уйдёт первому в очереди.
              </p>
              <ArrowLink href={scheduleHref} className="mt-8 min-h-[44px]">
                Всё расписание {space.kind === "studio" ? "студии" : "зоны"}
              </ArrowLink>
            </Reveal>
            <div aria-live="polite">
              {scheduleFailed ? (
                <EmptyState
                  title="Расписание не загрузилось"
                  text="Обновите страницу через минуту или откройте общее расписание."
                  action={<ArrowLink href="/schedule" className="min-h-[44px]">Открыть расписание</ArrowLink>}
                />
              ) : sessions.length === 0 ? (
                <EmptyState
                  title="На неделю вперёд пусто"
                  text={`Ближайшие ${BOOKING.daysAhead} дней здесь нет свободных для записи занятий. Посмотрите соседние студии или следующую неделю.`}
                  action={<ArrowLink href={scheduleHref} className="min-h-[44px]">Расписание</ArrowLink>}
                />
              ) : (
                <UpcomingList sessions={sessions} now={now} />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---------- The floor ---------- */}
      <section aria-labelledby="space-floor" className="container-page mt-28 md:mt-36">
        <Reveal>
          <p className="eyebrow mb-4">Где это</p>
          <h2 id="space-floor" className="display text-d-2 stretch-wide">
            {FLOOR_NAMES[space.floor]}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14">
          <Reveal>
            <div className="ecg-grid rounded-card border border-line/10 bg-asphalt p-2 sm:p-4">
              <FloorMap floor={space.floor} spaces={onFloor.map(toPlanSpace)} active={space.slug} variant="tall" mode="locator" className="md:hidden" />
              <FloorMap floor={space.floor} spaces={onFloor.map(toPlanSpace)} active={space.slug} variant="wide" mode="locator" className="hidden md:block" />
            </div>
            <p className="mt-3 text-[13px] text-dust">
              Красная рамка — {title}. Нажмите на другое помещение, чтобы перейти к нему.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h3 className="eyebrow mb-2">
              Ещё на этаже · <span className="digits text-[16px] text-chalk">{neighbours.length}</span>
            </h3>
            <FloorDirectory spaces={neighbours} />
            <ArrowLink href={`/studios?floor=${space.floor}`} className="mt-6 min-h-[44px]">
              Тур по всем этажам
            </ArrowLink>
          </Reveal>
        </div>
      </section>

      {/* ---------- Next step ---------- */}
      <section aria-labelledby="space-cta" className="container-page mt-28 md:mt-36">
        <Reveal className="rubber grid gap-8 rounded-card border border-line/10 p-6 md:grid-cols-[1.3fr_1fr] md:items-end md:p-12">
          <div>
            <h2 id="space-cta" className="display text-d-3 stretch-normal">
              {cta.href === "/trial" ? "Увидеть своими глазами" : cta.label}
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-dust">{cta.text}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:justify-end">
            <Link href={cta.href} className="btn-ghost">
              {cta.label}
            </Link>
            <ArrowLink href="/contacts" className="min-h-[44px]">Как добраться</ArrowLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
