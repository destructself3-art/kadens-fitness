import type { Metadata } from "next";
import clsx from "clsx";
import { getSpace } from "@/data/spaces";
import { CityMap } from "@/components/club/CityMap";
import { CONTACTS_COPY, HOW_TO_REACH } from "@/components/club/copy";
import { HoursTable, type HoursGroup } from "@/components/club/HoursTable";
import { splitHours } from "@/components/club/plan";
import { BeatDot } from "@/components/pulse/Beat";
import { Breadcrumbs } from "@/components/ui/Kit";
import { LeadForm } from "@/components/ui/LeadForm";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { CLUB, HOURS_LABEL } from "@/lib/club";
import { openStatus } from "@/lib/time";

// "Open now / closed" depends on the clock.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Контакты и как добраться",
  description: `${CLUB.city}, ${CLUB.street}: ${CLUB.district}. Часы работы, телефон ${CLUB.phone}, парковка на ${CLUB.parkingSpots} мест и схема проезда.`,
};

const pool = getSpace("pool");
const kids = getSpace("kids");

const HOURS: HoursGroup[] = [
  { place: "Клуб", rows: HOURS_LABEL.map((h) => ({ days: h.days, time: h.time })) },
  { place: "Бассейн и SPA", rows: splitHours(pool.hours ?? "ежедневно 07:00–22:00").map((r) => ({ ...r, days: r.days.charAt(0).toUpperCase() + r.days.slice(1) })) },
  { place: "Детский клуб", rows: splitHours(kids.hours ?? "") },
];

