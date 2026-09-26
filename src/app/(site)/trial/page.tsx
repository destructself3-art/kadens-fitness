import type { Metadata } from "next";
import { FAQ } from "@/data/faq";
import { GOALS } from "@/data/goals";
import { ArrowLink, PageHero } from "@/components/ui/Kit";
import { LeadForm } from "@/components/ui/LeadForm";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { BeatWord } from "@/components/pulse/Beat";
import { PulseTap } from "@/components/pulse/PulseTap";
import { ZoneBar } from "@/components/pulse/Zones";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { TRIAL_PAGE as T } from "@/components/memberships/content";
import { TrialPulseBadge } from "@/components/memberships/TrialPulseBadge";
import { TrialTimeline } from "@/components/memberships/TrialTimeline";

export const metadata: Metadata = {
  title: "Пробная тренировка",
  description:
    "Бесплатный первый визит в «Каденс»: знакомство с тренером, пульс покоя и проба Руфье, ваши пять пульсовых зон, экскурсия по клубу и первое занятие. Оставьте заявку — перезвоним.",
};

const GOAL_OPTIONS: [string, string][] = GOALS.map((g) => [g.slug, g.title]);

export default function TrialPage() {
  const faq = FAQ.filter((f) => f.category === "start").map((f, i) => ({ id: `trial-faq-${i + 1}`, q: f.q, a: f.a }));

  return (
    <>
      <PageHero
        crumbs={[{ href: "/", label: "Главная" }, { href: "/memberships", label: "Абонементы" }, { label: "Пробная тренировка" }]}
        eyebrow={T.eyebrow}
        title={
          <>
            <BeatWord base={56} amp={22} className="inline-block">
              {T.titleBeat}
            </BeatWord>{" "}
            {T.titleRest}
          </>
        }
        lead={T.lead}
        photo="zone-lobby"
        photoAlt={T.heroAlt}
      >
        <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center gap-4">
          <MagneticButton href="#request">{T.cta}</MagneticButton>
          <TrialPulseBadge tapHref="#pulse" />
        </Reveal>
        <Reveal delay={0.25}>
          <dl className="mt-14 grid max-w-3xl grid-cols-3 gap-6 border-t border-line/15 pt-6">
            {T.facts.map((f) => (
              <div key={f.label} className="flex flex-col-reverse">
                <dt className="mt-2 text-[13.5px] leading-snug text-dust">{f.label}</dt>
                <dd className="digits text-[44px] leading-none text-chalk sm:text-[60px]">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </PageHero>

      <TrialTimeline eyebrow={T.stepsEyebrow} title={T.stepsTitle} steps={T.steps} photoAlt={T.pulseAlt} photoCaption={T.pulseCaption} />

      {/* What to bring */}
      <section aria-labelledby="trial-bring-title" className="rubber border-y border-line/10 py-24 md:py-28">
        <div className="container-page grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center lg:gap-20">
          <Reveal>
            <MediaFrame shot="detail-towel-bottle" alt={T.bringAlt} sizes="(min-width: 820px) 40vw, 92vw" className="aspect-square rounded-card" />
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow mb-4">{T.bringEyebrow}</p>
              <h2 id="trial-bring-title" className="display stretch-wide text-d-2">
                {T.bringTitle}
              </h2>
            </Reveal>
            <ul className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {T.bring.map((b, i) => (
                <Reveal as="li" key={b.title} delay={i * 0.05} className="border-t border-line/15 pt-4">
                  <p className="text-[17px] font-semibold text-chalk">{b.title}</p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-dust">{b.text}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Request */}
      <section id="request" aria-labelledby="trial-request-title" className="container-page scroll-mt-28 py-24 md:py-32">
        <Reveal className="max-w-3xl">
          <p className="eyebrow mb-4">{T.requestEyebrow}</p>
          <h2 id="trial-request-title" className="display stretch-narrow text-d-2">
            {T.requestTitle}
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-dust">{T.requestLead}</p>
        </Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
          <Reveal className="card p-5 sm:p-8">
            <LeadForm
              kind="trial"
              attachPulse
              fields={["goal", "comment"]}
              goals={GOAL_OPTIONS}
              commentLabel="Комментарий"
              commentPlaceholder={T.commentPlaceholder}
              submitLabel={T.submitLabel}
              successTitle={T.successTitle}
              successText={T.successText}
            />
          </Reveal>
          <Reveal delay={0.1} className="ecg-grid scroll-mt-28 rounded-card border border-line/10 p-5 sm:p-8" id="pulse">
            <h3 className="display stretch-normal text-d-4">{T.tapTitle}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-dust">{T.tapText}</p>
            <PulseTap size="compact" className="mt-8" />
            <ZoneBar className="mt-6" />
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="trial-faq-title" className="container-page pb-8">
        <div className="grid gap-10 border-t border-line/10 pt-20 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-4">{T.faqEyebrow}</p>
            <h2 id="trial-faq-title" className="display stretch-narrow text-d-3">
              {T.faqTitle}
            </h2>
            <ArrowLink href="/faq" className="mt-8">
              Все вопросы и ответы
            </ArrowLink>
          </Reveal>
          <FaqAccordion items={faq} headingLevel="h3" />
        </div>
      </section>
    </>
  );
}
