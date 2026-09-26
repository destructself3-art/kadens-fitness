import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ago, qs, shortDay, SOURCE_LABELS, stamp } from "@/components/admin/format";
import { LeadStatusForm } from "@/components/admin/forms";
import { leadGoal, parseProgram, type ParsedProgram } from "@/components/admin/lead-program";
import { AdminTitle, BookingStatusPill, FilterLink, KpiStrip, LeadStatusPill, Pager, ZoneTag } from "@/components/admin/ui";
import { COACHES } from "@/data/coaches";
import { MEMBERSHIPS } from "@/data/memberships";
import type { Lead, Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { ensureDemoLeads } from "@/lib/demo";
import { formatPhone, plural, rub, yearsLabel } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { LEAD_KIND_LABELS, LEAD_STATUS_LABELS, type BookingStatus, type LeadKind, type LeadStatus } from "@/lib/session-types";
import { heartRateMax, zoneRanges } from "@/lib/zones";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Заявки",
  description: "Заявки с сайта: пробные тренировки, программы для тренера, корпоративные клиенты, детский клуб и абонементы.",
};

const PER_PAGE = 30;
const KINDS = Object.keys(LEAD_KIND_LABELS) as LeadKind[];
const STATUSES = Object.keys(LEAD_STATUS_LABELS) as LeadStatus[];

type Search = { kind?: string; status?: string; page?: string };

export default async function AdminLeadsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const now = new Date();
  await ensureDemoLeads(now);

  const kind = KINDS.includes(sp.kind as LeadKind) ? (sp.kind as LeadKind) : undefined;
  const status = STATUSES.includes(sp.status as LeadStatus) ? (sp.status as LeadStatus) : undefined;
  const where: Prisma.LeadWhereInput = { ...(kind ? { kind } : {}), ...(status ? { status } : {}) };

  const [total, byStatus, byKind, byStatusAll, week] = await Promise.all([
    prisma.lead.count({ where }),
    // Chip counts: each filter row counts under the other filter, so the numbers match what a click shows.
    prisma.lead.groupBy({ by: ["status"], where: kind ? { kind } : {}, _count: { _all: true } }),
    prisma.lead.groupBy({ by: ["kind"], where: status ? { status } : {}, _count: { _all: true } }),
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.count({ where: { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 3600_000), lte: now } } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(1, Math.floor(Number(sp.page)) || 1), pages);
  const leads = await prisma.lead.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
  });

  // Programs point at real sessions: show whether the visitor has already booked them.
  const programs = new Map(leads.map((l) => [l.id, parseProgram(l.program)]));
  const sessionIds = [
    ...new Set(
      [...programs.values()].flatMap((p) => (p?.kind === "program" ? p.items.map((i) => i.sessionId).filter((id): id is string => Boolean(id)) : [])),
    ),
  ];
  const [knownSessions, programBookings] = sessionIds.length
    ? await Promise.all([
        prisma.session.findMany({ where: { id: { in: sessionIds } }, select: { id: true } }),
        prisma.booking.findMany({
          where: { sessionId: { in: sessionIds }, phone: { in: leads.map((l) => l.phone) } },
          select: { sessionId: true, phone: true, status: true },
        }),
      ])
    : [[], []];
  const sessionExists = new Set(knownSessions.map((s) => s.id));
  const bookingOf = new Map(programBookings.map((b) => [`${b.sessionId}|${b.phone}`, b.status as BookingStatus]));

  const countOf = (rows: { _count: { _all: number } }[]) => rows.reduce((n, r) => n + r._count._all, 0);
  const statusCount = (s: LeadStatus, rows = byStatus) => rows.find((r) => r.status === s)?._count._all ?? 0;
  const all = countOf(byStatusAll);
  const converted = statusCount("converted", byStatusAll);
  const href = (p: Partial<Search>) => `/admin/leads${qs({ kind, status, ...p, page: p.page })}`;

  return (
    <>
      <AdminTitle
        eyebrow="Заявки с сайта"
        title={
          <>
            Заявки
            {kind && <span className="block text-dust">{LEAD_KIND_LABELS[kind]}</span>}
          </>
        }
        sub="Новые сверху. Позвоните, отметьте, что связались, а после визита — купил человек абонемент или отказался. Пульс и зоны приходят из пульс-теста на сайте."
      />

      <KpiStrip
        className="mt-10"
        items={[
          { label: "Новые", value: statusCount("new", byStatusAll), note: "ждут звонка", hot: statusCount("new", byStatusAll) > 0 },
          { label: "Связались", value: statusCount("contacted", byStatusAll), note: "в работе" },
          { label: "Купили", value: converted, note: `конверсия ${all ? Math.round((converted / all) * 100) : 0}%` },
          { label: "Отказ", value: statusCount("lost", byStatusAll) },
          { label: "За неделю", value: week, note: `всего ${all} ${plural(all, "заявка", "заявки", "заявок")}` },
        ]}
      />

      <div className="mt-10 grid gap-3">
        <nav aria-label="Статус заявки" className="-mx-1 overflow-x-auto px-1">
          <div className="flex w-max gap-1.5">
            <FilterLink href={href({ status: undefined })} active={!status} count={countOf(byStatus)}>
              Все статусы
            </FilterLink>
            {STATUSES.map((s) => (
              <FilterLink key={s} href={href({ status: s })} active={status === s} count={statusCount(s)}>
                {LEAD_STATUS_LABELS[s]}
              </FilterLink>
            ))}
          </div>
        </nav>
        <nav aria-label="Тип заявки" className="-mx-1 overflow-x-auto px-1">
          <div className="flex w-max gap-1.5">
            <FilterLink href={href({ kind: undefined })} active={!kind} count={countOf(byKind)}>
              Все типы
            </FilterLink>
            {KINDS.map((k) => (
              <FilterLink key={k} href={href({ kind: k })} active={kind === k} count={byKind.find((r) => r.kind === k)?._count._all ?? 0}>
                {LEAD_KIND_LABELS[k]}
              </FilterLink>
            ))}
          </div>
        </nav>
      </div>

      {leads.length ? (
        <ol className="mt-10 border-b border-line/10" aria-label="Список заявок">
          {leads.map((l) => (
            <LeadItem
              key={l.id}
              lead={l}
              program={programs.get(l.id) ?? null}
              now={now}
              sessionExists={sessionExists}
              bookingOf={(sessionId) => bookingOf.get(`${sessionId}|${l.phone}`)}
            />
          ))}
        </ol>
      ) : (
        <p className="mt-10 rounded-card border border-dashed border-line/20 px-6 py-10 text-dust">
          {kind || status ? "С такими фильтрами заявок нет." : "Заявок пока нет: они появятся здесь, как только кто-то оставит их на сайте."}{" "}
          {(kind || status) && (
            <Link href="/admin/leads" className="link-underline font-semibold text-chalk">
              Показать все
            </Link>
          )}
        </p>
      )}

      <Pager page={page} pages={pages} total={total} perPage={PER_PAGE} href={(p) => href({ page: p > 1 ? String(p) : undefined })} />
    </>
  );
}

