import Link from "next/link";
import { miniBtn } from "@/components/admin/styles";

/** notFound() inside the panel, e.g. an old link to a class that no longer exists. */
export default function AdminNotFound() {
  return (
    <div className="max-w-2xl py-10">
      <p className="eyebrow">Пульт · 404</p>
      <h1 className="display stretch-narrow mt-3 text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.86]">Такого нет</h1>
      <p className="mt-5 text-[16px] leading-relaxed text-dust">
        Занятие или страница не найдены. Проверьте ссылку или найдите занятие в расписании недели: из строки занятия
        открывается его группа.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin" className="btn-primary">
          К сегодняшнему дню
        </Link>
        <Link href="/admin/schedule" className={miniBtn}>
          Расписание недели
        </Link>
      </div>
    </div>
  );
}
