import clsx from "clsx";
import { CLUB } from "@/lib/club";
import { MapBeat } from "./MapBeat";

// A drawn map, no map services: the Kazanka, the Kremlin on the south bank, the club on the north bank.
// viewBox 800×560. Everything that matters sits between x 180 and 620, so the phone crop (4:5, "slice") keeps it.

const RIVER =
  "M-10 292 C140 282 260 250 400 262 C520 272 640 236 810 214 L810 300 C640 318 520 350 400 346 C260 342 140 364 -10 380 Z";
const RIVER_MID = "M-10 336 C140 323 260 296 400 304 C520 311 640 277 810 257";
const STREET = "M-10 150 C200 150 420 140 810 108";
const STREET_TEXT = "M-10 141 C200 141 420 131 810 99";
const NORTH_EMBANKMENT = "M-10 268 C140 258 260 228 400 240 C520 250 640 212 810 190";
const SOUTH_EMBANKMENT = "M-10 402 C140 386 260 364 400 368 C520 372 640 340 810 322";
const KREMLIN = "205,417 290,394 368,410 388,464 335,512 222,506 186,462";

const BLOCKS: [number, number, number, number][] = [
  [40, 40, 130, 70],
  [200, 34, 150, 64],
  [380, 18, 120, 44],
  [560, 24, 150, 50],
  [40, 180, 120, 60],
  [200, 172, 140, 48],
  [620, 146, 140, 36],
  [430, 400, 110, 50],
  [430, 470, 110, 64],
  [640, 384, 150, 56],
  [640, 460, 150, 70],
  [20, 432, 130, 90],
];

const CLUB_AT = { x: 484, y: 197 };
const KREMLIN_AT = { x: 287, y: 452 };

