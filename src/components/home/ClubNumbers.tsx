import type { ReactNode } from "react";
import { ArrowLink, Stat } from "@/components/ui/Kit";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { HomeReveal } from "./HomeReveal";
import { CLUB, HOURS_LABEL } from "@/lib/club";
import { num } from "@/lib/format";

const Unit = ({ children }: { children: ReactNode }) => <span className="ml-1.5 font-sans text-[0.28em] font-semibold tracking-normal text-dust">{children}</span>;
const Pre = ({ children }: { children: ReactNode }) => <span className="mr-1.5 font-sans text-[0.28em] font-semibold tracking-normal text-dust">{children}</span>;

const FACTS: { value: ReactNode; label: string }[] = [
  { value: <>{num(CLUB.areaM2)}<Unit>м²</Unit></>, label: `на ${CLUB.floors} этажах: студии, бассейн, зал, SPA и детский клуб` },
  { value: <>{CLUB.poolLength}<Unit>м</Unit></>, label: `бассейн «Глубина» на ${CLUB.poolLanes} дорожек, свет идёт со дна` },
  { value: CLUB.studios, label: "студий для групповых занятий, у каждой свой свет и свой пульс" },
  { value: <><Pre>до</Pre>{CLUB.classesPerDayMax}</>, label: "занятий в день: от йоги в первой зоне до HIIT в пятой" },
  { value: CLUB.coaches, label: "тренеров ведут группы и знают, в какой зоне вы должны быть" },
  { value: HOURS_LABEL[0].time.split("–")[0], label: `открываемся в будни, в выходные с ${HOURS_LABEL[1].time.split("–")[0]}` },
];

/** Club in numbers: a spec sheet on the left, an asymmetric collage of the real spaces on the right. */
export function ClubNumbers() {
  return (
    <section aria-labelledby="numbers-title" className="rubber relative border-y border-line/10 py-24 md:py-36">
      <div className="container-page">
        <HomeReveal className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-8">
            <p className="eyebrow">Клуб в цифрах</p>
            <h2 id="numbers-title" className="display stretch-narrow mt-4 text-d-2 !leading-[0.95]">
              Три этажа на набережной Казанки
            </h2>
          </div>
          <p className="max-w-md text-[17px] leading-relaxed text-dust lg:col-span-4 lg:pb-2">
            {CLUB.city}, {CLUB.street}. Внизу бассейн, тренажёрный зал, «Ринг» и «Кузня», на втором этаже сайкл, танцы и детский клуб, наверху
            йога, реформеры и кардиозона с видом на Кремль.
          </p>
        </HomeReveal>
      </div>

      <div className="container-page mt-14 grid gap-16 md:mt-20 lg:grid-cols-12 lg:gap-10">
        <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <ul className="grid grid-cols-2 gap-x-6">
            {FACTS.map((f, i) => (
              <HomeReveal as="li" key={f.label} delay={(i % 2) * 0.08} className="border-t border-line/15 pb-8 pt-5">
                <Stat value={f.value} label={f.label} />
              </HomeReveal>
            ))}
          </ul>
          <HomeReveal>
            <ArrowLink href="/club">О клубе и его устройстве</ArrowLink>
          </HomeReveal>
        </div>

        <div className="lg:col-span-7 lg:pl-6">
          <div className="grid grid-cols-12 gap-3 sm:gap-4">
            <HomeReveal className="col-span-12">
              <figure>
                <MediaFrame
                  shot="zone-gym-floor"
                  alt="Тренажёрный зал ночью: силовые рамы на чёрном резиновом полу, вдали панорамные окна"
                  sizes="(min-width: 1100px) 52vw, 92vw"
                  className="aspect-[16/10] rounded-card"
                />
                <figcaption className="mt-3 text-[13.5px] text-dust">
                  Тренажёрный зал, <span className="digits text-[18px] text-chalk">1 100</span> м² на первом этаже
                </figcaption>
              </figure>
            </HomeReveal>
            <HomeReveal delay={0.1} className="col-span-7 sm:col-span-6">
              <figure>
                <MediaFrame
                  shot="zone-pool"
                  alt="Бассейн на шесть дорожек, вода светится изнутри"
                  sizes="(min-width: 1100px) 26vw, 55vw"
                  className="aspect-[3/4] rounded-card"
                  imgClassName="object-[50%_60%]"
                />
                <figcaption className="mt-3 text-[13.5px] text-dust">
                  «Глубина»: вода <span className="digits text-[18px] text-chalk">28</span> °C, очистка ультрафиолетом
                </figcaption>
              </figure>
            </HomeReveal>
            <HomeReveal delay={0.18} className="col-span-5 self-end sm:col-span-6 sm:-mb-0">
              <figure className="lg:-mb-24">
                <MediaFrame
                  shot="zone-lobby"
                  alt="Ресепшен: над бетонной стойкой красная светодиодная линия делает удар кардиограммы"
                  sizes="(min-width: 1100px) 26vw, 40vw"
                  className="aspect-[4/5] rounded-card sm:aspect-[5/6]"
                  imgClassName="object-[30%_40%]"
                />
                <figcaption className="mt-3 text-[13.5px] leading-snug text-dust">
                  Над ресепшеном красная линия делает один удар кардиограммы. С него начинается каждая тренировка.
                </figcaption>
              </figure>
            </HomeReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
