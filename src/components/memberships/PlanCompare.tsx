// Comparison table of the plans. Server component: plans are columns, features are rows.
import type { ReactNode } from "react";
import clsx from "clsx";
import { Check, Minus } from "lucide-react";
import type { Membership } from "@/data/types";
import { rub } from "@/lib/format";
import { PLAN_COMPARE } from "./content";

const Yes = ({ note }: { note?: string }) => (
  <span className="inline-flex items-start gap-2">
    <Check className="mt-0.5 h-4 w-4 flex-none text-pulse" aria-hidden />
    <span className={note ? "text-chalk" : "sr-only"}>{note ?? "Да"}</span>
  </span>
);
const No = () => (
  <span className="inline-flex text-dust/60">
    <Minus className="h-4 w-4" aria-hidden />
    <span className="sr-only">Нет</span>
  </span>
);
const Count = ({ n, unit }: { n: number; unit: string }) =>
  n > 0 ? (
    <span>
      <span className="digits text-[22px] leading-none text-chalk">{n}</span> <span className="text-dust">{unit}</span>
    </span>
  ) : (
    <No />
  );

type Row = { label: string; cell: (p: Membership) => ReactNode };

const ROWS: Row[] = [
  {
    label: "Цена",
    cell: (p) => (
      <span>
        <span className="digits text-[26px] leading-none text-chalk">{rub(p.price)}</span>
        <span className="block text-[13px] text-dust">{p.unit}</span>
      </span>
    ),
  },
  {
    label: "В месяц при оплате за год",
    cell: (p) => (p.priceYearly ? <span className="digits text-[22px] leading-none text-chalk">{rub(p.priceYearly)}</span> : <No />),
  },
  { label: "Карты", cell: (p) => PLAN_COMPARE[p.slug].who },
  { label: "Часы посещения", cell: (p) => PLAN_COMPARE[p.slug].hours },
  {
    label: "Бассейн 25 м",
    cell: (p) => {
      const pool = PLAN_COMPARE[p.slug].pool;
      return pool === true ? <Yes /> : <Yes note={pool} />;
    },
  },
  { label: "Групповые занятия", cell: (p) => PLAN_COMPARE[p.slug].classes },
  { label: "Пилатес на реформерах", cell: (p) => (p.reformer ? <Yes /> : <No />) },
  { label: "SPA: сауна, хаммам, купель", cell: (p) => (p.spa ? <Yes /> : <No />) },
  { label: "Детский клуб", cell: (p) => (p.kidsClub ? <Yes /> : <No />) },
  { label: "Персональные тренировки", cell: (p) => <Count n={p.personalSessions} unit="в месяц" /> },
  { label: "Дни заморозки", cell: (p) => <Count n={p.freezeDays} unit="в год" /> },
  { label: "Гостевые визиты", cell: (p) => <Count n={p.guestVisits} unit="в месяц" /> },
];

/** Opaque background of the section the table sits on: sticky cells must cover what scrolls under them. */
export const COMPARE_BG = "bg-[#100f0e]";

export function PlanCompare({ plans, caption, labelledBy }: { plans: Membership[]; caption: string; labelledBy: string }) {
  return (
    <div
      role="region"
      aria-labelledby={labelledBy}
      tabIndex={0}
      className="relative -mx-4 overflow-x-auto overscroll-x-contain px-4 pb-2 focus-visible:outline-offset-[-2px] sm:mx-0 sm:px-0"
    >
      <table className="w-full min-w-[1040px] table-fixed border-separate border-spacing-0 text-left text-[14.5px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <td className={clsx("sticky left-0 z-10 w-[190px] lg:w-[220px]", COMPARE_BG)} />
            {plans.map((p) => (
              <th
                key={p.slug}
                scope="col"
                className={clsx(
                  "px-4 pb-5 pt-5 align-bottom",
                  p.highlight ? "rounded-t-card border-x border-t border-pulse/60 bg-raised" : "",
                )}
              >
                {p.highlight && <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-pulse">Чаще всего</span>}
                <span className="font-display text-[22px] uppercase leading-none text-chalk" style={{ fontVariationSettings: '"wdth" 70', fontWeight: 850 }}>
                  {p.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => {
            const last = i === ROWS.length - 1;
            return (
              <tr key={row.label} className="group/row">
                <th scope="row" className={clsx("sticky left-0 z-10 border-t border-line/10 py-4 pr-4 align-top text-[14px] font-medium text-dust", COMPARE_BG)}>
                  {row.label}
                </th>
                {plans.map((p) => (
                  <td
                    key={p.slug}
                    className={clsx(
                      "border-t border-line/10 px-4 py-4 align-top text-chalk/90 transition-colors group-hover/row:bg-chalk/[0.02]",
                      p.highlight && "border-x border-x-pulse/60 bg-raised group-hover/row:bg-raised",
                      p.highlight && last && "rounded-b-card border-b border-b-pulse/60",
                    )}
                  >
                    {row.cell(p)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