export function CityMap({ caption, className }: { caption: string; className?: string }) {
  const [street, number] = CLUB.street.split(/,\s*/);
  return (
    <figure className={className}>
      <div className="ecg-grid relative aspect-[4/5] overflow-hidden rounded-card border border-line/10 bg-graphite md:aspect-[10/7]">
        <svg viewBox="0 0 800 560" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-labelledby="city-map-title city-map-desc">
          <title id="city-map-title">Схема: где находится «Каденс»</title>
          <desc id="city-map-desc">
            {`Клуб на северном берегу Казанки, ${CLUB.street}. Напротив, на другом берегу реки, Кремль. Рядом с клубом парковка на ${CLUB.parkingSpots} мест.`}
          </desc>
          <defs>
            <path id="city-map-river-mid" d={RIVER_MID} />
            <path id="city-map-street" d={STREET_TEXT} />
            <path id="city-map-sight" d={`M${KREMLIN_AT.x} ${KREMLIN_AT.y} L${CLUB_AT.x} ${CLUB_AT.y}`} />
          </defs>

          {/* City blocks */}
          {BLOCKS.map(([x, y, w, h]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="6" fill="rgb(var(--line) / 0.04)" stroke="rgb(var(--line) / 0.08)" />
          ))}

          {/* Side streets and embankments */}
          {[
            [180, 150, 258],
            [350, 146, 240],
            [610, 124, 222],
          ].map(([x, y1, y2]) => (
            <line key={x} x1={x} x2={x} y1={y1} y2={y2} stroke="rgb(var(--line) / 0.12)" strokeWidth="3" />
          ))}
          <path d={NORTH_EMBANKMENT} fill="none" stroke="rgb(var(--line) / 0.14)" strokeWidth="5" />
          <path d={SOUTH_EMBANKMENT} fill="none" stroke="rgb(var(--line) / 0.14)" strokeWidth="5" />

          {/* The club's street */}
          <path d={STREET} fill="none" stroke="rgb(var(--line) / 0.4)" strokeWidth="4" strokeLinecap="round" />
          <text className="fill-chalk/70 font-sans" fontSize="17" letterSpacing="0.5">
            <textPath href="#city-map-street" startOffset="23%">
              {street}
            </textPath>
          </text>

          {/* The Kazanka */}
          <path d={RIVER} fill="rgb(var(--line) / 0.07)" stroke="rgb(var(--line) / 0.22)" strokeWidth="1.5" />
          <path d={RIVER_MID} fill="none" stroke="rgb(var(--line) / 0.12)" strokeWidth="1.5" strokeDasharray="16 22" transform="translate(0 -22)" />
          <path d={RIVER_MID} fill="none" stroke="rgb(var(--line) / 0.12)" strokeWidth="1.5" strokeDasharray="10 26" transform="translate(30 18)" />
          <text className="fill-dust font-sans italic" fontSize="19" letterSpacing="2">
            <textPath href="#city-map-river-mid" startOffset="25%" dominantBaseline="middle">
              р. Казанка
            </textPath>
          </text>

          {/* A bridge */}
          <line x1="540" y1="370" x2="572" y2="232" stroke="rgb(var(--line) / 0.3)" strokeWidth="3" />
          <line x1="554" y1="372" x2="586" y2="234" stroke="rgb(var(--line) / 0.3)" strokeWidth="3" />

          {/* The Kremlin: walls, towers and the mosque with two minarets */}
          <polygon points={KREMLIN} fill="rgb(var(--line) / 0.05)" stroke="rgb(var(--line) / 0.5)" strokeWidth="2.5" strokeLinejoin="round" />
          {KREMLIN.split(" ").map((p) => {
            const [x, y] = p.split(",").map(Number);
            return <rect key={p} x={x - 6} y={y - 6} width="12" height="12" fill="rgb(var(--graphite))" stroke="rgb(var(--line) / 0.55)" strokeWidth="2" />;
          })}
          <g fill="none" stroke="rgb(var(--chalk) / 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M266 470 h42 v-14 h-42 z" />
            <path d="M272 456 Q287 428 302 456" />
            <path d="M287 434 v-8" />
            <path d="M256 470 v-44 l3 -8 l3 8 v44" />
            <path d="M312 470 v-44 l3 -8 l3 8 v44" />
          </g>
          <text x="287" y="548" textAnchor="middle" className="fill-chalk/80 font-display" fontSize="26" letterSpacing="3" style={{ fontVariationSettings: '"wdth" 110', fontWeight: 800 }}>
            КРЕМЛЬ
          </text>

          {/* The view from the cardio zone */}
          <use href="#city-map-sight" fill="none" stroke="rgb(var(--pulse) / 0.7)" strokeWidth="2" strokeDasharray="6 8" />
          <text className="fill-pulse font-sans" fontSize="15" dy="-8">
            <textPath href="#city-map-sight" startOffset="26%">
              вид из кардиозоны
            </textPath>
          </text>

          {/* Parking and the club */}
          <rect x="380" y="182" width="62" height="30" rx="5" fill="rgb(var(--asphalt))" stroke="rgb(var(--line) / 0.4)" strokeWidth="1.5" />
          <text x="411" y="203" textAnchor="middle" className="fill-chalk/80 font-sans" fontSize="16" fontWeight="700">
            P {CLUB.parkingSpots}
          </text>
          <rect x="456" y="180" width="56" height="34" rx="4" fill="rgb(var(--pulse) / 0.22)" stroke="rgb(var(--pulse))" strokeWidth="2" />
          <line x1={CLUB_AT.x} x2={CLUB_AT.x} y1="146" y2="180" stroke="rgb(var(--pulse))" strokeWidth="2" />
          <MapBeat cx={CLUB_AT.x} cy={CLUB_AT.y} />
          <rect x="404" y="84" width="196" height="62" rx="10" fill="rgb(var(--asphalt))" stroke="rgb(var(--pulse) / 0.6)" strokeWidth="1.5" />
          <text x="420" y="112" className="fill-chalk font-display" fontSize="24" style={{ fontVariationSettings: '"wdth" 120', fontWeight: 800 }}>
            КАДЕНС
          </text>
          <text x="420" y="134" className="fill-dust font-sans" fontSize="15">
            {street}, {number}
          </text>

          {/* North arrow */}
          <g>
            <circle cx="585" cy="476" r="26" fill="rgb(var(--asphalt))" stroke="rgb(var(--line) / 0.3)" strokeWidth="1.5" />
            <path d="M585 492 V460 M576 470 L585 458 L594 470" fill="none" stroke="rgb(var(--chalk))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="585" y="440" textAnchor="middle" className="fill-chalk font-display" fontSize="18" style={{ fontWeight: 800 }}>
              С
            </text>
          </g>
        </svg>
      </div>
      <figcaption className={clsx("mt-3 text-[13px] text-dust")}>{caption}</figcaption>
    </figure>
  );
}
