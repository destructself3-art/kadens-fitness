// Stacked zone bars. Server-safe (no hooks): used by the builder, the result chart and the page sections.
import clsx from "clsx";
import type { ZoneId } from "@/data/types";
import { ZONES } from "@/lib/zones";

export type ZoneShares = Record<ZoneId, number>;

export const pct = (share: number) => `${Math.round(share * 100)}%`;

/** "Z1 10%, Z2 40%, …" for screen readers and tooltips. */
export function describeShares(shares: ZoneShares): string {
  return ZONES.filter((z) => shares[z.id] > 0.004)
    .map((z) => `Z${z.id} ${z.name} ${pct(shares[z.id])}`)
    .join(", ");
}

/**
 * One stacked bar: a segment per zone, proportional to its share, 2 px gaps between segments.
 * Segments wide enough get a "Z2" label (and the share when `showShare`).
 */
export function ZoneMixBar({
  shares,
  label,
  className,
  showLabels = true,
  showShare = false,
}: {
  shares: ZoneShares;
  /** Accessible name; defaults to the list of shares */
  label?: string;
  className?: string;
  showLabels?: boolean;
  showShare?: boolean;
}) {
  const entries = ZONES.map((z) => ({ z, v: shares[z.id] ?? 0 })).filter((e) => e.v > 0.004);
  return (
    <div role="img" aria-label={label ?? describeShares(shares)} className={clsx("flex h-9 w-full gap-[2px]", className)}>
      {entries.map(({ z, v }) => (
        <span
          key={z.id}
          title={`Z${z.id} ${z.name}: ${pct(v)}`}
          className="flex min-w-0 items-center overflow-hidden whitespace-nowrap px-1.5 font-display text-[12px] uppercase leading-none first:rounded-l-[6px] last:rounded-r-[6px] sm:px-2"
          style={{ flexGrow: v, flexBasis: 0, background: z.color, color: z.ink, fontWeight: 800, fontVariationSettings: '"wdth" 110' }}
        >
          {showLabels && v >= 0.1 && (
            <>
              Z{z.id}
              {showShare && (
                // Narrow segments on phones have room for "Z2" only.
                <span className={clsx("ml-1.5 font-digits text-[15px] normal-case", v < 0.25 && "hidden sm:inline")} style={{ fontWeight: 700 }}>
                  {pct(v)}
                </span>
              )}
            </>
          )}
        </span>
      ))}
    </div>
  );
}
