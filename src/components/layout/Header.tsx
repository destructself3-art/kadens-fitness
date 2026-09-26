"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { PulseChip } from "@/components/pulse/PulsePanel";
import { CLUB, HOURS_LABEL } from "@/lib/club";
import { MAIN_NAV, NAV_GROUPS } from "@/lib/nav";
import { EcgRail } from "./EcgRail";
import { Mark, Wordmark } from "./Logo";

type Status = { people: number; open: boolean; label: string; live: number };

/** Live club status for the header: people inside and opening hours. Polls once a minute. */
function useClubStatus() {
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/club-status", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((s: Status | null) => alive && s && setStatus(s))
        .catch(() => undefined);
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
  return status;
}

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const status = useClubStatus();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-chalk focus:px-4 focus:py-2 focus:text-asphalt"
      >
        Перейти к содержанию
      </a>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-500",
          scrolled || open ? "bg-asphalt/85 backdrop-blur-xl" : "bg-gradient-to-b from-asphalt/80 to-transparent",
        )}
      >
        <div className="container-page flex h-[72px] items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-chalk sm:gap-2.5" aria-label="Каденс, на главную">
            <Mark className="h-5 w-8 sm:h-6 sm:w-10" />
            <Wordmark className="text-[18px] sm:text-[21px]" />
          </Link>

          <nav aria-label="Основные разделы" className="ml-6 hidden xl:block">
            <ul className="flex items-center gap-6 text-[15px] font-medium">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className={clsx("link-underline py-2 transition-colors", isActive(pathname, item.href) ? "text-chalk" : "text-dust hover:text-chalk")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
            {status && (
              // Hidden while the full navigation takes the width (1360–1599 px), back on very wide screens.
              <span className="hidden items-center gap-2 whitespace-nowrap text-[13px] text-dust lg:flex xl:hidden 2xl:flex" title={status.label}>
                <span className="relative flex h-2 w-2">
                  {status.open && <span className="absolute inset-0 rounded-full bg-pulse motion-safe:animate-live-ping" />}
                  <span className={clsx("relative h-2 w-2 rounded-full", status.open ? "bg-pulse" : "bg-dust")} />
                </span>
                {status.open ? (
                  <>
                    В клубе <span className="digits text-[19px] leading-none text-chalk">{status.people}</span>
                  </>
                ) : (
                  status.label.replace(/^Закрыто, /, "").replace(/^./, (c) => c.toUpperCase())
                )}
              </span>
            )}
            <PulseChip />
            <MagneticButton href="/trial" className="hidden !min-h-[44px] md:inline-flex">
              Пробная тренировка
            </MagneticButton>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full border border-line/15 transition-colors hover:border-line/40"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">{open ? "Закрыть меню" : "Открыть меню"}</span>
              <span className="relative block h-3 w-5">
                <span className={clsx("absolute left-0 h-[1.5px] w-5 bg-chalk transition-transform duration-300", open ? "top-1.5 rotate-45" : "top-0")} />
                <span className={clsx("absolute left-0 h-[1.5px] w-5 bg-chalk transition-transform duration-300", open ? "top-1.5 -rotate-45" : "top-3")} />
              </span>
            </button>
          </div>
        </div>
        <EcgRail />
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            className="fixed inset-0 z-40 flex flex-col bg-asphalt pt-[72px]"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <nav aria-label="Все разделы" className="container-page flex-1 overflow-y-auto py-10" data-lenis-prevent>
              <div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
                <ul className="flex flex-col">
                  {MAIN_NAV.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={item.href}
                        className="display block py-1 text-[44px] leading-none text-chalk transition-colors hover:text-pulse md:text-[56px]"
                        style={{ fontVariationSettings: '"wdth" 60' }}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <div className="grid gap-8 sm:grid-cols-2">
                  {NAV_GROUPS.map((g) => (
                    <div key={g.title}>
                      <p className="eyebrow mb-3">{g.title}</p>
                      <ul className="grid gap-1.5 text-[16px]">
                        {g.items.map((item) => (
                          <li key={item.href}>
                            <Link href={item.href} className="link-underline text-chalk/90 hover:text-chalk">
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="sm:col-span-2 grid gap-2 border-t border-line/10 pt-6 text-[15px] text-dust">
                    <p className="text-chalk">
                      {CLUB.city}, {CLUB.street}
                    </p>
                    <p>
                      {HOURS_LABEL.map((h) => `${h.days} ${h.time}`).join(" · ")}
                    </p>
                    <a href={CLUB.phoneHref} className="w-fit text-chalk">
                      {CLUB.phone}
                    </a>
                  </div>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
