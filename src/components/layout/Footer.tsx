import Link from "next/link";
import { BeatWord } from "@/components/pulse/Beat";
import { CLUB, HOURS_LABEL } from "@/lib/club";
import { NAV_GROUPS } from "@/lib/nav";
import { Mark } from "./Logo";

export function Footer() {
  return (
    <footer className="rubber relative mt-28 border-t border-line/10 pb-10 pt-16">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Link href="/" aria-label="Каденс, на главную" className="inline-flex items-center gap-3">
              <Mark className="h-7 w-12" />
            </Link>
            <BeatWord as="p" className="mt-4 block text-[18vw] leading-[0.8] text-chalk lg:text-[9.5vw] xl:text-[128px]" base={62} amp={18}>
              Каденс
            </BeatWord>
            <div className="mt-8 grid gap-1.5 text-[15px] text-dust">
              <p className="text-chalk">
                {CLUB.city}, {CLUB.street}
              </p>
              <p>{CLUB.district}</p>
              {HOURS_LABEL.map((h) => (
                <p key={h.days}>
                  {h.days} <span className="digits text-[19px] text-chalk">{h.time}</span>
                </p>
              ))}
              <a href={CLUB.phoneHref} className="mt-2 w-fit text-[18px] text-chalk hover:text-pulse">
                {CLUB.phone}
              </a>
              <a href={`mailto:${CLUB.email}`} className="w-fit hover:text-chalk">
                {CLUB.email}
              </a>
            </div>
          </div>
          <nav aria-label="Разделы сайта" className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            {NAV_GROUPS.map((g) => (
              <div key={g.title}>
                <p className="eyebrow mb-4">{g.title}</p>
                <ul className="grid gap-2 text-[15px]">
                  {g.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="link-underline text-chalk/85 hover:text-chalk">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-line/10 pt-6 text-[13px] text-dust md:flex-row md:items-center md:justify-between">
          <p>© {CLUB.openedYear}–2026 «{CLUB.name}». Концепт-проект для портфолио: клуб, адрес и люди вымышленные.</p>
          <p>Сайт не медицинское устройство: при болезнях сердца сначала к врачу.</p>
        </div>
      </div>
    </footer>
  );
}
