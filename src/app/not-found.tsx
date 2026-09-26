import type { Metadata } from "next";
import Link from "next/link";
import { NOT_FOUND_COPY } from "@/components/club/copy";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { BeatWord } from "@/components/pulse/Beat";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Страница не найдена",
  description: "Такой страницы в «Каденсе» нет. Расписание, программа под пульс и главная на месте.",
};

// The root 404 replaces the (site) layout, so it brings its own header and footer.
export default function NotFound() {
  const [home, ...rest] = NOT_FOUND_COPY.links;
  return (
    <SmoothScroll>
      <Header />
      <main id="main">
        <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden pb-14 pt-32 md:pb-20">
          <MediaFrame
            shot="empty-gym"
            alt="Пустой зал ночью: свет выключен, только в одном красном пятне света на резиновом полу лежит гантель"
            sizes="100vw"
            priority
            className="absolute inset-0 -z-20"
            imgClassName="opacity-80"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-asphalt via-asphalt/60 to-asphalt/20" aria-hidden />
          <div className="container-page">
            <Reveal>
              <p className="eyebrow mb-4 text-chalk/80">{NOT_FOUND_COPY.eyebrow}</p>
              <p aria-hidden className="digits text-[clamp(140px,34vw,420px)] leading-[0.72] text-pulse [text-shadow:0_0_40px_rgb(255_58_36_/_0.45)]">
                404
              </p>
              <h1 className="display mt-6 max-w-[18ch] text-d-2 stretch-narrow">
                {NOT_FOUND_COPY.titleBefore}{" "}
                <BeatWord base={56} amp={26}>
                  {NOT_FOUND_COPY.titleBeat}
                </BeatWord>
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-chalk/80 md:text-[18px]">{NOT_FOUND_COPY.text}</p>
              <nav aria-label="Куда пойти" className="mt-10 flex flex-wrap items-center gap-3">
                <Link href={home.href} className="btn-primary">
                  {home.label}
                </Link>
                {rest.map((l) => (
                  <Link key={l.href} href={l.href} className="btn-ghost bg-asphalt/40 backdrop-blur-sm">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </SmoothScroll>
  );
}