export default function ContactsPage() {
  const status = openStatus(new Date());
  const telegramHref = `https://t.me/${CLUB.telegram}`;

  const channels = [
    { label: "Телефон", value: CLUB.phone, href: CLUB.phoneHref, digits: true },
    { label: "Почта", value: CLUB.email, href: `mailto:${CLUB.email}` },
    { label: "Телеграм", value: `@${CLUB.telegram}`, href: telegramHref, external: true },
  ];

  return (
    <>
      {/* ---------- Hero with the address ---------- */}
      <header className="relative isolate overflow-hidden pb-12 pt-32 md:pb-16 md:pt-40">
        <div className="ecg-grid absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" aria-hidden />
        <div className="container-page">
          <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: CONTACTS_COPY.eyebrow }]} className="mb-8" />
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end lg:gap-16">
            <Reveal>
              <p className="eyebrow mb-4">{CONTACTS_COPY.eyebrow}</p>
              <h1 className="display text-d-1 stretch-narrow max-w-[12ch]">{CONTACTS_COPY.title}</h1>
              <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-dust md:text-[19px]">{CONTACTS_COPY.lead}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <address className="card grid gap-0 p-6 not-italic md:p-8">
                <p className={clsx("mb-5 inline-flex items-center gap-2 text-[14px] font-semibold", status.open ? "text-pulse" : "text-dust")}>
                  {status.open ? <BeatDot className="h-2 w-2" /> : <span className="h-2 w-2 rounded-full bg-dust" aria-hidden />}
                  {status.label}
                </p>
                <p className="text-[13px] uppercase tracking-[0.14em] text-dust">Адрес</p>
                <p className="mt-1 text-[20px] font-semibold leading-snug text-chalk">
                  {CLUB.city}, {CLUB.street}
                </p>
                <p className="mt-1 text-[14.5px] text-dust">{CLUB.district}</p>
                <dl className="mt-6 border-t border-line/10">
                  {channels.map((c) => (
                    <div key={c.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line/10 py-3">
                      <dt className="text-[14px] text-dust">{c.label}</dt>
                      <dd className="min-w-0">
                        <a
                          href={c.href}
                          className={clsx(
                            "inline-flex min-h-[44px] items-center break-all text-chalk transition-colors hover:text-pulse",
                            c.digits ? "digits text-[28px] leading-none" : "text-[17px] font-medium",
                          )}
                          {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                          {c.value}
                          {c.external && <span className="sr-only"> (откроется в новой вкладке)</span>}
                        </a>
                      </dd>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-[14px] text-dust">Парковка</dt>
                    <dd className="text-[14px] text-dust">
                      <span className="digits text-[28px] leading-none text-chalk">{CLUB.parkingSpots}</span> мест у входа
                    </dd>
                  </div>
                </dl>
              </address>
            </Reveal>
          </div>
        </div>
      </header>

      {/* ---------- Map ---------- */}
      <section aria-labelledby="contacts-map" className="container-page mt-8 md:mt-12">
        <h2 id="contacts-map" className="sr-only">
          Схема проезда
        </h2>
        <Reveal>
          <CityMap caption={CONTACTS_COPY.mapCaption} />
        </Reveal>
      </section>

      {/* ---------- Hours and the way in ---------- */}
      <section aria-labelledby="contacts-reach" className="container-page mt-28 md:mt-36">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20">
          <Reveal className="self-start lg:sticky lg:top-28">
            <h2 className="display text-d-3 stretch-wide" id="contacts-hours">
              {CONTACTS_COPY.hoursTitle}
            </h2>
            <HoursTable groups={HOURS} caption="Часы работы клуба, бассейна, SPA и детского клуба" className="mt-8" />
            <p className="mt-4 text-[13.5px] leading-relaxed text-dust">
              Раздевалки и фитнес-бар работают все часы клуба.
            </p>
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow mb-4">{CONTACTS_COPY.reachEyebrow}</p>
              <h2 id="contacts-reach" className="display text-d-2 stretch-narrow">
                {CONTACTS_COPY.reachTitle}
              </h2>
            </Reveal>
            <ol className="mt-10 border-t border-line/10">
              {HOW_TO_REACH.map((r, i) => (
                <Reveal as="li" key={r.title} delay={0.05 * i} className="grid gap-3 border-b border-line/10 py-7 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-8">
                  <h3 className="flex items-baseline gap-3 font-display text-[22px] uppercase leading-none text-chalk" style={{ fontVariationSettings: '"wdth" 80', fontWeight: 820 }}>
                    <span className="digits text-[18px] text-pulse" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {r.title}
                  </h3>
                  <p className="text-[16px] leading-relaxed text-dust">{r.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- Facade ---------- */}
      <section aria-label="Фасад клуба" className="mt-28 md:mt-36">
        <figure className="relative isolate flex min-h-[70svh] items-end overflow-hidden md:min-h-[86svh]">
          <MediaFrame
            shot="facade-night"
            alt="Здание «Каденса» ночью после дождя: на втором этаже красным горят окна сайкл-студии, внизу тёплый свет ресепшена"
            sizes="100vw"
            className="absolute inset-0 -z-20"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-asphalt via-asphalt/40 to-transparent" aria-hidden />
          <figcaption className="container-page pb-10 md:pb-16">
            <p className="display text-d-3 stretch-wide max-w-[20ch] text-chalk md:stretch-ultra">{CLUB.street.replace(", ", ",\u00a0")}</p>
            <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-chalk/80">{CONTACTS_COPY.photoCaption}</p>
          </figcaption>
        </figure>
      </section>

      {/* ---------- Callback ---------- */}
      <section id="callback" aria-labelledby="contacts-form" className="container-page mt-28 scroll-mt-28 md:mt-36">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <Reveal>
            <p className="eyebrow mb-4">{CONTACTS_COPY.formEyebrow}</p>
            <h2 id="contacts-form" className="display text-d-2 stretch-narrow">
              {CONTACTS_COPY.formTitle}
            </h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-dust">{CONTACTS_COPY.formText}</p>
            <p className="mt-8 text-[15px] text-dust">
              Или позвоните сами:{" "}
              <a href={CLUB.phoneHref} className="digits whitespace-nowrap text-[26px] text-chalk transition-colors hover:text-pulse">
                {CLUB.phone}
              </a>
            </p>
          </Reveal>
          <Reveal delay={0.1} className="card p-5 md:p-8">
            <LeadForm
              kind="callback"
              fields={["comment"]}
              commentLabel="Что хотите узнать"
              commentPlaceholder="Абонементы, пробная тренировка, детский клуб"
              submitLabel="Перезвоните мне"
              successTitle="Перезвоним"
              successText="Администратор перезвонит в течение часа в рабочее время клуба."
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
