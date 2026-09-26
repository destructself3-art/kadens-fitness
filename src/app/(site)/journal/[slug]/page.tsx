import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCoach } from "@/data/coaches";
import { ARTICLES, getArticle } from "@/data/journal";
import { ArticleBody } from "@/components/journal/ArticleBody";
import { ArticleCard } from "@/components/journal/ArticleCard";
import { ArticleRail } from "@/components/journal/ArticleRail";
import { categorySlug } from "@/components/journal/categories";
import { coverAlt } from "@/components/journal/covers";
import { articleDate, articleHeadings, readUnit, relatedArticles } from "@/components/journal/lib";
import { ArrowLink, Breadcrumbs } from "@/components/ui/Kit";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { CLUB } from "@/lib/club";
import { yearsLabel } from "@/lib/format";
import { getPhoto } from "@/lib/photos";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Статья не найдена" };
  const cover = getPhoto(article.cover);
  const author = getCoach(article.author);
  return {
    title: article.title,
    description: article.lead,
    authors: [{ name: author.name, url: `/coaches/${author.slug}` }],
    openGraph: {
      title: article.title,
      description: article.lead,
      type: "article",
      publishedTime: article.date,
      authors: [author.name],
      locale: "ru_RU",
      images: cover ? [{ url: cover.src, width: cover.width, height: cover.height, alt: coverAlt(article.cover, article.title) }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const author = getCoach(article.author);
  const headings = articleHeadings(article);
  const related = relatedArticles(article);
  const cover = getPhoto(article.cover);
  const bodyId = "article-text";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.lead,
    datePublished: article.date,
    inLanguage: "ru",
    image: cover ? [cover.src] : undefined,
    author: { "@type": "Person", name: author.name, jobTitle: author.role },
    publisher: { "@type": "Organization", name: CLUB.name },
  };

  return (
    <>
      <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Head: title and lead on the left, the cover on the right */}
      <header className="pb-16 pt-32 md:pb-24 md:pt-40">
        <div className="container-page">
          <Breadcrumbs
            items={[
              { href: "/", label: "Главная" },
              { href: "/journal", label: "Журнал" },
              { href: `/journal?category=${categorySlug(article.category)}`, label: article.category },
            ]}
            className="mb-8"
          />
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal className="flex flex-col lg:col-span-7">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-dust">
                <Link href={`/journal?category=${categorySlug(article.category)}`} className="chip min-h-[36px] px-3.5 hover:border-chalk">
                  {article.category}
                </Link>
                <time dateTime={article.date}>{articleDate(article.date)}</time>
                <span aria-hidden className="h-1 w-1 rounded-full bg-dust/60" />
                <span>
                  <span className="digits text-[18px] text-chalk">{article.readMinutes}</span> {readUnit(article.readMinutes)}
                </span>
              </p>
              <h1 className="display stretch-narrow mt-7 hyphens-auto break-words text-[clamp(2.1rem,4.8vw,5rem)] leading-[0.9]">{article.title}</h1>
              <p className="mt-7 max-w-[60ch] text-[18px] leading-relaxed text-dust md:text-[20px]">{article.lead}</p>
              <Link href={`/coaches/${author.slug}`} className="group mt-10 flex max-w-max items-center gap-4 lg:mt-auto lg:pt-10">
                <MediaFrame shot={author.photo} alt="" sizes="56px" quiet className="h-14 w-14 flex-none rounded-full" imgClassName="object-[50%_20%]" />
                <span className="text-[14.5px] leading-tight">
                  <span className="block text-dust">Автор</span>
                  <span className="mt-0.5 block font-semibold text-chalk">
                    <span className="link-underline">{author.name}</span>
                  </span>
                  <span className="block text-dust">{author.role}</span>
                </span>
              </Link>
            </Reveal>
            <Reveal className="lg:col-span-5" delay={0.1}>
              <MediaFrame
                shot={article.cover}
                alt={coverAlt(article.cover, article.title)}
                sizes="(min-width: 1100px) 38vw, 92vw"
                priority
                className="aspect-[3/2] rounded-card lg:aspect-[4/5]"
              />
            </Reveal>
          </div>
        </div>
      </header>

      {/* Text with a sticky rail */}
      <div className="container-page grid gap-10 pb-24 lg:grid-cols-12 lg:gap-10 md:pb-32">
        <div className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-28">
            <ArticleRail headings={headings} targetId={bodyId} />
          </div>
        </div>
        <div className="min-w-0 lg:col-span-7 lg:col-start-5">
          <ArticleBody id={bodyId} article={article} headings={headings} />

          {/* About the author */}
          <aside aria-label="Об авторе" className="mt-20 grid grid-cols-[88px_minmax(0,1fr)] gap-5 border-t border-line/10 pt-10 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-7">
            <MediaFrame shot={author.photo} alt={`${author.name}, ${author.role.toLowerCase()}`} sizes="120px" className="aspect-[3/4] rounded-[14px]" />
            <div>
              <p className="eyebrow">Об авторе</p>
              <p className="mt-3 font-display text-[28px] uppercase leading-none text-chalk" style={{ fontWeight: 820, fontVariationSettings: '"wdth" 70' }}>
                {author.name}
              </p>
              <p className="mt-2 text-[14.5px] text-dust">
                {author.role}, стаж {yearsLabel(author.experienceYears)}. Пульс покоя —{" "}
                <span className="digits text-[18px] text-chalk">{author.restingHr}</span> уд/мин.
              </p>
              <ArrowLink href={`/coaches/${author.slug}`} className="mt-5">
                Занятия и расписание тренера
              </ArrowLink>
            </div>
          </aside>
        </div>
      </div>
      </article>

      {/* Read next */}
      {related.length > 0 && (
        <section aria-labelledby="read-next" className="border-t border-line/10 py-24 md:py-28">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <Reveal>
                <h2 id="read-next" className="display stretch-normal text-d-3">
                  Читать дальше
                </h2>
              </Reveal>
              <ArrowLink href="/journal">Все статьи журнала</ArrowLink>
            </div>
            <ul className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2">
              {related.map((a) => (
                <li key={a.slug}>
                  <ArticleCard article={a} heading="h3" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA */}
      <section aria-labelledby="article-cta" className="ecg-grid border-t border-line/10">
        <div className="container-page grid gap-10 py-24 md:py-28 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow mb-4">Теория закончилась</p>
            <h2 id="article-cta" className="display stretch-narrow text-d-2">
              Соберите неделю под свой пульс
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-5" delay={0.1}>
            <p className="text-[17px] leading-relaxed text-dust">
              Цель, свободные дни и удобное время — и конструктор разложит занятия из расписания по вашим зонам. Первое занятие с тренером и замером пульса бесплатно.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <MagneticButton href="/program">Собрать программу</MagneticButton>
              <Link href="/trial" className="btn-ghost">
                Пробное занятие
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
