// Journal cards. Server components: the journal index renders them and hands them to the client filter as nodes.
import Link from "next/link";
import clsx from "clsx";
import { getCoach } from "@/data/coaches";
import type { Article } from "@/data/types";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { coverAlt } from "./covers";
import { articleDate, readUnit } from "./lib";

type Props = { article: Article; heading?: "h2" | "h3"; className?: string };

function Meta({ article, className }: { article: Article; className?: string }) {
  return (
    <p className={clsx("flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-dust", className)}>
      <span className="eyebrow text-chalk">{article.category}</span>
      <span aria-hidden className="h-1 w-1 rounded-full bg-dust/60" />
      <time dateTime={article.date}>{articleDate(article.date)}</time>
    </p>
  );
}

/** The newest article: a large cover and the lead. */
export function FeaturedArticle({ article, heading: H = "h2", className }: Props) {
  const author = getCoach(article.author);
  return (
    <Link href={`/journal/${article.slug}`} className={clsx("group grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10", className)}>
      <div className="relative overflow-hidden rounded-card lg:col-span-7">
        <MediaFrame
          shot={article.cover}
          alt={coverAlt(article.cover, article.title)}
          sizes="(min-width: 1100px) 56vw, 92vw"
          priority
          className="aspect-[4/3] lg:aspect-[16/11]"
          imgClassName="transition-transform duration-[1.2s] ease-silk group-hover:scale-[1.03]"
        />
        <span className="absolute left-4 top-4 rounded-full bg-asphalt/80 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-chalk">Свежее</span>
      </div>
      <div className="lg:col-span-5 lg:pb-2">
        <Meta article={article} />
        <H className="display stretch-narrow mt-5 hyphens-auto break-words text-[clamp(2.1rem,3.8vw,4rem)] leading-[0.9]">
          <span className="link-underline">{article.title}</span>
        </H>
        <p className="mt-6 text-[17px] leading-relaxed text-dust">{article.lead}</p>
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-line/10 pt-5">
          <span className="flex items-center gap-3">
            <MediaFrame shot={author.photo} alt="" sizes="48px" quiet className="h-12 w-12 flex-none rounded-full" imgClassName="object-[50%_20%]" />
            <span className="text-[14px] leading-tight">
              <span className="block font-semibold text-chalk">{author.name}</span>
              <span className="block text-dust">{author.role}</span>
            </span>
          </span>
          <span className="flex-none text-[13px] text-dust">
            <span className="digits text-[26px] leading-none text-chalk">{article.readMinutes}</span> {readUnit(article.readMinutes)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/** A regular journal card. */
export function ArticleCard({ article, heading: H = "h2", className }: Props) {
  const author = getCoach(article.author);
  return (
    <Link href={`/journal/${article.slug}`} className={clsx("group flex h-full flex-col", className)}>
      <div className="overflow-hidden rounded-card">
        <MediaFrame
          shot={article.cover}
          alt=""
          sizes="(min-width: 1100px) 30vw, (min-width: 560px) 45vw, 92vw"
          className="aspect-[3/2]"
          imgClassName="transition-transform duration-700 ease-silk group-hover:scale-[1.04]"
        />
      </div>
      <Meta article={article} className="mt-5" />
      <H className="mt-3 font-display text-[27px] uppercase leading-[0.95] text-chalk" style={{ fontWeight: 840, fontVariationSettings: '"wdth" 66' }}>
        <span className="link-underline">{article.title}</span>
      </H>
      <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-dust">{article.lead}</p>
      <p className="mt-auto flex items-center justify-between gap-4 pt-5 text-[13.5px] text-dust">
        <span>{author.name}</span>
        <span className="flex-none">
          <span className="digits text-[20px] leading-none text-chalk">{article.readMinutes}</span> мин
        </span>
      </p>
    </Link>
  );
}