function LeadItem({
  lead: l,
  program,
  now,
  sessionExists,
  bookingOf,
}: {
  lead: Lead;
  program: ParsedProgram | null;
  now: Date;
  sessionExists: Set<string>;
  bookingOf: (sessionId: string) => BookingStatus | undefined;
}) {
  // `plan` holds a membership slug, or a coach slug when the request came from a coach's page (personal training).
  const plan = l.plan ? MEMBERSHIPS.find((m) => m.slug === l.plan) : undefined;
  const coach = l.plan && !plan ? COACHES.find((c) => c.slug === l.plan) : undefined;
  const goal = leadGoal(l.goal);
  const zones = l.age && l.restingHr ? zoneRanges(l.restingHr, l.age) : null;
  const details: { label: string; value: React.ReactNode }[] = [];
  if (l.company) details.push({ label: "Компания", value: l.company });
  if (goal) details.push({ label: "Цель", value: goal });
  if (l.age) details.push({ label: "Возраст", value: <span className="digits text-[20px] leading-none">{yearsLabel(l.age)}</span> });
  if (l.restingHr)
    details.push({
      label: "Пульс покоя",
      value: (
        <span className="digits text-[20px] leading-none">
          {l.restingHr} <span className="text-dust">уд/мин</span>
        </span>
      ),
    });
  if (plan)
    details.push({
      label: "Абонемент",
      value: (
        <>
          «{plan.name}»,{" "}
          <span className="digits text-[18px] leading-none">{rub(plan.price)}</span> {plan.unit}
        </>
      ),
    });
  else if (coach)
    details.push({
      label: "Персональная",
      value: (
        <>
          {coach.name}
          {coach.personalPrice ? (
            <>
              , <span className="digits text-[18px] leading-none">{rub(coach.personalPrice)}</span> за занятие
            </>
          ) : null}
        </>
      ),
    });
  else if (l.plan) details.push({ label: "Выбор на сайте", value: l.plan });

  return (
    <li id={`lead-${l.id}`} className="scroll-mt-32 border-t border-line/10 py-8 target:bg-chalk/[0.03]">
      <article
        aria-labelledby={`lead-${l.id}-name`}
        className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.35fr)_minmax(0,0.85fr)]"
      >
        {/* Who and how to reach */}
        <header className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-dust">
            <span className={clsx(l.status === "new" && "text-pulse")}>{LEAD_KIND_LABELS[l.kind as LeadKind] ?? l.kind}</span>
            <span aria-hidden>·</span>
            <time dateTime={l.createdAt.toISOString()} className="normal-case tracking-normal">
              {ago(l.createdAt, now)}
            </time>
          </p>
          <h2 id={`lead-${l.id}-name`} className="mt-2 break-words text-[22px] font-semibold leading-tight text-chalk">
            {l.name}
          </h2>
          <p className="mt-1">
            <a href={`tel:+${l.phone}`} className="inline-flex min-h-11 items-center text-[17px] text-chalk">
              <span className="link-underline tabular">{formatPhone(l.phone)}</span>
            </a>
          </p>
          {l.email && (
            <p className="mt-1 break-all text-[14.5px]">
              <a href={`mailto:${l.email}`} className="inline-flex min-h-11 items-center text-dust hover:text-chalk">
                <span className="link-underline">{l.email}</span>
              </a>
            </p>
          )}
          <div className="mt-3">
            <LeadStatusPill status={l.status} />
          </div>
        </header>

        {/* What they want */}
        <div className="min-w-0">
          {details.length > 0 && (
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-2 text-[15px]">
              {details.map((d) => (
                <div key={d.label} className="contents">
                  <dt className="text-dust">{d.label}</dt>
                  <dd className="min-w-0 break-words text-chalk">{d.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {zones && l.age && (
            <div className="mt-5">
              <p className="text-[12.5px] text-dust">
                Зоны по Карвонену · ЧСС макс. <span className="digits text-[16px] leading-none text-chalk">{heartRateMax(l.age)}</span>
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2" aria-label="Личные пульсовые зоны">
                {zones.map((z) => (
                  <li key={z.id} className="flex items-center gap-1.5">
                    <ZoneTag zone={z.id} />
                    <span className="digits text-[18px] leading-none text-chalk">
                      {z.lo}–{z.hi}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {l.comment && (
            <blockquote className="mt-5 border-l-2 border-line/20 pl-4 text-[15px] leading-relaxed text-chalk">«{l.comment}»</blockquote>
          )}

          {program && <ProgramBlock program={program} sessionExists={sessionExists} bookingOf={bookingOf} />}

          {!details.length && !zones && !l.comment && !program && <p className="text-[14.5px] text-dust">Без подробностей: только имя и телефон.</p>}
        </div>

        {/* Status */}
        <div className="min-w-0">
          <LeadStatusForm id={l.id} status={l.status} name={l.name} />
          <p className="mt-3 text-[12.5px] text-dust">
            Создана {stamp(l.createdAt)} · {SOURCE_LABELS[l.source] ?? l.source}
          </p>
        </div>
      </article>
    </li>
  );
}

function ProgramBlock({
  program,
  sessionExists,
  bookingOf,
}: {
  program: ParsedProgram;
  sessionExists: Set<string>;
  bookingOf: (sessionId: string) => BookingStatus | undefined;
}) {
  if (program.kind === "raw") {
    return (
      <div className="mt-5 rounded-2xl border border-line/10 bg-graphite p-4">
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-dust">Программа</p>
        <p className="mt-2 whitespace-pre-wrap break-words text-[14px] text-chalk">{program.text}</p>
      </div>
    );
  }
  return (
    <div className="mt-5 rounded-2xl border border-line/10 bg-graphite p-4 sm:p-5">
      <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-dust">Программа с сайта</p>
      {program.facts.length > 0 && (
        <dl className="mt-3 grid gap-x-5 gap-y-1.5 text-[14px] sm:grid-cols-[auto_minmax(0,1fr)]">
          {program.facts.map((f) => (
            <div key={f.label} className="contents">
              <dt className="text-dust">{f.label}</dt>
              <dd className="mb-1.5 min-w-0 break-words text-chalk sm:mb-0">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {program.items.length > 0 && (
        <ol className="mt-4 border-t border-line/10" aria-label="Занятия программы">
          {program.items.map((item, i) => {
            const booked = item.sessionId ? bookingOf(item.sessionId) : undefined;
            const linked = item.sessionId && sessionExists.has(item.sessionId);
            return (
              <li
                key={`${item.sessionId ?? item.title}-${i}`}
                className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 border-b border-line/10 py-2.5 last:border-b-0 sm:grid-cols-[88px_minmax(0,1fr)_auto]"
              >
                <span className="flex flex-col">
                  {item.date && <span className="text-[11.5px] text-dust">{shortDay(item.date)}</span>}
                  <span className="digits text-[22px] leading-none text-chalk">{item.time ?? "—"}</span>
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  {item.zone && <ZoneTag zone={item.zone} />}
                  {linked ? (
                    <Link href={`/admin/sessions/${item.sessionId}`} className="flex min-h-11 min-w-0 items-center font-semibold text-chalk">
                      <span className="link-underline truncate">{item.title}</span>
                    </Link>
                  ) : (
                    <span className="truncate font-semibold text-chalk">{item.title}</span>
                  )}
                </span>
                <span className="col-start-2 sm:col-start-auto">
                  {booked ? <BookingStatusPill status={booked} /> : <span className="text-[12.5px] text-dust">не записан</span>}
                </span>
              </li>
            );
          })}
        </ol>
      )}
      {program.items.length > 0 && (
        <p className="mt-3 text-[12.5px] leading-snug text-dust">
          Записать человека на занятие можно из его группы: откройте занятие и заполните «Записать гостя».
        </p>
      )}
    </div>
  );
}

