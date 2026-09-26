import Link from "next/link";
import clsx from "clsx";
import type { Space } from "@/data/types";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { num, placesLabel } from "@/lib/format";
import { spaceTitle } from "./plan";

/**
 * The directory board by the lift: every other room on the floor as one row with its area.
 * Phones stack the numbers under the name, so long words like «Функциональная» never collide with them.
 */
export function FloorDirectory({ spaces, className }: { spaces: Space[]; className?: string }) {
  return (
    <ul className={clsx("border-t border-line/10", className)}>
      {spaces.map((s) => (
        <li key={s.slug} className="border-b border-line/10">
          <Link
            href={`/studios/${s.slug}`}
            className="group grid min-h-[88px] grid-cols-[56px_minmax(0,1fr)] items-center gap-4 py-3 transition-colors hover:bg-graphite/60 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:gap-5"
          >
            <MediaFrame
              shot={s.photo}
              alt=""
              sizes="64px"
              quiet
              className="aspect-square w-full rounded-xl"
              imgClassName="transition-transform duration-700 ease-silk group-hover:scale-110"
            />
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] text-dust">{s.label}</span>
              <span
                className="mt-1 block font-display text-[20px] uppercase leading-[0.95] text-chalk transition-colors group-hover:text-pulse sm:text-[22px]"
                style={{ fontVariationSettings: '"wdth" 62', fontWeight: 850 }}
              >
                {spaceTitle(s)}
              </span>
              <span className="mt-1.5 block text-[12.5px] text-dust sm:hidden">
                <span className="digits text-[18px] leading-none text-chalk">{num(s.area)}</span> м²
                {s.capacity ? `, ${placesLabel(s.capacity)} на занятии` : ""}
              </span>
            </span>
            <span className="hidden items-center gap-5 text-right sm:flex">
              <span className="grid">
                <span className="text-[12.5px] text-dust">
                  <span className="digits text-[22px] leading-none text-chalk">{num(s.area)}</span> м²
                </span>
                {s.capacity ? <span className="text-[12.5px] text-dust">{placesLabel(s.capacity)} на занятии</span> : null}
              </span>
              <span aria-hidden className="text-dust transition-transform duration-300 ease-silk group-hover:translate-x-1 group-hover:text-pulse">
                →
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
