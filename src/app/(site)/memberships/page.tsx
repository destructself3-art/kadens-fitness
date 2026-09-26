import type { Metadata } from "next";
import { FAQ } from "@/data/faq";
import { MEMBERSHIP_NOTES, MEMBERSHIPS } from "@/data/memberships";
import { ArrowLink, PageHero } from "@/components/ui/Kit";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { PlanRequest } from "@/components/leads/PlanRequest";
import { MEMBERSHIPS_PAGE as T, maxYearlySaving } from "@/components/memberships/content";
import { MembershipsState, REQUEST_ID } from "@/components/memberships/MembershipsState";
import { COMPARE_BG, PlanCompare } from "@/components/memberships/PlanCompare";
import { BillingToggle, PlanGrid } from "@/components/memberships/PlanGrid";
import { CLUB } from "@/lib/club";
import { num } from "@/lib/format";

export const metadata: Metadata = {
  title: "Абонементы",
  description:
    "Шесть абонементов фитнес-клуба «Каденс» в Казани: «Утро», «Ритм», «Каденс Про», «Семья», разовое посещение и пробная неделя. Сравнение, годовые цены, заморозка и заявка на карту.",
};

export default function MembershipsPage() {
  const saving = maxYearlySaving(MEMBERSHIPS);
  const cheapest = Math.min(...MEMBERSHIPS.map((p) => p.price));
  const popular = MEMBERSHIPS.find((p) => p.highlight) ?? MEMBERSHIPS[0];
  const faq = FAQ.filter((f) => f.category === "memberships").map((f, i) => ({ id: `plans-faq-${i + 1}`, q: f.q, a: f.a }));

  return (
    <MembershipsState initialPlan={popular.slug}>
      <PageHero
        crumbs={[{ href: "/", label: "Главная" }, { label: T.title }]}
        eyebrow={T.eyebrow}
        title={T.title}
        lead={T.lead}
      >
        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_minmax(0,400px)] lg:items-end">
          <Reveal delay={0.1}>
            <dl className="grid gap-8 border-t border-line/10 pt-8 sm:grid-cols-3">
              <div>
                <dt className="sr-only">Пробная тренировка</dt>
                <dd>
                  <p className="digits text-[76px] leading-[0.8] text-pulse md:text-[96px]">0</p>
                  <p className="mt-3 max-w-[24ch] text-[14.5px] text-dust">рублей стоит пробная тренировка с пульс-тестом. Карту выбираете после неё.</p>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Годовая карта</dt>
                <dd>
                  <p className="digits text-[76px] leading-[0.8] text-chalk md:text-[96px]">−{saving}%</p>
                  <p className="mt-3 max-w-[24ch] text-[14.5px] text-dust">максимальная экономия на годовой карте в пересчёте на месяц.</p>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Разовое посещение</dt>
                <dd>
                  <p className="digits whitespace-nowrap text-[76px] leading-[0.8] text-chalk md:text-[96px]">{num(cheapest)}</p>
                  <p className="mt-3 max-w-[24ch] text-[14.5px] text-dust">рублей — один день в клубе без карты.</p>
                </dd>
              </div>
            </dl>
          </Reveal>
          <Reveal delay={0.2}>
            <figure className="grid grid-cols-[120px_1fr] items-end gap-5 sm:grid-cols-[160px_1fr] lg:grid-cols-1">
              <MediaFrame shot="detail-wristband" alt={T.wristbandAlt} sizes="(min-width: 1100px) 400px, 160px" className="aspect-square rounded-card lg:aspect-[4/3]" />
              <figcaption className="text-[14px] leading-snug text-dust">{T.wristbandCaption}</figcaption>
            </figure>
          </Reveal>
        </div>
      </PageHero>

      {/* Plans */}
      <section aria-labelledby="plans-title" className="container-page pb-24 pt-10 md:pb-32">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="eyebrow mb-4">{T.gridEyebrow}</p>
            <h2 id="plans-title" className="display stretch-normal text-d-2 sm:stretch-wide">
              {T.gridTitle}
            </h2>
          </Reveal>
          <BillingToggle saving={saving} labels={{ monthly: T.monthly, yearly: T.yearly }} />
        </div>
        <PlanGrid plans={MEMBERSHIPS} />
      </section>

      {/* Comparison */}
      <section aria-labelledby="compare-title" className={`border-y border-line/10 py-24 md:py-32 ${COMPARE_BG}`}>
        <div className="container-page">
          <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <Reveal>
              <p className="eyebrow mb-4">{T.compareEyebrow}</p>
              <h2 id="compare-title" className="display stretch-narrow text-d-2">
                {T.compareTitle}
              </h2>
            </Reveal>
            <p className="max-w-sm text-[14.5px] text-dust lg:text-right">
              В любую карту входят тренажёрный зал, функциональная и кардиозона, шкафчик, полотенце и фен. На телефоне таблицу можно листать вбок.
            </p>
          </div>
          <PlanCompare plans={MEMBERSHIPS} caption={T.compareCaption} labelledBy="compare-title" />

          <div className="mt-16 grid gap-8 lg:grid-cols-[240px_1fr]">
            <h3 className="eyebrow pt-1">{T.notesTitle}</h3>
            <ol className="grid gap-x-10 gap-y-4 md:grid-cols-2">
              {MEMBERSHIP_NOTES.map((note, i) => (
                <li key={note} className="grid grid-cols-[28px_1fr] gap-2 text-[14px] leading-relaxed text-dust">
                  <span className="digits text-[18px] leading-[1.3] text-chalk/70">{String(i + 1).padStart(2, "0")}</span>
                  <span>{note}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Request */}
      <section id={REQUEST_ID} aria-labelledby="request-title" className="container-page scroll-mt-28 py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-20">
          <div className="flex flex-col">
            <Reveal>
              <p className="eyebrow mb-4">{T.requestEyebrow}</p>
              <h2 id="request-title" className="display stretch-normal text-d-2">
                {T.requestTitle}
              </h2>
              <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-dust">{T.requestLead}</p>
              <p className="mt-6 text-[15px] text-dust">
                Или позвоните:{" "}
                <a href={CLUB.phoneHref} className="link-underline whitespace-nowrap text-chalk">
                  {CLUB.phone}
                </a>
              </p>
            </Reveal>
            <Reveal delay={0.15} className="mt-12 hidden lg:block">
              <MediaFrame shot="zone-lockers" alt={T.lockersAlt} sizes="(min-width: 1360px) 620px, 45vw" className="aspect-[3/2] rounded-card" />
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="card p-5 sm:p-8">
              <PlanRequest plans={MEMBERSHIPS} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="plans-faq-title" className="container-page pb-8">
        <div className="grid gap-10 border-t border-line/10 pt-20 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-4">{T.faqEyebrow}</p>
            <h2 id="plans-faq-title" className="display stretch-narrow text-d-3">
              {T.faqTitle}
            </h2>
            <ArrowLink href="/faq" className="mt-8">
              Все вопросы и ответы
            </ArrowLink>
          </Reveal>
          <FaqAccordion items={faq} headingLevel="h3" />
        </div>
      </section>
    </MembershipsState>
  );
}
