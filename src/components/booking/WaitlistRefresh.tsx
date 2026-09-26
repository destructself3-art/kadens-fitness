"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { RefreshCw } from "lucide-react";
import { timeOf } from "@/lib/time";

/** Re-reads the ticket from the server: the waitlist moves only when someone cancels. */
export function WaitlistRefresh({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  return (
    <div className={clsx("flex flex-wrap items-center gap-x-5 gap-y-2", className)}>
      <button
        type="button"
        className="btn-ghost"
        disabled={pending}
        onClick={() =>
          startTransition(() => {
            router.refresh();
            setCheckedAt(timeOf(new Date()));
          })
        }
      >
        <RefreshCw aria-hidden className={clsx("h-4 w-4", pending && "animate-spin motion-reduce:animate-none")} />
        {pending ? "Проверяем…" : "Обновить"}
      </button>
      <p aria-live="polite" className="text-[13.5px] text-dust">
        {checkedAt && !pending ? (
          <>
            Проверили в <span className="digits text-[17px] text-chalk">{checkedAt}</span> по времени клуба
          </>
        ) : null}
      </p>
    </div>
  );
}
