// Small shared building blocks. Server-safe (no hooks): usable from server and client components.
import Link from "next/link";
import clsx from "clsx";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { ZoneId } from "@/data/types";
import { zoneMeta } from "@/lib/zones";
import { MediaFrame } from "./MediaFrame";
import { Reveal } from "./Reveal";

/** Eyebrow + big Science Gothic title + optional lead. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  as = "h2",
  size = "d-2",
  stretch = "normal",
  className,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  as?: "h1" | "h2" | "h3";
  size?: "d-1" | "d-2" | "d-3" | "d-4";
  stretch?: "narrow" | "normal" | "wide" | "ultra";
  className?: string;
  children?: ReactNode;
}) {
  const Tag = as;
  const sizeClass = { "d-1": "text-d-1", "d-2": "text-d-2", "d-3": "text-d-3", "d-4": "text-d-4" }[size];
  return (
    <Reveal className={clsx("max-w-4xl", className)}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <Tag className={clsx("display", sizeClass, `stretch-${stretch}`)}>{title}</Tag>
      {lead && <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-dust md:text-[18px]">{lead}</p>}
      {children}
    </Reveal>
  );
}

/** Zone chip: colored "Z3" plus the zone name. */
export function ZoneBadge({ zone, showName = true, className }: { zone: ZoneId | number; showName?: boolean; className?: string }) {
  const z = zoneMeta(zone);
  return (
    <span className={clsx("inline-flex items-center gap-2 text-[13px] font-medium text-chalk", className)}>
      <span
        className="rounded-md px-1.5 py-0.5 font-display text-[12px] uppercase leading-none"
        style={{ background: z.color, color: z.ink, fontWeight: 800, fontVariationSettings: '"wdth" 110' }}
      >
        Z{z.id}
      </span>
      {showName && z.name}
    </span>
  );
}

export type Crumb = { href?: string; label: string };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Хлебные крошки" className={clsx("text-[13.5px] text-dust", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1">
            {c.href ? (
              <Link href={c.href} className="link-underline hover:text-chalk">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-chalk/80">
                {c.label}
              </span>
            )}
            {i < items.length - 1 && <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Standard top of an inner page: breadcrumbs, eyebrow, huge title, lead, optional photo behind.
 * Leaves room for the fixed header.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  photo,
  photoAlt,
  stretch = "narrow",
  children,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  crumbs?: Crumb[];
  /** Shot id for a darkened background photo */
  photo?: string;
  photoAlt?: string;
  stretch?: "narrow" | "normal" | "wide";
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={clsx("relative isolate overflow-hidden", photo ? "min-h-[62svh] pb-14 pt-36 md:pt-44" : "pb-10 pt-32 md:pt-40", className)}>
      {photo && (
        <>
          <MediaFrame shot={photo} alt={photoAlt ?? ""} sizes="100vw" priority className="absolute inset-0 -z-20" imgClassName="opacity-70" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-asphalt via-asphalt/70 to-asphalt/30" aria-hidden />
        </>
      )}
      <div className="container-page">
        {crumbs && <Breadcrumbs items={crumbs} className="mb-8" />}
        <Reveal>
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1 className={clsx("display text-d-1", `stretch-${stretch}`)}>{title}</h1>
          {lead && <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-dust md:text-[19px]">{lead}</p>}
        </Reveal>
        {children}
      </div>
    </header>
  );
}

/** A big number with a caption, for "клуб в цифрах". */
export function Stat({ value, label, className }: { value: ReactNode; label: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="digits text-[64px] leading-[0.85] text-chalk md:text-[80px]">{value}</p>
      <p className="mt-3 max-w-[22ch] text-[14.5px] text-dust">{label}</p>
    </div>
  );
}

/** Link with an arrow, for "всё расписание →". */
export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={clsx("group inline-flex items-center gap-2 text-[15px] font-semibold text-chalk", className)}>
      <span className="link-underline">{children}</span>
      <span aria-hidden className="transition-transform duration-300 ease-silk group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

/** Empty state: an invitation, not an apology. */
export function EmptyState({ title, text, action, className }: { title: string; text?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={clsx("card grid place-items-center gap-3 px-6 py-14 text-center", className)}>
      <p className="display text-d-4 stretch-normal">{title}</p>
      {text && <p className="max-w-md text-dust">{text}</p>}
      {action}
    </div>
  );
}
