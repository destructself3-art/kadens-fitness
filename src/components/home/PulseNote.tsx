"use client";

import { usePulse } from "@/components/pulse/PulseProvider";

/** One line under the zones heading: whose numbers the visitor is looking at. */
export function PulseNote({ className }: { className?: string }) {
  const { measured, hydrated, rest, age, hrMax } = usePulse();
  const mine = hydrated && measured;
  return (
    <p className={className} aria-live="polite">
      {mine ? (
        <>
          Цифры ниже посчитаны для вас: пульс покоя <span className="digits text-[20px] text-chalk">{rest}</span>, возраст{" "}
          <span className="digits text-[20px] text-chalk">{age}</span>, максимум <span className="digits text-[20px] text-chalk">{hrMax}</span>.
        </>
      ) : (
        <>
          Пока это цифры для пульса покоя <span className="digits text-[20px] text-chalk">{rest}</span> и возраста{" "}
          <span className="digits text-[20px] text-chalk">{age}</span>.{" "}
          <a href="#pulse" className="link-underline font-semibold text-chalk">
            Измерьте свой пульс
          </a>{" "}
          на первом экране, и они станут вашими.
        </>
      )}
    </p>
  );
}
