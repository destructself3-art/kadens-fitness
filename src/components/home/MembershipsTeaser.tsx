import Link from "next/link";
import clsx from "clsx";
import { MEMBERSHIPS, MEMBERSHIP_NOTES } from "@/data/memberships";
import type { Membership } from "@/data/types";
import { MembershipCard } from "@/components/ui/Cards";
import { ArrowLink } from "@/components/ui/Kit";
import { HomeReveal } from "./HomeReveal";
import { num } from "@/lib/format";

const PICK: Membership["slug"][] = ["morning", "rhythm", "pro"];

/** Three main plans; «Ритм» is raised and lit. */
export function MembershipsTeaser() {
  const plans = PICK.map((slug) => MEMBERSHIPS.find((m) => m.slug === slug)).filter((m) => m !== undefined);
  const fromYearly = Math.min(...plans.map((p) => p.priceYearly ?? p.price));
  return (
    <section aria-labelledby="plans-title" className="relative border-t border-line/10 py-24 md:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 h-[60%] bg-[radial-gradient(50%_60%_at_50%_50%,rgb(255_58_36/0.10),transparent_70%)]" />
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <HomeReveal className="max-w-3xl">
            <p className="eyebrow">Абонементы</p>
            <h2 id="plans-title" className="display stretch-normal mt-4 text-d-2">
              Карта под ваш ритм
            </h2>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-dust">{MEMBERSHIP_NOTES[0]}</p>
          </HomeReveal>
          <HomeReveal delay={0.1}>
            <p className="text-[14px] text-dust">
              при оплате за год от <span className="digits text-[26px] text-chalk">{num(fromYearly)}</span> ₽ в месяц
            </p>
          </HomeReveal>
        </div>

        <ul className="mt-14 grid gap-5 md:mt-20 lg:grid-cols-3 lg:items-center">
          {plans.map((plan, i) => (
            <HomeReveal as="li" key={plan.slug} delay={i * 0.08} className={clsx(plan.highlight ? "mt-4 lg:mt-0 lg:self-stretch" : "lg:my-10")}>
              <MembershipCard
                plan={plan}
                className={clsx(plan.highlight && "lg:py-10")}
                cta={
                  <Link href="/memberships" className={clsx("w-full", plan.highlight ? "btn-primary" : "btn-ghost")}>
                    Всё о карте «{plan.name}»
                  </Link>
                }
              />
            </HomeReveal>
          ))}
        </ul>

        <HomeReveal className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line/10 pt-6">
          <p className="max-w-2xl text-[14.5px] text-dust">
            Оформить и оплатить карту можно на ресепшене. Ещё есть «Семья», разовое посещение и пробная неделя.
          </p>
          <ArrowLink href="/memberships">Все абонементы и заморозка</ArrowLink>
        </HomeReveal>
      </div>
    </section>
  );
}
