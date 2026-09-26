// Renders every ArticleBlock type. Server component; the zones block is a client island.
import type { ReactNode } from "react";
import type { Article, ArticleBlock } from "@/data/types";
import { zoneMeta } from "@/lib/zones";
import { ArticleZones } from "./ArticleZones";
import type { Heading } from "./lib";

/** "Z3 Темп, 70–80 %: …" -> a zone chip plus the rest of the line. Zone colours only where the text is about a zone. */
function ListItem({ text }: { text: string }) {
  const m = /^Z([1-5])\s+(.*)$/s.exec(text);
  if (!m) {
    return (
      <li className="grid grid-cols-[22px_minmax(0,1fr)] gap-2">
        <span className="mt-[0.8em] h-[2px] w-3 bg-pulse" aria-hidden />
        <span>{text}</span>
      </li>
    );
  }
  const z = zoneMeta(Number(m[1]));
  return (
    <li className="grid grid-cols-[44px_minmax(0,1fr)] items-baseline gap-3">
      <span
        className="rounded-md py-0.5 text-center font-display text-[13px] uppercase leading-[1.5]"
        style={{ background: z.color, color: z.ink, fontWeight: 800, fontVariationSettings: '"wdth" 110' }}
      >
        Z{z.id}
      </span>
      <span>{m[2]}</span>
    </li>
  );
}

function Block({ block, headingId }: { block: ArticleBlock; headingId?: string }): ReactNode {
  switch (block.type) {
    case "p":
      return <p className="mt-6 text-[17.5px] leading-[1.75] text-chalk/90 md:text-[18.5px]">{block.text}</p>;
    case "h2":
      return (
        <h2 id={headingId} className="group mt-16 scroll-mt-28 font-display text-[clamp(1.8rem,3.2vw,2.7rem)] uppercase leading-[0.95] text-chalk md:mt-20" style={{ fontWeight: 820, fontVariationSettings: '"wdth" 76' }}>
          {block.text}
          <a
            href={`#${headingId}`}
            className="ml-3 inline-block align-middle font-sans text-[0.55em] text-dust opacity-0 transition-opacity hover:text-pulse focus-visible:opacity-100 group-hover:opacity-100"
            aria-label={`Ссылка на раздел «${block.text}»`}
          >
            #
          </a>
        </h2>
      );
    case "list":
      return (
        <ul className="mt-6 grid gap-4 text-[17px] leading-[1.65] text-chalk/90 md:text-[18px]">
          {block.items.map((item) => (
            <ListItem key={item} text={item} />
          ))}
        </ul>
      );
    case "quote":
      return (
        <figure className="my-14 border-t border-pulse pt-8 lg:-mx-10">
          <blockquote className="font-display text-[clamp(1.6rem,3vw,2.5rem)] uppercase leading-[1.02] text-chalk" style={{ fontWeight: 760, fontVariationSettings: '"wdth" 64' }}>
            <span className="text-pulse">«</span>
            {block.text}
            <span className="text-pulse">»</span>
          </blockquote>
          {block.author && <figcaption className="mt-5 text-[14px] text-dust">{block.author}</figcaption>}
        </figure>
      );
    case "tip":
      return (
        <aside className="my-10 rounded-r-card border-l-4 border-pulse bg-graphite px-6 py-6 sm:px-8">
          <p className="eyebrow text-pulse">На заметку</p>
          <p className="mt-3 text-[16.5px] leading-relaxed text-chalk/90">{block.text}</p>
        </aside>
      );
    case "zones":
      return <ArticleZones />;
  }
}

/** The article text. h2 blocks get the ids from `headings`, in order. */
export function ArticleBody({ article, headings, id }: { article: Article; headings: Heading[]; id?: string }) {
  let h = 0;
  return (
    <div id={id}>
      {article.body.map((block, i) => (
        <Block key={i} block={block} headingId={block.type === "h2" ? headings[h++]?.id : undefined} />
      ))}
    </div>
  );
}
