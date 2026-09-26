import type { Metadata } from "next";
import { PRIVACY, PRIVACY_EDITION, PRIVACY_LEAD, PRIVACY_NOTE } from "@/data/privacy";
import { Breadcrumbs } from "@/components/ui/Kit";
import { Reveal } from "@/components/ui/Reveal";
import { DocNav } from "@/components/faq/DocNav";
import { longDate } from "@/components/faq/doc-date";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
  description:
    "Какие персональные данные собирает сайт фитнес-клуба «Каденс», зачем, где и сколько они хранятся, кому передаются и как отозвать согласие. Пульс хранится в вашем браузере, пока вы его не отправите.",
};

export default function PrivacyPage() {
  return (
    <>
      <header className="pb-12 pt-32 md:pb-16 md:pt-40">
        <div className="container-page">
          <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Политика данных" }]} className="mb-8" />
          <Reveal>
            <p className="eyebrow mb-4">Редакция от {longDate(PRIVACY_EDITION)}</p>
            <h1 className="display stretch-narrow max-w-5xl text-d-2">Политика обработки персональных данных</h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-dust md:text-[19px]">{PRIVACY_LEAD}</p>
            <p className="mt-8 max-w-2xl border-l-2 border-pulse/70 pl-4 text-[14px] leading-relaxed text-dust">{PRIVACY_NOTE}</p>
          </Reveal>
        </div>
      </header>

      <div className="container-page grid gap-10 pb-8 lg:grid-cols-[280px_1fr] lg:gap-16">
        <div>
          <DocNav sections={PRIVACY.map(({ id, title }) => ({ id, title }))} />
        </div>

        <article className="min-w-0 max-w-[76ch]">
          {PRIVACY.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="scroll-mt-28 border-t border-line/10 py-10 first:border-t-0 first:pt-0 md:py-12"
            >
              <h2 id={`${section.id}-title`} className="flex items-baseline gap-4 font-display text-[24px] uppercase leading-[1.05] text-chalk md:text-[30px]" style={{ fontVariationSettings: '"wdth" 90', fontWeight: 800 }}>
                <span className="digits text-[26px] text-pulse md:text-[30px]" style={{ fontVariationSettings: '"ELSH" 2' }} aria-hidden>
                  {i + 1}.
                </span>
                {section.title}
              </h2>
              <div className="mt-6 grid gap-4 text-[16.5px] leading-relaxed text-chalk/85">
                {section.blocks.map((block, j) =>
                  block.type === "p" ? (
                    <p key={j}>{block.text}</p>
                  ) : (
                    <ul key={j} className="grid gap-2.5">
                      {block.items.map((item) => (
                        <li key={item} className="grid grid-cols-[20px_1fr] gap-2">
                          <span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 rounded-full bg-pulse" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
