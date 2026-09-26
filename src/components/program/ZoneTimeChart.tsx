// "Time in zones": the week's minutes per zone against the goal's mix. Server-safe, rendered by the client result.
import type { Goal, ZoneId } from "@/data/types";
import { ZoneBadge } from "@/components/ui/Kit";
import { ZONES } from "@/lib/zones";
import { ZONE_GAP_ADVICE, ZONE_ORDINAL_LOC } from "./copy";
import { ZoneMixBar, pct, type ZoneShares } from "./ZoneMix";

function verdict(plan: ZoneShares, goal: Goal): string {
  const worst = ZONES.map((z) => ({ id: z.id, gap: goal.zoneMix[z.id] - plan[z.id] })).sort((a, b) => b.gap - a.gap)[0];
  if (worst.gap < 0.08) return "Неделя близка к цели: ни одной зоне не достаётся меньше, чем просит цель, больше чем на 8% времени.";
  const prep = worst.id === 2 ? "Во" : "В";
  return `${prep} ${ZONE_ORDINAL_LOC[worst.id - 1]} зоне недобор: ${pct(plan[worst.id])} недели вместо ${pct(goal.zoneMix[worst.id])}. Чтобы добрать, ${ZONE_GAP_ADVICE[worst.id]}.`;
}

export function ZoneTimeChart({ minutes, goal }: { minutes: Record<ZoneId, number>; goal: Goal }) {
  const total = ZONES.reduce((sum, z) => sum + (minutes[z.id] ?? 0), 0);
  if (total === 0) return null;
  const plan = Object.fromEntries(ZONES.map((z) => [z.id, (minutes[z.id] ?? 0) / total])) as ZoneShares;

  return (
    <figure className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-14 [&>*]:min-w-0">
      <div>
        <figcaption>
          <p className="eyebrow">Время в зонах</p>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-dust">
            Минуты по фазам каждого занятия: разминка, работа, заминка. Сверху ваша неделя, снизу раскладка, которую просит цель.
          </p>
        </figcaption>
        <div className="mt-8 grid gap-6">
          <div>
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
              <span className="text-[14px] font-semibold text-chalk">Ваша неделя</span>
              <span className="text-[13px] text-dust">
                <span className="digits text-[24px] text-chalk">{total}</span> мин
              </span>
            </div>
            <ZoneMixBar shares={plan} showShare className="h-11" label={`Ваша неделя, ${total} минут: ${ZONES.map((z) => `Z${z.id} ${pct(plan[z.id])}`).join(", ")}`} />
          </div>
          <div>
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
              <span className="text-[14px] font-semibold text-chalk">Цель «{goal.title}»</span>
              <span className="text-[13px] text-dust">ориентир</span>
            </div>
            <ZoneMixBar shares={goal.zoneMix} showShare className="h-11 opacity-80" label={`Цель «${goal.title}»: ${ZONES.map((z) => `Z${z.id} ${pct(goal.zoneMix[z.id])}`).join(", ")}`} />
          </div>
        </div>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-chalk/90">{verdict(plan, goal)}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-left text-[13.5px]">
          <caption className="sr-only">Минуты и доли по пульсовым зонам: неделя и цель</caption>
          <thead>
            <tr className="border-b border-line/10 text-dust">
              <th scope="col" className="py-2.5 pr-3 font-medium">
                Зона
              </th>
              <th scope="col" className="py-2.5 pr-3 text-right font-medium">
                Минут
              </th>
              <th scope="col" className="py-2.5 pr-3 text-right font-medium">
                Неделя
              </th>
              <th scope="col" className="py-2.5 text-right font-medium">
                Цель
              </th>
            </tr>
          </thead>
          <tbody>
            {ZONES.map((z) => (
              <tr key={z.id} className="border-b border-line/[0.06]">
                <th scope="row" className="py-2.5 pr-3 font-normal">
                  <ZoneBadge zone={z.id} />
                </th>
                <td className="digits py-2.5 pr-3 text-right text-[20px] text-chalk">{minutes[z.id] ?? 0}</td>
                <td className="digits py-2.5 pr-3 text-right text-[20px] text-chalk">{pct(plan[z.id])}</td>
                <td className="digits py-2.5 text-right text-[20px] text-dust">{pct(goal.zoneMix[z.id])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
