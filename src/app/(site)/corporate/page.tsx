import type { Metadata } from "next";
import clsx from "clsx";
import { Check } from "lucide-react";
import { CORPORATE as T } from "@/data/corporate";
import { PageHero } from "@/components/ui/Kit";
import { LeadForm } from "@/components/ui/LeadForm";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { LunchBoard, lunchClasses } from "@/components/memberships/LunchBoard";
import { CLUB } from "@/lib/club";

export const metadata: Metadata = {
  title: "Корпоративным клиентам",
  description:
    "Фитнес для сотрудников в «Каденсе»: корпоративные карты, обеденные занятия с 12:00 до 14:00, командные дни в студиях и пульс-тесты. Условия обсуждаем индивидуально.",
};

export default function CorporatePage() {
  const lunch = lunchClasses();
  const stats = [
    { value: String(lunch.length), label: T.stats.lunch },
    { value: String(CLUB.studios), label: T.stats.studios },
    { value: String(CLUB.parkingSpots), label: T.stats.parking },
    { value: String(CLUB.coaches), label: T.stats.coaches },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ href: "/", label: "Главная" }, { label: T.title }]}
        eyebrow={T.eyebrow}
        title={<span className="block text-[clamp(2.2rem,10vw,11rem)]">{T.title}</span>}
        lead={T.lead}
        photo="zone-cardio"
        photoAlt="Кардиозона ночью: ряд беговых дорожек у панорамных окон с огнями города"
      >
        <Reveal delay={0.15} className="mt-10">
          <MagneticButton href="#request">Обсудить условия</MagneticButton>
        </Reveal>
      </PageHero>

      {/* Numbers */}
      <section aria-label="Клуб в цифрах для компаний" className="container-page">
        <dl className="grid grid-cols-2 border-y border-line/10 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.06}
              className={clsx("flex flex-col-reverse gap-3 py-8 pr-4 lg:py-10", i % 2 === 1 && "border-l border-line/10 pl-5", i >= 2 && "border-t border-line/10 lg:border-t-0", i === 2 && "lg:border-l lg:pl-5")}
            >
              <dt className="max-w-[24ch] text-[14.5px] leading-snug text-dust">{s.label}</dt>
              <dd className="digits text-[72px] leading-[0.8] text-chalk md:text-[96px]">{s.value}</dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Offers */}
      <section aria-labelledby="corp-offers-title" className="container-page py-24 md:py-32">
        <Reveal className="mb-16 max-w-3xl md:mb-24">
          <p className="eyebrow mb-4">{T.offersEyebrow}</p>
          <h2 id="corp-offers-title" className="display stretch-wide text-d-2">
            {T.offersTitle}
          </h2>
        </Reveal>

        <ol className="grid gap-24 md:gap-32">
          {T.offers.map((offer, i) => {
            const flip = i % 2 === 1;
            return (
              <li key={offer.id} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
                <Reveal className={clsx(flip && "lg:order-2")}>
                  <p className="digits text-[88px] leading-[0.8] text-pulse/90 md:text-[120px]" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="display stretch-narrow mt-6 text-d-3 sm:stretch-normal">{offer.title}</h3>
                  <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-dust">{offer.text}</p>
                  <ul className="mt-8 grid max-w-xl gap-3">
                    {offer.points.map((p) => (
                      <li key={p} className="flex gap-3 text-[15.5px] text-chalk/90">
                        <Check className="mt-1 h-4 w-4 flex-none text-pulse" aria-hidden />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delay={0.1} className={clsx(flip && "lg:order-1")}>
                  {offer.id === "lunch" ? (
                    <LunchBoard items={lunch} title={T.lunchBoard.title} lead={T.lunchBoard.lead} linkLabel={T.lunchBoard.link} />
                  ) : offer.photo ? (
                    <MediaFrame shot={offer.photo} alt={offer.photoAlt ?? ""} sizes="(min-width: 1100px) 45vw, 92vw" className="aspect-[4/3] rounded-card" />
                  ) : null}
                </Reveal>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Steps */}
      <section aria-labelledby="corp-steps-title" className="border-y border-line/10 bg-graphite/40 py-24 md:py-28">
        <div className="container-page">
          <Reveal className="mb-14 max-w-3xl">
            <p className="eyebrow mb-4">{T.stepsEyebrow}</p>
            <h2 id="corp-steps-title" className="display stretch-narrow text-d-2">
              {T.stepsTitle}
            </h2>
          </Reveal>
          <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <span aria-hidden className="absolute left-0 right-0 top-[27px] hidden h-px bg-gradient-to-r from-pulse via-pulse/40 to-transparent lg:block" />
            {T.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.08} className="relative">
                <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full border border-pulse/60 bg-asphalt">
                  <span className="digits text-[26px] leading-none text-chalk">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <h3 className="display stretch-narrow mt-6 text-d-4">{step.title}</h3>
                <p className="mt-3 max-w-xs text-[15.5px] leading-relaxed text-dust">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Terms */}
      <section aria-labelledby="corp-terms-title" className="container-page py-24 md:py-32">
        <Reveal className="ecg-grid relative overflow-hidden rounded-card border border-line/10 px-6 py-12 sm:px-12 md:py-16">
          <h2 id="corp-terms-title" className="display stretch-narrow max-w-4xl text-d-3 sm:stretch-normal">
            {T.terms.title}
          </h2>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-dust">{T.terms.text}</p>
        </Reveal>
      </section>

      {/* Request */}
      <section id="request" aria-labelledby="corp-request-title" className="container-page scroll-mt-28 pb-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <Reveal>
            <p className="eyebrow mb-4">{T.form.eyebrow}</p>
            <h2 id="corp-request-title" className="display stretch-narrow text-d-2">
              {T.form.title}
            </h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-dust">{T.form.lead}</p>
            <div className="mt-10 grid gap-2 text-[15px] text-dust">
              <a href={CLUB.phoneHref} className="w-fit text-[20px] text-chalk hover:text-pulse">
                {CLUB.phone}
              </a>
              <a href={`mailto:${CLUB.email}`} className="link-underline w-fit hover:text-chalk">
                {CLUB.email}
              </a>
              <p>
                {CLUB.city}, {CLUB.street}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="card p-5 sm:p-8">
            <LeadForm
              kind="corporate"
              fields={["company", "email", "comment"]}
              companyLabel={T.form.companyLabel}
              commentLabel={T.form.commentLabel}
              commentPlaceholder={T.form.commentPlaceholder}
              submitLabel={T.form.submitLabel}
              successTitle={T.form.successTitle}
              successText={T.form.successText}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
