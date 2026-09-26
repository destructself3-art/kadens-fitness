// Admin building blocks. Server-safe (no hooks), shared by every admin page.
import Link from "next/link";
import clsx from "clsx";
import type { ReactNode } from "react";
import { BeatDot } from "@/components/pulse/Beat";
import { num } from "@/lib/format";
import { BOOKING_STATUS_LABELS, LEAD_STATUS_LABELS, type BookingStatus, type LeadStatus, type SessionView } from "@/lib/session-types";
import { zoneMeta } from "@/lib/zones";
import { fillPct } from "./format";
import { miniBtn } from "./styles";

/** Page top: eyebrow, a Science Gothic title and an aside (navigation, filters). */
export function AdminTitle({ eyebrow, title, sub, aside }: { eyebrow: ReactNode; title: ReactNode; sub?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display stretch-narrow mt-3 text-[clamp(2.6rem,6.2vw,5.6rem)] leading-[0.84]">{title}</h1>
        {sub && <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-dust">{sub}</p>}
      </div>
      {aside}
    </div>
  );
}

/** One figure of a KPI strip. */
export type KpiItem = { label: string; value: ReactNode; note?: ReactNode; hot?: boolean };

/** A strip of big Handjet numbers separated by hairlines, like a treadmill console. */
export function KpiStrip({ items, className }: { items: KpiItem[]; className?: string }) {
  return (
    <dl
      className={clsx(
        "grid grid-cols-2 overflow-hidden rounded-card border border-line/10 bg-graphite sm:grid-cols-3",
        items.length >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-4",
        className,
      )}
    >
      {items.map((k) => (
        <div
          key={k.label}
          className="relative -mb-px -mr-px flex flex-col border-b border-r border-line/10 px-5 py-5 max-sm:last:odd:col-span-2"
        >
          <dt className="text-[13px] font-medium text-dust">{k.label}</dt>
          <dd className={clsx("digits mt-2 text-[56px] leading-[0.8]", k.hot ? "text-pulse" : "text-chalk")}>{k.value}</dd>
          {k.note && <dd className="mt-3 text-[12.5px] leading-snug text-dust">{k.note}</dd>}
        </div>
      ))}
    </dl>
  );
}

/** Seats taken out of capacity, with a hairline bar. Full turns scarlet. */
export function FillMeter({ taken, capacity, waitlist = 0, className }: { taken: number; capacity: number; waitlist?: number; className?: string }) {
  const pct = fillPct(taken, capacity);
  const full = taken >= capacity;
  return (
    <span className={clsx("inline-flex min-w-[124px] flex-col gap-1.5", className)}>
      <span className="flex items-baseline gap-2">
        <span className="digits text-[22px] leading-none text-chalk">
          {taken}
          <span className="text-dust">/{capacity}</span>
        </span>
        <span className={clsx("digits text-[17px] leading-none", full ? "text-pulse" : "text-dust")}>{pct}%</span>
        {waitlist > 0 && <span className="whitespace-nowrap text-[12px] font-semibold text-pulse">+{waitlist} ждут</span>}
      </span>
      <span className="block h-[3px] w-full overflow-hidden rounded-full bg-line/10" aria-hidden>
        <span className={clsx("block h-full rounded-full", full ? "bg-pulse" : "bg-chalk/80")} style={{ width: `${Math.min(100, pct)}%` }} />
      </span>
    </span>
  );
}

/** Z-number chip in the class zone color: the only place zone colors appear in the panel. */
export function ZoneTag({ zone, className }: { zone: number; className?: string }) {
  const z = zoneMeta(zone);
  return (
    <span
      className={clsx("inline-flex h-[20px] items-center rounded-[5px] px-1.5 font-display text-[11px] uppercase leading-none", className)}
      style={{ background: z.color, color: z.ink, fontWeight: 800, fontVariationSettings: '"wdth" 110' }}
      title={`Зона ${z.id}, ${z.name}`}
    >
      Z{z.id}
    </span>
  );
}

const pill = "inline-flex min-h-[26px] items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-[12.5px] font-semibold";

const BOOKING_PILL: Record<BookingStatus, string> = {
  booked: "border-chalk/40 text-chalk",
  waitlist: "border-dashed border-chalk/35 text-dust",
  attended: "border-chalk bg-chalk text-asphalt",
  no_show: "border-pulse/60 text-pulse",
  cancelled: "border-line/15 text-dust line-through decoration-dust/60",
};

export function BookingStatusPill({ status, position }: { status: BookingStatus; position?: number | null }) {
  return (
    <span className={clsx(pill, BOOKING_PILL[status] ?? BOOKING_PILL.booked)}>
      {BOOKING_STATUS_LABELS[status] ?? status}
      {status === "waitlist" && position ? <span className="digits text-[14px] leading-none">№{position}</span> : null}
    </span>
  );
}

const LEAD_PILL: Record<LeadStatus, string> = {
  new: "border-pulse bg-pulse text-asphalt",
  contacted: "border-chalk/40 text-chalk",
  converted: "border-chalk bg-chalk text-asphalt",
  lost: "border-line/15 text-dust line-through decoration-dust/60",
};

export function LeadStatusPill({ status }: { status: string }) {
  const s = (status in LEAD_PILL ? status : "new") as LeadStatus;
  return <span className={clsx(pill, LEAD_PILL[s])}>{LEAD_STATUS_LABELS[s]}</span>;
}

/** Where a class stands right now: live, done, cancelled, upcoming. */
export function SessionState({ session, className }: { session: SessionView; className?: string }) {
  if (session.status === "cancelled") return <span className={clsx(pill, "border-pulse/50 text-pulse", className)}>Отменено</span>;
  if (session.live)
    return (
      <span className={clsx(pill, "border-pulse bg-pulse/10 text-pulse", className)}>
        <BeatDot className="h-1.5 w-1.5" /> Идёт
      </span>
    );
  if (session.started) return <span className={clsx(pill, "border-line/15 text-dust", className)}>Прошло</span>;
  if (session.left === 0) return <span className={clsx(pill, "border-chalk/40 text-chalk", className)}>Мест нет</span>;
  return <span className={clsx(pill, "border-line/15 text-dust", className)}>По плану</span>;
}

/** Filter chip that is a link: works without JavaScript and keeps the state in the URL. */
export function FilterLink({ href, active, children, count }: { href: string; active: boolean; children: ReactNode; count?: number }) {
  return (
    <Link href={href} data-active={active} aria-current={active ? "true" : undefined} className="chip min-h-11 px-4 hover:border-line/40" scroll={false}>
      {children}
      {count !== undefined && <span className={clsx("digits text-[15px] leading-none", active ? "text-asphalt/70" : "text-dust")}>{count}</span>}
    </Link>
  );
}

/**
 * A table that scrolls sideways inside its own box on narrow screens.
 * `relative` keeps absolutely positioned children (sr-only labels) inside the box, or they would widen the page.
 */
export function TableScroll({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className={clsx("relative overflow-x-auto rounded-card border border-line/10 bg-graphite", className)}>
      {children}
    </div>
  );
}

/** "← 22 сен · Сегодня · 24 сен →" style navigation between periods. */
export function PeriodNav({
  prev,
  next,
  current,
  prevLabel,
  nextLabel,
  currentLabel,
  label,
}: {
  prev: string | null;
  next: string | null;
  current: string | null;
  prevLabel: string;
  nextLabel: string;
  currentLabel: string;
  label: string;
}) {
  const step = (href: string | null, children: ReactNode) =>
    href ? (
      <Link href={href} className={miniBtn}>
        {children}
      </Link>
    ) : (
      <span aria-disabled="true" className={clsx(miniBtn, "cursor-not-allowed opacity-35")}>
        {children}
      </span>
    );
  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-2">
      {step(
        prev,
        <>
          <span aria-hidden>←</span> {prevLabel}
        </>,
      )}
      {current && (
        <Link href={current} className={clsx(miniBtn, "border-chalk/50")}>
          {currentLabel}
        </Link>
      )}
      {step(
        next,
        <>
          {nextLabel} <span aria-hidden>→</span>
        </>,
      )}
    </nav>
  );
}

