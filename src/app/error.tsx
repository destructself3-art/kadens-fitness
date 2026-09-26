"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Mark } from "@/components/layout/Logo";

type Props = {
  error: Error & { digest?: string };
  /** Next 16: re-fetches and re-renders the segment */
  retry?: () => void;
  /** Older name, kept as a fallback */
  reset?: () => void;
};

// A flat ECG line: the page stopped beating. Static, so it is fine with reduced motion.
const FLAT = "M0 60 H300 L318 52 L332 60 H1200";

export default function ErrorPage({ error, retry, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const again = retry ?? reset;

  return (
    <main id="main" className="ecg-grid relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-24">
      <div className="container-page">
        <Link href="/" aria-label="Каденс, на главную" className="inline-flex min-h-[44px] items-center">
          <Mark className="h-7 w-12" />
        </Link>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="mt-10 block h-[80px] w-full md:h-[120px]" aria-hidden>
          <path d={FLAT} fill="none" stroke="rgb(var(--pulse))" strokeWidth="2.5" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px rgb(255 58 36 / 0.8))" }} vectorEffect="non-scaling-stroke" />
        </svg>
        <p className="eyebrow mt-10">Сбой на странице</p>
        <h1 className="display mt-4 max-w-[16ch] text-d-2 stretch-narrow">Пульс пропал на секунду</h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-dust">
          Страница не загрузилась. Обычно помогает попробовать ещё раз. Если не помогло, начните с главной: расписание и запись работают.
        </p>
        {error.digest && (
          <p className="mt-4 text-[13px] text-dust">
            Код ошибки для администратора: <span className="font-mono text-chalk/80">{error.digest}</span>
          </p>
        )}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          {again && (
            <button type="button" onClick={() => again()} className="btn-primary">
              Попробовать ещё раз
            </button>
          )}
          <Link href="/" className="btn-ghost">
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}
