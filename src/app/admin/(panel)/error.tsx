"use client";

import { useEffect } from "react";
import Link from "next/link";
import { miniBtn } from "@/components/admin/styles";

/** A page of the panel failed: keep the header and tabs, offer a retry and a way back to the day. */
export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="max-w-2xl py-10">
      <p className="eyebrow">Пульт</p>
      <h1 className="display stretch-narrow mt-3 text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.86]">
        Не загрузилось
      </h1>
      <p className="mt-5 text-[16px] leading-relaxed text-dust">
        Страница пульта не открылась: скорее всего, база данных ответила с ошибкой. Данные не потеряны, попробуйте ещё раз.
        {error.digest && (
          <>
            {" "}
            Код ошибки для разработчика: <span className="digits text-[18px] leading-none text-chalk">{error.digest}</span>
          </>
        )}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className="btn-primary">
          Попробовать ещё раз
        </button>
        <Link href="/admin" className={miniBtn}>
          К сегодняшнему дню
        </Link>
      </div>
    </div>
  );
}
