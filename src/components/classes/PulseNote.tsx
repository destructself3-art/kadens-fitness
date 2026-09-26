"use client";

import clsx from "clsx";
import { BeatDot } from "@/components/pulse/Beat";
import { usePulse } from "@/components/pulse/PulseProvider";

/** One line under zone numbers: whose numbers these are and how to make them yours. */
export function PulseNote({ className }: { className?: string }) {
  const { measured, rest, age } = usePulse();
  return (
    <p className={clsx("flex items-start gap-2.5 text-[14px] leading-snug text-dust", className)}>
      <BeatDot className="mt-[5px] h-2 w-2 flex-none text-pulse" />
      {measured ? (
        <span>
          Цифры посчитаны по вашему пульсу покоя <span className="digits text-[17px] text-chalk">{rest}</span> и возрасту{" "}
          <span className="digits text-[17px] text-chalk">{age}</span>.
        </span>
      ) : (
        <span>
          Пока это цифры для пульса покоя <span className="digits text-[17px] text-chalk">{rest}</span> и возраста{" "}
          <span className="digits text-[17px] text-chalk">{age}</span>. Нажмите «Ваш пульс» вверху страницы и потапайте в такт сердцу
          10 секунд: диапазоны станут вашими.
        </span>
      )}
    </p>
  );
}
