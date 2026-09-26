// A barcode that is also a cardiogram: bar heights follow P-QRS-T complexes whose rhythm and amplitude
// come from the booking code. Deterministic (same code, same strip), server-safe SVG.
import clsx from "clsx";

function fnv1a(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Bar = { v: number; peak: boolean };

/** Bar values in -1..1 (negative bars hang below the baseline). */
export function cardioBars(code: string, count = 68): Bar[] {
  const rnd = mulberry32(fnv1a(code.toUpperCase()));
  const bars: Bar[] = Array.from({ length: count }, () => ({ v: 0.05 + rnd() * 0.1, peak: false }));
  let r = 3 + Math.floor(rnd() * 4);
  while (r < count - 5) {
    const amp = 0.62 + rnd() * 0.38;
    bars[r - 2] = { v: 0.14 + rnd() * 0.1, peak: false }; // P
    bars[r - 1] = { v: -(0.08 + rnd() * 0.12), peak: false }; // Q
    bars[r] = { v: amp, peak: true }; // R
    bars[r + 1] = { v: -(0.22 + rnd() * 0.2) * amp, peak: false }; // S
    bars[r + 3] = { v: 0.2 + rnd() * 0.16, peak: false }; // T
    bars[r + 4] = { v: 0.12 + rnd() * 0.08, peak: false };
    r += 9 + Math.floor(rnd() * 7);
  }
  return bars;
}

export function CardioBarcode({ code, className }: { code: string; className?: string }) {
  const bars = cardioBars(code);
  const step = 6;
  const W = bars.length * step;
  const H = 80;
  const base = H * 0.66;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={clsx("block", className)} role="img" aria-label={`Кардиограмма-штрихкод записи ${code}`}>
      <line x1={0} x2={W} y1={base} y2={base} stroke="rgb(242 239 234 / 0.18)" strokeWidth={0.75} />
      {bars.map((b, i) => {
        const up = b.v >= 0;
        const len = up ? b.v * (base - 3) : -b.v * (H - base - 3);
        return (
          <rect
            key={i}
            x={i * step + 1.2}
            y={up ? base - len : base}
            width={step - 2.4}
            height={Math.max(1.5, len)}
            rx={0.8}
            fill={b.peak ? "#FF3A24" : "rgb(242 239 234 / 0.82)"}
          />
        );
      })}
    </svg>
  );
}