/** A class in a compact list: time, zone, title, studio and coach, fill. Links to the roster. */
export function SessionLine({ session: s, dateLabel }: { session: SessionView; dateLabel?: string }) {
  return (
    <Link
      href={`/admin/sessions/${s.id}`}
      className="group grid grid-cols-[62px_minmax(0,1fr)] items-center gap-x-4 gap-y-2 border-b border-line/10 py-3.5 transition-colors last:border-b-0 hover:bg-chalk/[0.03] sm:grid-cols-[62px_minmax(0,1fr)_auto]"
    >
      <span className="flex flex-col">
        {dateLabel && <span className="text-[11.5px] text-dust">{dateLabel}</span>}
        <span className="digits text-[30px] leading-none text-chalk">{s.time}</span>
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <ZoneTag zone={s.zone} />
          <span className={clsx("truncate text-[15.5px] font-semibold group-hover:underline", s.status === "cancelled" && "text-dust line-through")}>
            {s.classTitle}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-[13px] text-dust">
          «{s.studioName}» · {s.coachName}
          {s.regularCoachName && <span className="font-semibold text-chalk"> · замена</span>}
        </span>
      </span>
      <FillMeter taken={s.taken} capacity={s.capacity} waitlist={s.waitlist} className="col-start-2 sm:col-start-auto" />
    </Link>
  );
}

