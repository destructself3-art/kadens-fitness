"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { timeOf } from "@/lib/time";

const TABS = [
  { href: "/admin", label: "Сегодня", match: (p: string) => p === "/admin" },
  { href: "/admin/schedule", label: "Расписание", match: (p: string) => p.startsWith("/admin/schedule") || p.startsWith("/admin/sessions") },
  { href: "/admin/bookings", label: "Записи", match: (p: string) => p.startsWith("/admin/bookings") },
  { href: "/admin/leads", label: "Заявки", match: (p: string) => p.startsWith("/admin/leads") },
  { href: "/admin/coaches", label: "Тренеры", match: (p: string) => p.startsWith("/admin/coaches") },
] as const;

/** Section tabs of the panel. Scrolls sideways on a phone instead of wrapping. */
export function AdminTabs({ newLeads }: { newLeads: number }) {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  // On a phone the tabs scroll sideways: bring the current one into view, without moving the page.
  useEffect(() => {
    const nav = ref.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
  }, [pathname]);
  return (
    <nav ref={ref} aria-label="Разделы пульта" className="relative -mx-1 overflow-x-auto">
      <ul className="flex w-max items-center gap-1 px-1">
        {TABS.map((t) => {
          const active = t.match(pathname);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "relative inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[14.5px] font-semibold transition-colors",
                  active ? "bg-chalk text-asphalt" : "text-dust hover:bg-chalk/5 hover:text-chalk",
                )}
              >
                {t.label}
                {t.href === "/admin/leads" && newLeads > 0 && (
                  <span
                    className="digits grid h-5 min-w-5 place-items-center rounded-full bg-pulse px-1 text-[14px] leading-none text-asphalt"
                    aria-label={`новых: ${newLeads}`}
                  >
                    {newLeads}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Club time (Moscow), whatever the admin's computer says. Renders after mount to avoid a hydration mismatch. */
export function ClubClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setTime(timeOf(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="hidden items-baseline gap-2 text-[12.5px] text-dust sm:inline-flex" aria-label={time ? `Время клуба ${time}` : undefined}>
      Казань
      <span className="digits min-w-[3.2ch] text-[22px] leading-none text-chalk">{time ?? "--:--"}</span>
    </span>
  );
}
