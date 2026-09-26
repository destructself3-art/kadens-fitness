"use client";

import { useId, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { SpaceSlug } from "@/data/types";
import { placesLabel } from "@/lib/format";
import { fitLabel, planLayout, spaceTitle, type Floor, type PlanRoom, type PlanSpace, type Variant } from "./plan";

type Mode = "tour" | "locator";

type Props = {
  floor: Floor;
  spaces: PlanSpace[];
  /** Highlighted room: the preview in the tour, the current page in the locator */
  active: SpaceSlug | null;
  variant: Variant;
  /**
   * tour: hover, focus or the first tap previews a room, a click (or the second tap) opens it.
   * locator: every room is a plain link; the active one is the current page.
   */
  mode?: Mode;
  onPreview?: (slug: SpaceSlug) => void;
  className?: string;
};

const DISPLAY = { fontVariationSettings: '"wdth" 70', fontWeight: 800 } as const;
const DIGITS = { fontVariationSettings: '"ELSH" 2', fontWeight: 700 } as const;

/** A schematic floor plan: rooms sized by area, labelled, each one a link to its page. */
export function FloorMap({ floor, spaces, active, variant, mode = "tour", onPreview, className }: Props) {
  const router = useRouter();
  const pointer = useRef<string | null>(null);
  const hatch = `hatch-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const bySlug = useMemo(() => new Map(spaces.map((s) => [s.slug, s])), [spaces]);
  const layout = useMemo(() => planLayout(floor, variant, (slug) => bySlug.get(slug)?.area ?? 100), [floor, variant, bySlug]);

  function open(e: React.MouseEvent<Element>, slug: SpaceSlug) {
    // Let the browser handle "open in a new tab"
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const touch = pointer.current === "touch" || pointer.current === "pen";
    pointer.current = null;
    if (mode === "tour" && touch && active !== slug) {
      onPreview?.(slug);
      return;
    }
    router.push(`/studios/${slug}`);
  }

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className={clsx("block h-auto w-full select-none", className)}
      role="group"
      aria-label={`План ${floor} этажа`}
    >
      <defs>
        <pattern id={hatch} width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="11" stroke="rgb(var(--line) / 0.1)" strokeWidth="2" />
        </pattern>
      </defs>

      {/* Outer wall */}
      <rect {...box(layout.outline)} rx="10" fill="none" stroke="rgb(var(--line) / 0.3)" strokeWidth="3" />

      {/* Corridors with a staircase at the far end */}
      {layout.corridors.map((c, i) => (
        <g key={`c${i}`} aria-hidden>
          <rect {...box(c)} fill={`url(#${hatch})`} />
          <g>
            <rect x={c.x + c.w - 84} y={c.y} width="84" height={c.h} fill="rgb(var(--asphalt))" stroke="rgb(var(--line) / 0.22)" strokeWidth="1.5" />
            {Array.from({ length: 9 }, (_, k) => (
              <line key={k} x1={c.x + c.w - 84 + 8 + k * 8.5} x2={c.x + c.w - 84 + 8 + k * 8.5} y1={c.y + 3} y2={c.y + c.h - 3} stroke="rgb(var(--line) / 0.3)" strokeWidth="1.2" />
            ))}
          </g>
        </g>
      ))}

      {/* Halls: hatched, not clickable */}
      {layout.halls.map((h) => (
        <g key={h.label} aria-hidden>
          <rect {...box(h)} rx="4" fill={`url(#${hatch})`} stroke="rgb(var(--line) / 0.12)" strokeWidth="1.5" />
          <text x={h.x + 18} y={h.y + 34} className="fill-dust font-sans" fontSize="18">
            {h.label}
          </text>
        </g>
      ))}

      {layout.rooms.map((room) => {
        const space = bySlug.get(room.slug);
        if (!space) return null;
        return (
          <Room
            key={room.slug}
            room={room}
            space={space}
            isActive={active === room.slug}
            mode={mode}
            onOpen={open}
            onPointerDown={(type) => (pointer.current = type)}
            onPreview={onPreview}
          />
        );
      })}

      {/* Panoramic window: a scarlet strip on the top wall, like the LED line along the sill */}
      {layout.windows && (
        <g aria-hidden>
          <line x1={layout.windows.x1} x2={layout.windows.x2} y1={layout.windows.y} y2={layout.windows.y} stroke="rgb(var(--pulse))" strokeWidth="5" strokeLinecap="round" />
          <text x={layout.windows.x2} y={layout.windows.y + 34} textAnchor="end" className="fill-dust font-sans" fontSize="17">
            окна на Кремль ↑
          </text>
        </g>
      )}

      {/* Street entrance: a gap in the wall and an arrow */}
      {layout.entrance && (
        <g aria-hidden>
          <rect x={layout.entrance.x - 34} y={layout.entrance.y - 4} width="68" height="8" fill="rgb(var(--asphalt))" />
          <path d={`M${layout.entrance.x} ${layout.entrance.y - 10} v-26 m-9 9 l9 -9 l9 9`} fill="none" stroke="rgb(var(--pulse))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x={layout.entrance.x} y={layout.entrance.y - 44} textAnchor="middle" className="fill-pulse font-sans" fontSize="15" fontWeight="600" letterSpacing="1.5">
            ВХОД
          </text>
        </g>
      )}
    </svg>
  );
}

