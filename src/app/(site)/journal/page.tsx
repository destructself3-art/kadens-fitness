import type { Metadata } from "next";
import Link from "next/link";
import { getCoach } from "@/data/coaches";
import { ArticleCard, FeaturedArticle } from "@/components/journal/ArticleCard";
import { categoryFromParam, categorySlug } from "@/components/journal/categories";
import { JournalBrowser, type JournalEntry } from "@/components/journal/JournalBrowser";
import { sortedArticles } from "@/components/journal/lib";
import { Breadcrumbs } from "@/components/ui/Kit";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Журнал",
  description:
    "Тренеры «Каденса» пишут о пульсовых зонах, тренировках, восстановлении и питании: как измерить пульс покоя, зачем нужна вторая зона, что съесть до тренировки.",
};

export default async function JournalPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { category } = await searchParams;
  const initial = categoryFromParam(category);
  const articles = sortedArticles();

  const entries: JournalEntry[] = articles.map((a) => ({
    slug: a.slug,
    category: categorySlug(a.category),
    featured: <FeaturedArticle article={a} />,
    card: <ArticleCard article={a} />,
  }));

  const authors = [...new Set(articles.map((a) => a.author))].map(getCoach);

  return (
    <>
      <header className="pb-14 pt-32 md:pb-20 md:pt-40">
        <div className="container-page">
          <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Журнал" }]} className="mb-8" />
          <Reveal>
            <p className="eyebrow mb-4">Пишут тренеры клуба</p>
            <h1 className="display stretch-normal text-d-1 sm:stretch-wide">Журнал</h1>
          </Reveal>
          <div className="mt-10 grid gap-8 border-t border-line/10 pt-8 lg:grid-cols-12 lg:items-center">
            <Reveal className="lg:col-span-6" delay={0.1}>
              <p className="text-[17px] leading-relaxed text-dust md:text-[19px]">
                Про пульс, тренировки, восстановление и еду. Без марафонов и чудо-рецептов: только то, что тренеры «Каденса» объясняют клиентам в зале.
              </p>
            </Reveal>
            <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.15}>
              <div className="flex items-center gap-4 lg:justify-end">
                <ul className="flex flex-none" aria-label="Авторы журнала">
                  {authors.map((c, i) => (
                    <li key={c.slug} className={i > 0 ? "-ml-3" : undefined}>
                      <Link href={`/coaches/${c.slug}`} className="block rounded-full ring-2 ring-asphalt transition-transform duration-300 ease-silk hover:-translate-y-1" title={c.name}>
                        <MediaFrame shot={c.photo} alt={c.name} sizes="48px" quiet className="h-12 w-12 rounded-full" imgClassName="object-[50%_20%]" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="text-[14px] leading-snug text-dust">
                  <span className="digits text-[22px] leading-none text-chalk">{authors.length}</span>{" "}
                  {plural(authors.length, "тренер пишет", "тренера пишут", "тренеров пишут")} о своём деле
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      <section aria-label="Статьи" className="container-page pb-24 md:pb-32">
        <JournalBrowser key={initial ?? "all"} entries={entries} initial={initial} />
      </section>

      <section aria-labelledby="journal-next" className="ecg-grid border-t border-line/10">
        <div className="container-page grid gap-10 py-24 md:py-28 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow mb-4">От чтения к делу</p>
            <h2 id="journal-next" className="display stretch-narrow text-d-2">
              Статьи понятнее, когда знаешь свои цифры
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-5" delay={0.1}>
            <p className="text-[17px] leading-relaxed text-dust">
              Отстучите пульс покоя за десять секунд: сайт посчитает пять зон, а конструктор соберёт неделю занятий под вашу цель.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <MagneticButton href="/program">Собрать программу</MagneticButton>
              <Link href="/zones" className="btn-ghost">
                Мои пульсовые зоны
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
