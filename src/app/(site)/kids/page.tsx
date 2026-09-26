import type { Metadata } from "next";
import { MEMBERSHIPS } from "@/data/memberships";
import { getSpace } from "@/data/spaces";
import { KIDS_ACTIVITIES, KIDS_COPY, KIDS_SAFETY } from "@/components/club/copy";
import { splitHours } from "@/components/club/plan";
import { ArrowLink, PageHero } from "@/components/ui/Kit";
import { LeadForm } from "@/components/ui/LeadForm";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { rub } from "@/lib/format";

const kids = getSpace("kids");
const hours = splitHours(kids.hours ?? "");
const family = MEMBERSHIPS.find((m) => m.slug === "family");

export const metadata: Metadata = {
  title: "Детский клуб",
  description: `Детский клуб «Каденса» на втором этаже: скалодром и игровая для детей от 3 до 12 лет под присмотром педагогов, пока родители тренируются. Часы: ${kids.hours}.`,
};

export default function KidsPage() {
  const [ages, , stay] = kids.facts;

  return (
    <>
      <PageHero
        eyebrow={KIDS_COPY.eyebrow}
        title={KIDS_COPY.title}
        lead={KIDS_COPY.lead}
        photo={kids.photo}
        photoAlt="Детский клуб перед занятием: невысокий скалодром с красными, белыми и графитовыми зацепками, мягкие маты, бревно и поролоновые блоки"
        crumbs={[
          { href: "/", label: "Главная" },
          { href: "/club", label: "О клубе" },
          { label: "Детский клуб" },
        ]}
      >
        <Reveal delay={0.1} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a href="#kids-form" className="btn-primary">
            Оставить заявку
          </a>
          <ArrowLink href={`/studios/${kids.slug}`} className="min-h-[44px]">Как устроен зал</ArrowLink>
        </Reveal>
      </PageHero>

      {/* ---------- Ages, hours, stay ---------- */}
      <section aria-labelledby="kids-hours" className="container-page mt-10 md:mt-14">
        <h2 id="kids-hours" className="sr-only">
          Возраст и часы работы
        </h2>
        <div className="grid border-y border-line/10 md:grid-cols-[1.1fr_1.3fr_1fr]">
          <Reveal className="border-b border-line/10 py-8 md:border-b-0 md:border-r md:pr-8">
            <p className="eyebrow">Возраст</p>
            <p className="mt-3 flex items-baseline gap-3">
              <span className="digits text-[clamp(96px,16vw,168px)] leading-[0.8] text-chalk">{ages.value}</span>
              <span className="text-[18px] text-dust">лет</span>
            </p>
          </Reveal>
          <Reveal delay={0.06} className="border-b border-line/10 py-8 md:border-b-0 md:border-r md:px-8">
            <p className="eyebrow">{KIDS_COPY.hoursTitle}</p>
            <dl className="mt-4 grid gap-3">
              {hours.map((h) => (
                <div key={h.days} className="flex items-baseline justify-between gap-4 border-b border-line/10 pb-3 last:border-b-0 last:pb-0">
                  <dt className="text-[16px] text-chalk/85">{h.days}</dt>
                  <dd className="digits whitespace-nowrap text-[clamp(34px,5vw,52px)] leading-none text-chalk">{h.time}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.12} className="py-8 md:pl-8">
            <p className="eyebrow">Сколько можно остаться</p>
            <p className="mt-3 flex items-baseline gap-3">
              <span className="text-[16px] text-dust">до</span>
              <span className="digits text-[96px] leading-[0.8] text-pulse">{stay.value}</span>
              <span className="text-[18px] text-dust">часов</span>
            </p>
            <p className="mt-4 max-w-xs text-[14.5px] leading-relaxed text-dust">{KIDS_COPY.stayNote}</p>
          </Reveal>
        </div>
      </section>

      {/* ---------- What kids do: two hours as a timeline ---------- */}
      <section aria-labelledby="kids-activities" className="container-page mt-28 md:mt-36">
        <Reveal>
          <p className="eyebrow mb-4">{KIDS_COPY.activitiesEyebrow}</p>
          <h2 id="kids-activities" className="display text-d-2 stretch-normal max-w-[16ch]">
            {KIDS_COPY.activitiesTitle}
          </h2>
        </Reveal>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
          <span className="absolute bottom-2 left-[15px] top-2 w-px bg-line/15 md:bottom-auto md:left-0 md:right-0 md:top-[15px] md:h-px md:w-auto" aria-hidden />
          {KIDS_ACTIVITIES.map((a, i) => (
            <Reveal as="li" key={a.title} delay={0.06 * i} className="relative pl-12 md:pl-0 md:pt-14">
              <span
                className="absolute left-0 top-0 grid h-[31px] w-[31px] place-items-center rounded-full border border-line/25 bg-asphalt font-digits text-[18px] leading-none text-chalk"
                aria-hidden
              >
                {i + 1}
              </span>
              <h3 className="font-display text-[26px] uppercase leading-none text-chalk md:text-[30px]" style={{ fontVariationSettings: '"wdth" 72', fontWeight: 850 }}>
                {a.title}
              </h3>
              <p className="mt-3 text-[15.5px] leading-relaxed text-dust">{a.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---------- Safety ---------- */}
      <section aria-labelledby="kids-safety" className="container-page mt-28 md:mt-36">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <Reveal className="self-start lg:sticky lg:top-28">
            <p className="eyebrow mb-4">{KIDS_COPY.safetyEyebrow}</p>
            <h2 id="kids-safety" className="display text-d-2 stretch-narrow">
              {KIDS_COPY.safetyTitle}
            </h2>
            <MediaFrame
              shot="detail-rubber-floor"
              alt="Чёрный резиновый пол клуба крупным планом: мягкая крошка с серыми и красными вкраплениями"
              sizes="(min-width: 1024px) 40vw, 92vw"
              className="mt-10 aspect-[4/3] rounded-card"
            />
          </Reveal>
          <ul className="grid content-start gap-4">
            {KIDS_SAFETY.map((s, i) => (
              <Reveal as="li" key={s.title} delay={0.05 * i} className="card p-6 md:p-8">
                <h3 className="flex items-baseline gap-4">
                  <span className="digits text-[22px] leading-none text-pulse" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[24px] uppercase leading-none text-chalk md:text-[28px]" style={{ fontVariationSettings: '"wdth" 90', fontWeight: 820 }}>
                    {s.title}
                  </span>
                </h3>
                <p className="mt-4 text-[16px] leading-relaxed text-dust">{s.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Family membership ---------- */}
      {family && (
        <section aria-labelledby="kids-family" className="container-page mt-28 md:mt-36">
          <Reveal className="rubber grid gap-10 rounded-card border border-line/10 p-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end md:p-12">
            <div>
              <p className="eyebrow mb-4">{KIDS_COPY.familyEyebrow}</p>
              <h2 id="kids-family" className="display text-d-2 stretch-narrow">
                {KIDS_COPY.familyTitle}
              </h2>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-dust">{KIDS_COPY.familyText}</p>
            </div>
            <div className="md:justify-self-end md:text-right">
              <p className="text-[14px] text-dust">«{family.name}», за двоих взрослых</p>
              <p className="mt-2 flex items-baseline gap-2 md:justify-end">
                <span className="digits text-[clamp(64px,9vw,104px)] leading-[0.8] text-chalk">{rub(family.price).replace(" ₽", "")}</span>
                <span className="text-[15px] text-dust">₽ {family.unit}</span>
              </p>
              {family.priceYearly && (
                <p className="mt-3 text-[14px] text-dust">
                  или <span className="digits text-[20px] text-chalk">{rub(family.priceYearly)}</span> в месяц при оплате за год
                </p>
              )}
              <ArrowLink href="/memberships" className="mt-7 min-h-[44px]">
                Сравнить абонементы
              </ArrowLink>
            </div>
          </Reveal>
        </section>
      )}

      {/* ---------- Request ---------- */}
      <section id="kids-form" aria-labelledby="kids-form-title" className="container-page mt-28 scroll-mt-28 md:mt-36">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <Reveal>
            <p className="eyebrow mb-4">{KIDS_COPY.formEyebrow}</p>
            <h2 id="kids-form-title" className="display text-d-2 stretch-narrow">
              {KIDS_COPY.formTitle}
            </h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-dust">{KIDS_COPY.formText}</p>
          </Reveal>
          <Reveal delay={0.1} className="card p-5 md:p-8">
            <LeadForm
              kind="kids"
              fields={["comment"]}
              commentLabel="Дети и удобное время"
              commentPlaceholder="Возраст детей и удобные дни"
              submitLabel="Отправить заявку"
              successText={KIDS_COPY.formSuccess}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
