import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { getClass } from "@/data/classes";
import { getSpace } from "@/data/spaces";
import type { ClassSlug, SpaceSlug } from "@/data/types";
import { SOURCE_LABELS, qs, shortDay, stamp } from "@/components/admin/format";
import { miniBtn, miniField, td, th } from "@/components/admin/styles";
import { AdminTitle, BookingStatusPill, Pager, TableScroll, ZoneTag } from "@/components/admin/ui";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { formatPhone, num, plural } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { BOOKING_STATUS_LABELS, type BookingStatus } from "@/lib/session-types";
import { addDays, clubInstant, dateKeyOf, isDateKey, timeOf } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Записи",
  description: "Поиск записей по телефону, коду и имени, фильтры по статусу, источнику и датам занятий.",
};

const PER_PAGE = 50;
const STATUSES = Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[];
const SOURCES = ["site", "program", "admin", "demo"];

type Search = { q?: string; status?: string; source?: string; from?: string; to?: string; page?: string };

/** Case-insensitive search does not work for Cyrillic in SQLite LIKE, so try the usual spellings of a name. */
function nameVariants(q: string) {
  const lower = q.toLowerCase();
  const title = lower.replace(/(^|[\s-])(\S)/g, (_, sep: string, ch: string) => sep + ch.toUpperCase());
  return [...new Set([q, lower, title, lower[0].toUpperCase() + lower.slice(1)])];
}

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const now = new Date();
  const q = (sp.q ?? "").trim().slice(0, 60);
  const status = STATUSES.includes(sp.status as BookingStatus) ? (sp.status as BookingStatus) : undefined;
  const source = SOURCES.includes(sp.source ?? "") ? sp.source : undefined;
  const from = isDateKey(sp.from) ? sp.from : undefined;
  const to = isDateKey(sp.to) ? sp.to : undefined;
  const askedPage = Math.max(1, Math.floor(Number(sp.page)) || 1);

  const or: Prisma.BookingWhereInput[] = [];
  const compact = q.toUpperCase().replace(/\s/g, "");
  // "KD-7K3M9Q", "kd7k3m9q" and "DM-..." all mean a booking code; stored codes always have the hyphen.
  const code = /^(KD|DM)-?[0-9A-Z]{4,}$/.test(compact) ? compact.replace(/^(KD|DM)-?/, "$1-") : null;
  if (code && (compact.includes("-") || /\d/.test(compact))) {
    // Clearly a code: search codes only, so its digits do not match phone numbers.
    or.push({ code: { contains: code } });
  } else if (q) {
    const digits = q.replace(/\D/g, "");
    const phone = digits.length === 11 && digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
    if (phone.length >= 3) or.push({ phone: { contains: phone } });
    if (/^[0-9A-Z-]{4,}$/.test(compact) && /[A-Z]/.test(compact)) or.push({ code: { contains: code ?? compact } });
    if (/\p{L}/u.test(q)) for (const v of nameVariants(q)) or.push({ name: { contains: v } });
  }
  const where: Prisma.BookingWhereInput = {
    ...(status ? { status } : {}),
    ...(source ? { source } : {}),
    ...(from || to
      ? { session: { startsAt: { ...(from ? { gte: clubInstant(from, 0) } : {}), ...(to ? { lt: clubInstant(addDays(to, 1), 0) } : {}) } } }
      : {}),
    // Demo bookings for next week carry creation times in the future; without a search, show what exists by now.
    ...(q ? { OR: or.length ? or : [{ id: "" }] } : { createdAt: { lte: now } }),
  };

  const total = await prisma.booking.count({ where });
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  // A stale link past the last page shows the last page instead of an empty list.
  const page = Math.min(askedPage, pages);
  const rows = await prisma.booking.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
    include: { session: { include: { classType: { select: { slug: true } }, studio: { select: { slug: true } } } } },
  });
  const filters = { q: q || undefined, status, source, from, to };
  const pageHref = (p: number) => `/admin/bookings${qs({ ...filters, page: p > 1 ? p : undefined })}`;
  const filtered = Boolean(q || status || source || from || to);

  return (
    <>
      <AdminTitle
        eyebrow="Все записи на занятия"
        title="Записи"
        sub="Ищите по последним цифрам телефона, коду из подтверждения или имени. Новые сверху; строка ведёт в список группы."
      />

      <form action="/admin/bookings" className="mt-10 grid gap-4 rounded-card border border-line/10 bg-graphite p-5 md:grid-cols-6 md:items-end">
        <div className="md:col-span-2">
          <label htmlFor="bk-q" className="field-label">
            Телефон, код или имя
          </label>
          <input id="bk-q" name="q" type="search" defaultValue={q} placeholder="4567, KD-7K3M9Q или Алсу" className={miniField} />
        </div>
        <div>
          <label htmlFor="bk-status" className="field-label">
            Статус
          </label>
          <select id="bk-status" name="status" defaultValue={status ?? ""} className={miniField}>
            <option value="">Любой</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {BOOKING_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="bk-source" className="field-label">
            Откуда
          </label>
          <select id="bk-source" name="source" defaultValue={source ?? ""} className={miniField}>
            <option value="">Любой источник</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <fieldset className="grid grid-cols-2 gap-2 md:col-span-2">
          <legend className="field-label">Дата занятия</legend>
          <label className="sr-only" htmlFor="bk-from">
            С
          </label>
          <input id="bk-from" name="from" type="date" defaultValue={from} className={miniField} />
          <label className="sr-only" htmlFor="bk-to">
            По
          </label>
          <input id="bk-to" name="to" type="date" defaultValue={to} className={miniField} />
        </fieldset>
        <div className="flex flex-wrap items-center gap-3 md:col-span-6">
          <button type="submit" className="btn-primary !min-h-11">
            Найти
          </button>
          {filtered && (
            <Link href="/admin/bookings" className={miniBtn}>
              Сбросить
            </Link>
          )}
          <p className="ml-auto text-[14px] text-dust" role="status">
            {filtered ? "Найдено" : "Всего"} <span className="digits text-[22px] leading-none text-chalk">{num(total)}</span>{" "}
            {plural(total, "запись", "записи", "записей")}
          </p>
        </div>
      </form>

      {rows.length ? (
        <TableScroll label="Найденные записи" className="mt-8">
          <table className="w-full min-w-[1080px] border-collapse text-[14.5px]">
            <thead>
              <tr>
                <th scope="col" className={th}>
                  Создана
                </th>
                <th scope="col" className={th}>
                  Гость
                </th>
                <th scope="col" className={th}>
                  Телефон
                </th>
                <th scope="col" className={th}>
                  Занятие
                </th>
                <th scope="col" className={th}>
                  Статус
                </th>
                <th scope="col" className={th}>
                  Откуда
                </th>
                <th scope="col" className={th}>
                  <span className="sr-only">Группа</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const cls = getClass(b.session.classType.slug as ClassSlug);
                const day = dateKeyOf(b.session.startsAt);
                return (
                  <tr key={b.id} className={clsx("border-t border-line/10 hover:bg-chalk/[0.025]", b.status === "cancelled" && "text-dust")}>
                    <td className={clsx(td, "whitespace-nowrap text-[13.5px] text-dust")}>{stamp(b.createdAt)}</td>
                    <td className={td}>
                      <span className="block font-semibold text-chalk">{b.name}</span>
                      <span className="digits block text-[15px] leading-tight text-dust">{b.code}</span>
                    </td>
                    <td className={clsx(td, "whitespace-nowrap")}>
                      <a href={`tel:+${b.phone}`} className="link-underline tabular">
                        {formatPhone(b.phone)}
                      </a>
                    </td>
                    <td className={td}>
                      <span className="flex items-center gap-2">
                        <ZoneTag zone={cls.zone} />
                        <span className="font-semibold text-chalk">{cls.title}</span>
                        {b.session.status === "cancelled" && <span className="text-[12px] font-semibold text-pulse">отменено</span>}
                      </span>
                      <span className="mt-0.5 block whitespace-nowrap text-[13px] text-dust">
                        {shortDay(day)}, <span className="digits text-[16px] leading-none text-chalk">{timeOf(b.session.startsAt)}</span> ·
                        «{getSpace(b.session.studio.slug as SpaceSlug).name}»
                      </span>
                    </td>
                    <td className={td}>
                      <BookingStatusPill status={b.status as BookingStatus} />
                    </td>
                    <td className={clsx(td, "whitespace-nowrap text-[13.5px] text-dust")}>{SOURCE_LABELS[b.source] ?? b.source}</td>
                    <td className={clsx(td, "text-right")}>
                      <Link href={`/admin/sessions/${b.sessionId}`} className={miniBtn} aria-label={`Группа: ${cls.title}, ${shortDay(day)} ${timeOf(b.session.startsAt)}`}>
                        Группа
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableScroll>
      ) : (
        <p className="mt-8 rounded-card border border-dashed border-line/20 px-6 py-10 text-dust">
          Ничего не нашлось. Проверьте цифры телефона или код: он выглядит как KD-7K3M9Q.
        </p>
      )}

      <Pager page={page} pages={pages} total={total} perPage={PER_PAGE} href={pageHref} />
    </>
  );
}
