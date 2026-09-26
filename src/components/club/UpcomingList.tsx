import { SessionRow } from "@/components/schedule/SessionRow";
import type { SessionView } from "@/lib/session-types";
import { relativeDayLabel } from "@/lib/time";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Upcoming sessions grouped by club day: "Сегодня", "Завтра", "Понедельник, 29 сентября".
 * The day labels are computed on the server from `now`, so the client never formats dates.
 */
export function UpcomingList({ sessions, now }: { sessions: SessionView[]; now: Date }) {
  const days: { key: string; items: SessionView[] }[] = [];
  for (const s of sessions) {
    const last = days[days.length - 1];
    if (last && last.key === s.dateKey) last.items.push(s);
    else days.push({ key: s.dateKey, items: [s] });
  }

  return (
    <div className="grid gap-10">
      {days.map((day) => (
        <div key={day.key}>
          <h3 className="mb-3 flex items-baseline gap-3 text-[14px] font-semibold uppercase tracking-[0.14em] text-dust">
            {capitalize(relativeDayLabel(day.key, now))}
            <span className="h-px flex-1 bg-line/10" aria-hidden />
          </h3>
          <ul className="grid gap-2">
            {day.items.map((s) => (
              <li key={s.id}>
                <SessionRow session={s} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
