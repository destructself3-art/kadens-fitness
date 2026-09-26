// Places in a class as dots: taken ones filled with the class zone color, free ones outlined, the waitlist dashed.
// Server-safe.
import clsx from "clsx";
import { plural } from "@/lib/format";
import type { SessionView } from "@/lib/session-types";
import { zoneMeta } from "@/lib/zones";

const WAITLIST_DOTS = 10;

export function SeatsMap({ session, className }: { session: SessionView; className?: string }) {
  const z = zoneMeta(session.zone);
  const { capacity, taken, left, waitlist } = session;
  const perRow = Math.min(capacity, 10);
  const cancelled = session.status === "cancelled";
  const summary = cancelled
    ? `Занятие отменено, было ${capacity} мест`
    : `Занято ${taken} из ${capacity} мест${waitlist ? `, в листе ожидания ${waitlist}` : ""}`;

  return (
    <figure className={className}>
      <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
        <p>
          <span className="digits text-[72px] leading-[0.8] text-chalk md:text-[96px]">{cancelled ? "—" : left}</span>
          <span className="mt-2 block text-[14px] text-dust">
            {cancelled ? "мест нет: занятие отменено" : `${plural(left, "место свободно", "места свободно", "мест свободно")} из ${capacity}`}
          </span>
        </p>
        {waitlist > 0 && (
          <p>
            <span className="digits text-[44px] leading-[0.8] text-chalk md:text-[56px]">{waitlist}</span>
            <span className="mt-2 block text-[14px] text-dust">{plural(waitlist, "человек", "человека", "человек")} в листе ожидания</span>
          </p>
        )}
      </div>

      <div role="img" aria-label={summary} className={clsx("mt-8 grid w-fit gap-2 sm:gap-2.5", cancelled && "opacity-40")} style={{ gridTemplateColumns: `repeat(${perRow}, auto)` }}>
        {Array.from({ length: capacity }, (_, i) => {
          const full = i < taken;
          return (
            <span
              key={i}
              className="h-[22px] w-[22px] rounded-full sm:h-6 sm:w-6"
              style={full ? { background: z.color } : { boxShadow: "inset 0 0 0 1.5px rgb(var(--line) / 0.3)" }}
              aria-hidden
            />
          );
        })}
      </div>

      {waitlist > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-2.5" aria-hidden>
          {Array.from({ length: Math.min(waitlist, WAITLIST_DOTS) }, (_, i) => (
            <span key={i} className="h-[22px] w-[22px] rounded-full border-[1.5px] border-dashed sm:h-6 sm:w-6" style={{ borderColor: z.color }} />
          ))}
          {waitlist > WAITLIST_DOTS && <span className="digits text-[18px] text-dust">+{waitlist - WAITLIST_DOTS}</span>}
          <span className="ml-1 text-[12.5px] text-dust">очередь</span>
        </div>
      )}

      <figcaption className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] text-dust">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: z.color }} aria-hidden />
          занято
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ boxShadow: "inset 0 0 0 1.5px rgb(var(--line) / 0.4)" }} aria-hidden />
          свободно
        </span>
        {waitlist > 0 && (
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full border border-dashed" style={{ borderColor: z.color }} aria-hidden />
            лист ожидания
          </span>
        )}
      </figcaption>
    </figure>
  );
}
