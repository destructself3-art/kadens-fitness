// The Ruffier index scale: five grades split at 0, 5, 10 and 15. Server-safe (no hooks):
// the page shows it static, the test result shows it with a marker at the visitor's index.
import clsx from "clsx";
import { RUFFIER_GRADES } from "@/lib/zones";
import { RUFFIER_SHORT } from "./copy";

const MIN = -5;
const MAX = 20;
const THRESHOLDS = [0, 5, 10, 15];

const position = (v: number) => ((Math.min(MAX, Math.max(MIN, v)) - MIN) / (MAX - MIN)) * 100;

/** 6.8 → "6,8", -1.5 → "−1,5": the Russian way, identical on the server and in the browser. */
export const formatIndex = (v: number) => String(Math.round(v * 10) / 10).replace(".", ",").replace("-", "−");

/** Index of the grade in RUFFIER_GRADES. */
export const gradeIndex = (index: number) => {
  const i = RUFFIER_GRADES.findIndex((g) => index <= g.max);
  return i === -1 ? RUFFIER_GRADES.length - 1 : i;
};

export function RuffierScale({ index, className }: { index?: number; className?: string }) {
  const active = index === undefined ? null : gradeIndex(index);
  // The marker stays a few pixels inside the bar at the extremes.
  const at = index === undefined ? 0 : Math.min(98.5, Math.max(1.5, position(index)));
  // Keep the label inside the scale near its ends.
  const shift = at < 10 ? "0%" : at > 90 ? "-100%" : "-50%";

  return (
    <div className={className}>
      <div className={clsx("relative", index !== undefined && "pt-10")}>
        {index !== undefined && (
          <div className="absolute -bottom-1.5 top-0 w-0" style={{ left: `${at}%` }} aria-hidden>
            <span className="digits absolute top-0 whitespace-nowrap text-[26px] leading-none text-pulse" style={{ transform: `translateX(${shift})` }}>
              {formatIndex(index)}
            </span>
            <span className="absolute bottom-0 top-7 w-[3px] -translate-x-1/2 rounded-full bg-pulse shadow-[0_0_0_3px_rgb(var(--graphite))]" />
          </div>
        )}
        <div
          className="flex h-4 gap-[3px]"
          role="img"
          aria-label={
            active === null
              ? "Шкала индекса Руфье: 0 и ниже — отлично, до 5 — хорошо, до 10 — удовлетворительно, до 15 — слабо, больше 15 — плохо"
              : `Ваш индекс ${formatIndex(index ?? 0)}: ${RUFFIER_GRADES[active].label.toLowerCase()}`
          }
        >
          {RUFFIER_GRADES.map((g, i) => (
            <span
              key={g.label}
              className={clsx("flex-1 first:rounded-l-full last:rounded-r-full", active === null || i === active ? "bg-chalk" : "bg-line/15")}
              // Static scale: from bright (excellent) to faint (poor).
              style={active === null ? { opacity: 1 - i * 0.19 } : undefined}
            />
          ))}
        </div>
      </div>
      <div className="relative mt-2 h-6" aria-hidden>
        {THRESHOLDS.map((t) => (
          <span key={t} className="digits absolute top-0 -translate-x-1/2 text-[17px] leading-none text-dust" style={{ left: `${position(t)}%` }}>
            {t}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-5 gap-[3px] text-[11.5px] leading-tight text-dust sm:text-[12.5px]" aria-hidden>
        {RUFFIER_SHORT.map((label, i) => (
          <span key={label} className={clsx("min-w-0 truncate", i === active && "font-semibold text-chalk")}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