/** Small section heading inside a page. */
export function BlockTitle({ children, aside, id }: { children: ReactNode; aside?: ReactNode; id?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <h2 id={id} className="display stretch-normal text-[clamp(1.35rem,2.2vw,1.9rem)] leading-none">
        {children}
      </h2>
      {aside}
    </div>
  );
}

/** Page links for long lists: "← Назад 1 2 3 … 9 Вперёд →" and "51–100 из 310". Renders nothing for one page. */
export function Pager({
  page,
  pages,
  total,
  perPage,
  href,
  label = "Страницы",
}: {
  page: number;
  pages: number;
  total: number;
  perPage: number;
  href: (page: number) => string;
  label?: string;
}) {
  if (pages <= 1) return null;
  const shown = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 2);
  return (
    <nav aria-label={label} className="mt-8 flex flex-wrap items-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} className={miniBtn} rel="prev">
          <span aria-hidden>←</span> Назад
        </Link>
      )}
      {shown.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - shown[i - 1] > 1 && (
            <span className="px-1 text-dust" aria-hidden>
              …
            </span>
          )}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Страница ${p}`}
            className={clsx(miniBtn, "digits min-w-11 !px-3 !text-[18px]", p === page && "border-chalk bg-chalk !text-asphalt")}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} className={miniBtn} rel="next">
          Вперёд <span aria-hidden>→</span>
        </Link>
      )}
      <span className="ml-auto text-[13.5px] text-dust">
        <span className="digits text-[17px] leading-none text-chalk">
          {num((page - 1) * perPage + 1)}–{num(Math.min(total, page * perPage))}
        </span>{" "}
        из <span className="digits text-[17px] leading-none text-chalk">{num(total)}</span>
      </span>
    </nav>
  );
}

/** A percentage with a hairline bar, for averages (fill, attendance). Shows a dash when there is no data. */
export function PctMeter({ value, note, className }: { value: number | null; note?: ReactNode; className?: string }) {
  return (
    <span className={clsx("inline-flex min-w-[112px] flex-col gap-1.5", className)}>
      <span className="flex items-baseline gap-2">
        <span className={clsx("digits text-[22px] leading-none", value === null ? "text-dust" : "text-chalk")}>{value === null ? "—" : `${value}%`}</span>
        {note && <span className="whitespace-nowrap text-[12px] text-dust">{note}</span>}
      </span>
      <span className="block h-[3px] w-full overflow-hidden rounded-full bg-line/10" aria-hidden>
        {value !== null && <span className="block h-full rounded-full bg-chalk/80" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />}
      </span>
    </span>
  );
}
