import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";
import { logout } from "@/app/admin/actions";
import { Mark, Wordmark } from "@/components/layout/Logo";
import { AdminTabs, ClubClock } from "./AdminTabs";

/** Sticky panel header: mark, section tabs, club clock, a way back to the site and logout. */
export function AdminHeader({ newLeads }: { newLeads: number }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-chalk focus:px-4 focus:py-2 focus:text-asphalt"
      >
        Перейти к содержанию
      </a>
      <header className="sticky top-0 z-40 border-b border-line/10 bg-asphalt/90 backdrop-blur-xl">
        <div className="container-page flex flex-wrap items-center gap-x-6 gap-y-1 py-2 lg:flex-nowrap">
          <Link href="/admin" className="flex min-h-11 items-center gap-2.5 text-chalk" aria-label="Пульт «Каденса», сегодня">
            <Mark className="h-5 w-8" />
            <Wordmark className="text-[17px]" />
            <span className="eyebrow !text-[11px] !tracking-[0.2em]">пульт</span>
          </Link>
          <div className="order-last w-full lg:order-none lg:w-auto lg:flex-1">
            <AdminTabs newLeads={newLeads} />
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <ClubClock />
            <Link href="/" className="inline-flex min-h-11 items-center gap-1 px-1 text-[14px] font-medium text-dust transition-colors hover:text-chalk">
              <span className="link-underline">Открыть сайт</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line/20 px-4 text-[14px] font-semibold text-chalk transition-colors hover:border-chalk"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>
    </>
  );
}
