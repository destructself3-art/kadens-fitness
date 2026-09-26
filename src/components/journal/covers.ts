// Alt texts for the journal covers, written from docs/shot-list.json.
const COVER_ALT: Record<string, string> = {
  "detail-hr-strap": "Нагрудный пульсометр свёрнут на чёрном резиновом полу рядом с полотенцем",
  "pulse-check": "Два пальца прижаты к шее под челюстью: так считают пульс",
  "goal-lean": "Руки сжимают рукоять гребного тренажёра в конце гребка, капли пота в красном свете",
  "class-cycle": "Сайкл-класс в студии «Вираж» на спринте: силуэты райдеров на фоне красных световых линий",
  "zone-spa": "SPA клуба: кедровая сауна за стеклом и круглая холодная купель",
  "zone-fitbar": "Фитнес-бар: смузи и протеиновый коктейль на бетонной стойке",
};

export function coverAlt(shot: string, title: string): string {
  return COVER_ALT[shot] ?? `Обложка статьи «${title}»`;
}
