"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { BeatVar, BeatWord } from "@/components/pulse/Beat";
import { EcgMonitor } from "@/components/pulse/EcgMonitor";
import { PulseTap } from "@/components/pulse/PulseTap";
import { usePulse } from "@/components/pulse/PulseProvider";
import { ZoneBar } from "@/components/pulse/Zones";
import { CLUB } from "@/lib/club";

const EASE = [0.16, 1, 0.3, 1] as const;

// The entrance runs on CSS, not on framer-motion: the first screen is visible (and animated) straight from the server
// HTML, before the JavaScript arrives. Same canonical curve as Reveal; with reduced motion the type is simply there.
const RISE_CSS =
  "@keyframes kd-hero-rise{from{opacity:0;transform:translateY(36px);filter:blur(10px)}to{opacity:1;transform:none;filter:none}}" +
  ".kd-hero-rise{animation:kd-hero-rise 1.1s cubic-bezier(0.16,1,0.3,1) both}" +
  "@media (prefers-reduced-motion: reduce){.kd-hero-rise{animation:none}}";
const rise = (delayMs: number) => ({ style: { animationDelay: `${delayMs}ms` } });

// The hidden variant of the background must not download a full-size file. Plain "100vw" makes next/image drop the
// small widths from srcset, so the visible size is wrapped in calc(): the hidden frame then picks a 16 px file.
const SIZES_DESKTOP = "(min-width: 820px) calc(100vw), 16px";
const SIZES_MOBILE = "(max-width: 819px) calc(100vw), 16px";

/** First screen: the headline beats in the visitor's rhythm, the tap card measures it, a monitor strip draws it. */
export function Hero() {
  const { measured, hydrated, rest } = usePulse();
  const reduce = useReducedMotion();

  return (
    <section id="pulse" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <style>{RISE_CSS}</style>
      {/* Background: the athlete stands in the right third, the left two thirds are haze for the type. */}
      <MediaFrame
        shot="hero"
        alt="Спортсмен со спины после интервала, в красном контровом свете"
        sizes={SIZES_DESKTOP}
        priority
        quiet
        className="absolute inset-0 -z-20 hidden md:block"
        imgClassName="object-[72%_center]"
      />
      <MediaFrame
        shot="hero-mobile"
        alt="Спортсмен со спины после интервала, в красном контровом свете"
        sizes={SIZES_MOBILE}
        priority
        quiet
        className="absolute inset-0 -z-20 md:hidden"
        imgClassName="object-[56%_78%]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,rgb(12_11_10/0.9)_0%,rgb(12_11_10/0.72)_34%,rgb(12_11_10/0.25)_58%,rgb(12_11_10/0)_72%)] md:block" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(12_11_10/0.75)_0%,rgb(12_11_10/0.2)_22%,rgb(12_11_10/0.35)_48%,rgb(12_11_10/0.92)_78%,rgb(12_11_10)_100%)] md:bg-[linear-gradient(180deg,rgb(12_11_10/0.7)_0%,rgb(12_11_10/0)_20%,rgb(12_11_10/0)_62%,rgb(12_11_10/0.85)_88%,rgb(12_11_10)_100%)]" />

      <div className="container-page relative flex flex-1 flex-col pb-[136px] pt-[calc(var(--header-h)+32px)] md:pt-[calc(var(--header-h)+44px)]">
        <p className="eyebrow kd-hero-rise text-chalk/75" {...rise(50)}>
          Фитнес-клуб в Казани <span aria-hidden className="mx-1.5 text-pulse">·</span> {CLUB.floors} этажа{" "}
          <span aria-hidden className="mx-1.5 text-pulse">·</span> бассейн {CLUB.poolLength} м
        </p>

        <h1 id="hero-title" className="kd-hero-rise mt-5 font-display uppercase text-chalk md:mt-6" {...rise(120)}>
          <span className="display stretch-wide block text-[clamp(1.6rem,4.3vw,4.1rem)] leading-[0.95]">Клуб, который</span>
          <BeatVar as="span" className="block">
            <BeatWord
              className="-ml-[0.04em] block whitespace-nowrap pt-[0.17em] text-[min(18vw,13.5rem,22svh)] leading-[0.8] text-pulse"
              base={54}
              amp={30}
              weight={[800, 900]}
              style={{ textShadow: "0 0 calc(var(--beat, 0) * 70px) rgb(255 58 36 / 0.55)" }}
            >
              бьётся
            </BeatWord>
          </BeatVar>
          <span className="display stretch-wide mt-[0.12em] block text-[clamp(1.6rem,4.3vw,4.1rem)] leading-[0.95]">в вашем ритме</span>
        </h1>

        <div className="mt-10 grid flex-1 content-end gap-8 lg:grid-cols-[minmax(0,460px)_minmax(0,400px)] lg:items-end lg:gap-12">
          <div className="kd-hero-rise lg:order-2 lg:pb-2" {...rise(300)}>
            <p className="max-w-[40ch] text-[16.5px] leading-relaxed text-chalk/80 md:text-[17.5px]">
              Шесть студий, бассейн и до {CLUB.classesPerDayMax} занятий в день. Потапайте в такт своему пульсу десять секунд: сайт
              забьётся вместе с вами, посчитает ваши пять зон и покажет их у каждого занятия в расписании.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <MagneticButton href="/program">Собрать программу</MagneticButton>
              <Link href="/schedule" className="btn-ghost">
                Расписание
              </Link>
            </div>
          </div>

          <div
            className="kd-hero-rise rounded-card border border-line/15 bg-asphalt/75 p-5 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.9)] backdrop-blur-md sm:p-6 lg:order-1"
            {...rise(220)}
          >
            {/* The hero-size tap card is ~330 px wide; on phones the number and the button are scaled down to fit. */}
            <PulseTap
              size="hero"
              className="max-sm:[&_button]:!h-24 max-sm:[&_button]:!w-24 max-sm:[&_p.digits>span]:!text-[22px] max-sm:[&_p.digits]:!text-[88px] [&_p.digits]:whitespace-nowrap"
            />
            <AnimatePresence initial={false}>
              {hydrated && measured && (
                <motion.div
                  key="zones"
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 border-t border-line/10 pt-4">
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <p className="eyebrow">Ваши зоны, уд/мин</p>
                      <a href="#zones" className="link-underline text-[13.5px] font-semibold text-chalk">
                        Что они значат
                      </a>
                    </div>
                    <ZoneBar />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* A bedside monitor strip along the bottom edge, in the visitor's rhythm. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[110px]">
        <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/85 to-asphalt/0" />
        <EcgMonitor className="relative" speed={180} baseline={0.66} amplitude={0.46} />
        <div className="container-page absolute inset-x-0 top-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-dust">
          <span>
            Отведение II <span className="mx-1 text-pulse">·</span> 25 мм/с
          </span>
          <span className="flex items-baseline gap-2">
            ЧСС <span className="digits text-[22px] leading-none tracking-normal text-pulse">{rest}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
