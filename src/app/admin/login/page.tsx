import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Mark, Wordmark } from "@/components/layout/Logo";
import { EcgMonitor } from "@/components/pulse/EcgMonitor";
import { SPACES } from "@/data/spaces";
import { isAdmin } from "@/lib/auth";
import { CLUB, HOURS_LABEL } from "@/lib/club";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Вход",
  description: "Вход в пульт администратора клуба «Каденс».",
};

const bookableRooms = SPACES.filter((s) => s.capacity).length;

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main id="main" className="grid min-h-[100svh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <section className="flex flex-col justify-between gap-12 px-[clamp(16px,4vw,48px)] py-8 md:py-10">
        <Link href="/" className="inline-flex min-h-11 w-fit items-center gap-2.5 text-chalk" aria-label="На сайт клуба">
          <Mark className="h-5 w-8" />
          <Wordmark className="text-[18px]" />
        </Link>

        <div className="w-full max-w-[440px]">
          <p className="eyebrow">Для администраторов клуба</p>
          <h1 className="display stretch-narrow mt-4 text-[clamp(3.6rem,10vw,8rem)] leading-[0.8]">
            Пульт
            <br />
            <span className="text-pulse">клуба</span>
          </h1>
          <p className="mt-6 text-[16px] leading-relaxed text-dust">
            День по студиям, записи и лист ожидания, замены тренеров и заявки с сайта. Всё, что вы меняете здесь, сразу видно
            в расписании на сайте.
          </p>
          <div className="mt-10">
            <LoginForm />
          </div>
          <p className="mt-6 flex flex-wrap items-baseline gap-x-2 rounded-2xl border border-dashed border-line/20 px-4 py-3 text-[14px] text-dust">
            Это демо для портфолио. Пароль:
            <span className="digits text-[22px] leading-none tracking-wide text-chalk">kadens</span>
          </p>
        </div>

        <p className="text-[13px] text-dust">
          {CLUB.city}, {CLUB.street} ·{" "}
          {HOURS_LABEL.map((h) => `${h.days} ${h.time}`).join(", ")}
        </p>
      </section>

      <aside aria-hidden className="relative hidden overflow-hidden border-l border-line/10 bg-graphite lg:block">
        <EcgMonitor className="absolute inset-x-0 top-[18%] h-[46%] w-full" speed={160} amplitude={0.55} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 grid grid-cols-3 border-t border-line/10">
          {[
            { value: CLUB.classesPerDayMax, label: "занятий в день" },
            { value: bookableRooms, label: "залов с записью" },
            { value: CLUB.coaches, label: "тренеров в команде" },
          ].map((s) => (
            <div key={s.label} className="border-r border-line/10 px-8 py-8 last:border-r-0">
              <p className="digits text-[88px] leading-[0.8] text-chalk">{s.value}</p>
              <p className="mt-3 text-[13.5px] text-dust">{s.label}</p>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}
