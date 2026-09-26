import type { Metadata } from "next";
import Link from "next/link";
import { RULES, RULES_EFFECTIVE, RULES_INTRO } from "@/data/rules";
import { ArrowLink, PageHero } from "@/components/ui/Kit";
import { Reveal } from "@/components/ui/Reveal";
import { DocNav } from "@/components/faq/DocNav";
import { longDate } from "@/components/faq/doc-date";
import { BOOKING, CLUB } from "@/lib/club";
import { plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Правила клуба",
  description:
    "Правила фитнес-клуба «Каденс»: браслет-пропуск, запись и отмена занятий, форма и гигиена, этикет в зале, бассейн, SPA, детский клуб, здоровье и безопасность.",
};

export default function RulesPage() {
  const hoursToCancel = BOOKING.cancelBeforeMin / 60;
  const bookingNumbers = [
    { value: BOOKING.daysAhead, unit: plural(BOOKING.daysAhead, "день", "дня", "дней"), label: "вперёд открыта онлайн-запись, включая сегодня" },
    { value: BOOKING.closesBeforeMin, unit: plural(BOOKING.closesBeforeMin, "минута", "минуты", "минут"), label: "до начала запись закрывается" },
    { value: hoursToCancel, unit: plural(hoursToCancel, "час", "часа", "часов"), label: "до начала — последний момент для отмены на сайте" },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ href: "/", label: "Главная" }, { label: "Правила клуба" }]}
        eyebrow={`Действуют с ${longDate(RULES_EFFECTIVE)}`}
        title="Правила клуба"
        lead={RULES_INTRO}
        photo="empty-gym"
        photoAlt="Пустой зал после закрытия: одна гантель в пятне красного света"
      />

      <div className="container-page grid gap-10 pb-8 pt-6 lg:grid-cols-[280px_1fr] lg:gap-16">
        <div>
          <DocNav sections={RULES.map(({ id, title }) => ({ id, title }))} label="Разделы правил" />
        </div>

        <div className="min-w-0">
          {RULES.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="scroll-mt-28 border-t border-line/10 py-14 first:border-t-0 first:pt-0 md:py-16"
            >
              <Reveal>
                <div className="flex items-baseline gap-4 md:gap-6">
                  <span className="digits text-[34px] leading-none text-pulse md:text-[44px]" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 id={`${section.id}-title`} className="display stretch-narrow min-w-0 text-d-3 sm:stretch-normal">
                    {section.title}
                  </h2>
                </div>
                {section.lead && <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-dust">{section.lead}</p>}
              </Reveal>

              {section.id === "booking" && (
                <Reveal delay={0.1}>
                  <dl className="ecg-grid mt-8 grid overflow-hidden rounded-card border border-line/10 sm:grid-cols-3">
                    {bookingNumbers.map((b, j) => (
                      <div key={b.label} className={j > 0 ? "flex flex-col-reverse gap-2 border-t border-line/10 p-5 sm:border-l sm:border-t-0 sm:p-6" : "flex flex-col-reverse gap-2 p-5 sm:p-6"}>
                        <dt className="text-[13.5px] leading-snug text-dust">{b.label}</dt>
                        <dd className="flex items-baseline gap-2">
                          <span className="digits text-[64px] leading-[0.85] text-chalk">{b.value}</span>
                          <span className="text-[15px] text-dust">{b.unit}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              )}

              <ol className="mt-8 grid gap-5">
                {section.items.map((item, j) => (
                  <li key={item} className="grid grid-cols-[44px_1fr] gap-3 text-[16.5px] leading-relaxed text-chalk/90 md:grid-cols-[56px_1fr]">
                    <span className="digits pt-0.5 text-[19px] leading-[1.4] text-dust" aria-hidden>
                      {i + 1}.{j + 1}
                    </span>
                    <p className="max-w-[68ch]">{item}</p>
                  </li>
                ))}
              </ol>

              {section.id === "booking" && (
                <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                  <ArrowLink href="/schedule">Расписание</ArrowLink>
                  <ArrowLink href="/booking">Мои записи</ArrowLink>
                </div>
              )}
            </section>
          ))}

          <p className="border-t border-line/10 pt-8 text-[14.5px] text-dust">
            Вопросы по правилам — на ресепшене или по телефону{" "}
            <a href={CLUB.phoneHref} className="link-underline whitespace-nowrap text-chalk">
              {CLUB.phone}
            </a>
            . Как мы обращаемся с вашими данными, описано в{" "}
            <Link href="/privacy" className="link-underline text-chalk">
              политике обработки персональных данных
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
