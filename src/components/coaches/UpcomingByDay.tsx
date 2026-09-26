// A coach's next classes grouped by club day: the date on the left, the rows on the right. Server component.
import { SessionRow } from "@/components/schedule/SessionRow";
import type { SessionView } from "@/lib/session-types";
import { formatDay, relativeDayLabel } from "@/lib/time";

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function UpcomingByDay({ sessions, now }: { sessions: SessionView[]; now: Date }) {
  const days: { key: string; items: SessionView[] }[] = [];
  for (const s of sessions) {
    const last = days[days.length - 1];
    if (last && last.key === s.dateKey) last.items.push(s);
    else days.push({ key: s.dateKey, items: [s] });
  }

  return (
    <ol className="grid gap-8">
      {days.map(({ key, items }) => {
        const d = formatDay(key);
        const relative = relativeDayLabel(key, now);
        const near = relative === "сегодня" || relative === "завтра";
        return (
          <li key={key} className="grid gap-4 border-t border-line/10 pt-5 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8">
            <h3 className="flex items-baseline gap-3 md:flex-col md:gap-1">
              <span className="digits text-[56px] leading-[0.8] text-chalk">{d.day}</span>
              <span className="text-[14px] text-dust">
                {near ? (
                  <>
                    <span className="font-semibold text-chalk">{capital(relative)}</span>, {d.weekday}
                  </>
                ) : (
                  <>
                    {d.month}, {d.weekday}
                  </>
                )}
              </span>
            </h3>
            <ul className="grid gap-2.5">
              {items.map((s) => (
                <li key={s.id}>
                  <SessionRow session={s} />
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