function Room({
  room,
  space,
  isActive,
  mode,
  onOpen,
  onPointerDown,
  onPreview,
}: {
  room: PlanRoom;
  space: PlanSpace;
  isActive: boolean;
  mode: Mode;
  onOpen: (e: React.MouseEvent<Element>, slug: SpaceSlug) => void;
  onPointerDown: (type: string) => void;
  onPreview?: (slug: SpaceSlug) => void;
}) {
  const title = spaceTitle(space);
  // The "you are here" dot sits in the top-right corner: keep the label clear of it.
  const hereDot = mode === "locator" && isActive && room.h > 90;
  const { lines, size } = fitLabel(title.toUpperCase(), hereDot ? { ...room, w: room.w - 40 } : room, 32);
  const small = Math.max(14, Math.min(20, Math.round(size * 0.72)));
  const top = room.y + 14 + size * 0.86;
  const lineH = size * 0.94;
  const areaY = top + (lines.length - 1) * lineH + small + 10;
  const showArea = areaY < room.y + room.h - 8;
  // Seats: the long line if it fits the room's width, the short one if not, nothing in the narrowest rooms.
  const seats = space.capacity ? [`${placesLabel(space.capacity)} на занятии`, placesLabel(space.capacity)].find((t) => t.length * (small - 2) * 0.54 <= room.w - 30) : undefined;
  const showSeats = !!seats && areaY + small + 6 < room.y + room.h - 8;

  const facts = [`${space.area} м²`, space.capacity ? placesLabel(space.capacity) : null].filter(Boolean).join(", ");
  const label = `${space.label} ${title}, ${facts}. ${mode === "locator" && isActive ? "Вы здесь" : "Открыть страницу"}`;

  return (
    <a
      href={`/studios/${space.slug}`}
      aria-label={label}
      aria-current={mode === "locator" && isActive ? "page" : undefined}
      className="group cursor-pointer outline-none"
      onClick={(e) => onOpen(e, space.slug)}
      onPointerDown={(e) => onPointerDown(e.pointerType)}
      onPointerEnter={(e) => e.pointerType === "mouse" && onPreview?.(space.slug)}
      onFocus={() => onPreview?.(space.slug)}
    >
      <rect
        {...box(room)}
        rx="5"
        strokeWidth={isActive ? 3 : 1.5}
        className={clsx(
          "transition-[fill,stroke] duration-300 ease-silk",
          isActive ? "fill-pulse/15 stroke-pulse" : "fill-graphite stroke-line/15 group-hover:fill-raised group-hover:stroke-line/40",
        )}
      />
      {/* Keyboard focus ring, drawn inside the room so it never hides a neighbour */}
      <rect
        x={room.x + 5}
        y={room.y + 5}
        width={Math.max(0, room.w - 10)}
        height={Math.max(0, room.h - 10)}
        rx="3"
        fill="none"
        stroke="rgb(var(--chalk))"
        strokeWidth="2"
        strokeDasharray="6 5"
        className="opacity-0 transition-opacity group-focus-visible:opacity-100"
      />
      <text x={room.x + 16} y={top} fontSize={size} style={DISPLAY} className={clsx("font-display transition-colors", isActive ? "fill-chalk" : "fill-chalk/80 group-hover:fill-chalk")}>
        {lines.map((line, i) => (
          <tspan key={i} x={room.x + 16} dy={i === 0 ? 0 : lineH}>
            {line}
          </tspan>
        ))}
      </text>
      {showArea && (
        <text x={room.x + 16} y={areaY} fontSize={small + 4} style={DIGITS} className={clsx("font-digits", isActive ? "fill-pulse" : "fill-dust")}>
          {space.area} м²
        </text>
      )}
      {showSeats && (
        <text x={room.x + 16} y={areaY + small + 6} fontSize={small - 2} className="fill-dust font-sans">
          {seats}
        </text>
      )}
      {hereDot && (
        <g>
          <circle cx={room.x + room.w - 26} cy={room.y + 26} r="8" className="fill-pulse" />
          <circle cx={room.x + room.w - 26} cy={room.y + 26} r="14" fill="none" className="stroke-pulse/50" strokeWidth="2" />
        </g>
      )}
    </a>
  );
}

const box = (b: { x: number; y: number; w: number; h: number }) => ({ x: b.x, y: b.y, width: b.w, height: b.h });
