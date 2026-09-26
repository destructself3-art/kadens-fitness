import clsx from "clsx";
import { Reveal } from "@/components/ui/Reveal";
import { CLUB_NUMBERS, type ClubNumber } from "./copy";

function Value({ n, className }: { n: ClubNumber; className?: string }) {
  return (
    <span className={clsx("flex items-baseline gap-1.5", className)}>
      {n.prefix && <span className="text-[0.32em] font-sans font-medium text-dust">{n.prefix}</span>}
      <span className="digits leading-[0.8] text-chalk">{n.value}</span>
      {n.unit && <span className="text-[0.32em] font-sans font-medium text-dust">{n.unit}</span>}
    </span>
  );
}

/**
 * The club in numbers.
 * line: a compact strip under the tour; board: a scoreboard with the area as the big number.
 */
export function ClubNumbers({ variant = "board", className }: { variant?: "line" | "board"; className?: string }) {
  if (variant === "line") {
    return (
      <dl className={clsx("grid grid-cols-2 border-t border-line/10 sm:grid-cols-4 xl:grid-cols-8", className)}>
        {CLUB_NUMBERS.map((n) => (
          <div key={n.label} className="flex flex-col-reverse justify-end gap-2 border-b border-line/10 py-6 pr-4 xl:border-b-0 xl:border-r xl:px-4 xl:first:pl-0 xl:last:border-r-0">
            <dt className="text-[13.5px] leading-snug text-dust">{n.label}</dt>
            <dd>
              <Value n={n} className="text-[46px]" />
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  const [lead, ...rest] = CLUB_NUMBERS;
  return (
    <dl className={clsx("grid grid-cols-2 border-l border-t border-line/10 lg:grid-cols-4", className)}>
      <Reveal className="col-span-2 flex flex-col-reverse justify-between gap-6 border-b border-r border-line/10 p-5 md:p-8 lg:row-span-2">
        <dt className="max-w-[26ch] text-[15px] text-dust">{lead.label}: шесть студий, бассейн, тренажёрный зал, SPA и детский клуб под одной крышей</dt>
        <dd>
          <Value n={lead} className="text-[clamp(96px,22vw,230px)]" />
        </dd>
      </Reveal>
      {rest.map((n, i) => (
        <Reveal
          key={n.label}
          delay={0.05 * (i % 4)}
          // 7 cells after the big one: the last spans two columns so the grid closes evenly
          className={clsx("flex min-h-[150px] flex-col-reverse justify-between gap-4 border-b border-r border-line/10 p-5 md:min-h-[190px] md:p-7", i === rest.length - 1 && "col-span-2")}
        >
          <dt className="max-w-[20ch] text-[14px] leading-snug text-dust">{n.label}</dt>
          <dd>
            <Value n={n} className="text-[64px] md:text-[84px]" />
          </dd>
        </Reveal>
      ))}
    </dl>
  );
}
