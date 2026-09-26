import { getSpace } from "@/data/spaces";
import type { SpaceSlug } from "@/data/types";
import { SpaceCard } from "@/components/ui/Cards";
import { ArrowLink } from "@/components/ui/Kit";
import { HomeReveal } from "./HomeReveal";
import { SnapRail } from "./SnapRail";

const ROOMS: SpaceSlug[] = ["cycle", "ring", "forge", "dance", "yoga", "reformer", "pool"];

/** Six studios and the pool as a horizontal row that runs off the right edge of the screen. */
export function StudiosSection() {
  const rooms = ROOMS.map(getSpace);
  return (
    <section aria-labelledby="studios-title" className="overflow-hidden py-24 md:py-36">
      <SnapRail
        label="Студии и бассейн"
        itemClassName="w-[78vw] max-w-[340px] sm:w-[44vw] sm:max-w-none lg:w-[29vw] xl:w-[380px]"
        header={
          <HomeReveal className="max-w-3xl">
            <p className="eyebrow">Студии</p>
            <h2 id="studios-title" className="display stretch-wide mt-4 text-d-3 max-sm:leading-[1.02]">
              Шесть студий и бассейн
            </h2>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-dust">
              У каждой студии свой свет и своя зона пульса. В «Кузне» красные линии по стенам и пятая зона, в «Тишине» низкий янтарный свет и
              первая, в «Глубине» свет идёт со дна бассейна.
            </p>
          </HomeReveal>
        }
      >
        {rooms.map((space) => (
          <SpaceCard key={space.slug} space={space} sizes="(min-width: 1360px) 380px, (min-width: 1100px) 29vw, (min-width: 560px) 44vw, 78vw" />
        ))}
      </SnapRail>
      <div className="container-page mt-10">
        <ArrowLink href="/studios">Все студии и зоны клуба</ArrowLink>
      </div>
    </section>
  );
}
