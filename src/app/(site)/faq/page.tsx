import type { Metadata } from "next";
import { FAQ, FAQ_CATEGORIES } from "@/data/faq";
import { PageHero } from "@/components/ui/Kit";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { FaqExplorer } from "@/components/faq/FaqExplorer";
import { CLUB } from "@/lib/club";
import { plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Вопросы и ответы",
  description:
    "Ответы на частые вопросы о фитнес-клубе «Каденс»: с чего начать, запись и отмена занятий, пульсовые зоны и проба Руфье, абонементы и заморозка, часы работы и парковка.",
};

export default function FaqPage() {
  const n = FAQ.length;
  const sections = Object.keys(FAQ_CATEGORIES).length;
  return (
    <>
      <PageHero
        crumbs={[{ href: "/", label: "Главная" }, { label: "Вопросы и ответы" }]}
        eyebrow={`${n} ${plural(n, "ответ", "ответа", "ответов")} · ${sections} ${plural(sections, "раздел", "раздела", "разделов")}`}
        title="Вопросы и ответы"
        lead="Про первый визит, запись, пульс и абонементы. Найдите вопрос поиском или выберите раздел."
      />

      <section aria-label="Вопросы" className="container-page pb-24 pt-4 md:pb-32">
        <FaqExplorer items={FAQ} categories={FAQ_CATEGORIES} />
      </section>

      <section aria-labelledby="faq-cta-title" className="container-page pb-8">
        <Reveal className="grid gap-10 rounded-card border border-line/10 bg-graphite px-6 py-12 sm:px-12 md:grid-cols-[1fr_auto] md:items-end md:py-16">
          <div>
            <h2 id="faq-cta-title" className="display stretch-normal text-d-3">
              Остался вопрос?
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-dust">
              Позвоните на ресепшен: <a href={CLUB.phoneHref} className="link-underline whitespace-nowrap text-chalk">{CLUB.phone}</a>, или напишите в Telegram{" "}
              <a href={`https://t.me/${CLUB.telegram}`} className="link-underline text-chalk" target="_blank" rel="noopener noreferrer">
                @{CLUB.telegram}
              </a>
              . Отвечаем в часы работы клуба.
            </p>
          </div>
          <MagneticButton href="/contacts">Контакты клуба</MagneticButton>
        </Reveal>
      </section>
    </>
  );
}
