# Kadens — architecture and working agreements

Read this before touching the code. The concept is in `docs/CONCEPT.md`; the reference project for patterns is
`../../кофейня/svetoten-cafe` (same stack, same author).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 3 · framer-motion · Lenis · Prisma 7 + SQLite
(better-sqlite3 adapter) · zod 4 · lucide-react. Fonts through `next/font/google`: Science Gothic (display, variable
`wdth` 50–200 and `wght`), Golos Text (text), Handjet (digits). Port 3200.

## Language

All site copy is Russian. Code, file names, slugs, comments and docs are English.

## Folders

- `src/app/(site)/…` public pages, `src/app/admin/…` admin panel, `src/app/api/…` route handlers.
- `src/components/ui/` shared primitives. `src/components/pulse/` the heart-rate system. `src/components/layout/`
  header, footer, smooth scroll. Page-specific components go to `src/components/<area>/`.
- `src/data/` typed content (types in `src/data/types.ts`). Components only render data; texts never live in components.
- `src/lib/` logic. Files importing Prisma start with `import "server-only"`.

## Design tokens (Tailwind, see tailwind.config.ts and globals.css)

Colors: `asphalt` (#0C0B0A page), `graphite` (#171514 cards), `graphite-2` (#211E1C raised), `chalk` (#F2EFEA text),
`dust` (#8C8781 secondary text), `pulse` (#FF3A24 the only accent), zone colors `z1`…`z5`
(#6E6862, #D39A3A, #FF7A1A, #FF3A24, #FFE6D2). The site is dark only.
Fonts: `font-display` (Science Gothic, uppercase headlines), `font-sans` (Golos Text), `font-digits` (Handjet).
Width of display text is set with the utility classes `.stretch-narrow` / `.stretch-normal` / `.stretch-wide` / `.stretch-ultra` (Science Gothic `wdth` 56 / 100 / 130 / 170).

## Rules for every page

- Every photo goes through `<MediaFrame shot="…" alt="…" sizes="…" />`. Shot ids are in `docs/shot-list.json`.
- Reveal on scroll with `<Reveal>` only (canonical timing, do not change it).
- Zones: import `ZONES`, `zoneColor`, `zoneRanges` from `@/lib/zones`. Personal ranges come from `usePulse()`.
- Numbers and times: `font-digits`. Prices: `rub()` from `@/lib/format`.
- Every interactive element works with the keyboard and has a visible focus state. Respect `prefers-reduced-motion`.
- Mobile first: no horizontal scroll at 375 px.
- No lorem ipsum, no placeholders: realistic Russian copy in the tone of the concept.

## Relations (fixed, content must follow them)

Classes → studio · zone · minutes · coaches:

| class | title | studio | zone | min | coaches |
| --- | --- | --- | --- | --- | --- |
| cycle | Сайкл | cycle | 3 | 45 | marina-kim, kseniya-belova, dina-sabirova |
| boxing | Бокс-интервалы | ring | 4 | 55 | timur-galiev, igor-semenov |
| hiit | HIIT | forge | 5 | 40 | dina-sabirova, igor-semenov, artem-lebedev |
| functional | Функциональный тренинг | functional | 3 | 55 | artem-lebedev, igor-semenov, aidar-khasanov |
| dance | Танцевальное кардио | dance | 3 | 55 | evelina-sharipova |
| yoga | Йога | yoga | 1 | 75 | alina-safina |
| stretching | Растяжка | yoga | 1 | 55 | oleg-vorontsov, alina-safina |
| reformer | Пилатес на реформерах | reformer | 2 | 50 | polina-orlova |
| aqua | Аквааэробика | pool | 2 | 45 | ruslan-mukhametov, evelina-sharipova |
| swim | Техника плавания | pool | 2 | 55 | ruslan-mukhametov |
| strength | Силовая в малой группе | gym | 2 | 60 | aidar-khasanov, igor-semenov |
| run | Беговые интервалы | cardio | 3 | 40 | kseniya-belova |
| row | Гребля | cardio | 4 | 40 | kseniya-belova, igor-semenov |
| trx | Функциональные петли | functional | 3 | 45 | artem-lebedev, oleg-vorontsov |

Class photo = `class-<slug>`.

Coaches:

| slug | name | role | zone | photo | classes |
| --- | --- | --- | --- | --- | --- |
| timur-galiev | Тимур Галиев | Тренер по боксу | 4 | coach-boxing | boxing |
| marina-kim | Марина Ким | Инструктор сайкла | 3 | coach-cycle | cycle |
| aidar-khasanov | Айдар Хасанов | Тренер по силовой подготовке | 2 | coach-strength | strength, functional |
| dina-sabirova | Дина Сабирова | Тренер HIIT | 5 | coach-hiit | hiit, cycle |
| artem-lebedev | Артём Лебедев | Тренер по функциональному тренингу | 3 | coach-functional | functional, trx, hiit |
| alina-safina | Алина Сафина | Преподаватель йоги | 1 | coach-yoga | yoga, stretching |
| oleg-vorontsov | Олег Воронцов | Тренер по мобильности и растяжке | 1 | coach-mobility | stretching, trx |
| polina-orlova | Полина Орлова | Тренер по пилатесу | 2 | coach-pilates | reformer |
| ruslan-mukhametov | Руслан Мухаметов | Тренер по плаванию | 2 | coach-swim | swim, aqua |
| evelina-sharipova | Эвелина Шарипова | Тренер танцевальных программ | 3 | coach-dance | dance, aqua |
| kseniya-belova | Ксения Белова | Тренер по бегу | 3 | coach-running | run, row, cycle |
| igor-semenov | Игорь Семёнов | Главный тренер клуба | 4 | coach-head | hiit, boxing, functional, strength, row |

Spaces (floor · m² · places per class · photo):

| slug | name | kind | label | floor | m² | places | photo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cycle | Вираж | studio | Сайкл-студия | 2 | 140 | 30 | studio-cycle |
| ring | Ринг | studio | Зал единоборств | 1 | 220 | 16 | studio-ring |
| forge | Кузня | studio | Студия HIIT | 1 | 180 | 20 | studio-forge |
| dance | Такт | studio | Танцевальная студия | 2 | 200 | 28 | studio-dance |
| yoga | Тишина | studio | Студия йоги и растяжки | 3 | 160 | 22 | studio-yoga |
| reformer | Опора | studio | Студия пилатеса | 3 | 110 | 8 | studio-reformer |
| pool | Глубина | zone | Бассейн 25 м | 1 | 620 | 18 | zone-pool |
| gym | Тренажёрный зал | zone | Свободные веса и тренажёры | 1 | 1100 | 10 | zone-gym-floor |
| functional | Функциональная зона | zone | Турф, рама, санки | 1 | 420 | 14 | zone-functional |
| cardio | Кардиозона | zone | Панорама на Кремль | 3 | 380 | 12 | zone-cardio |
| spa | SPA | zone | Сауна, хаммам, купель | 1 | 300 | — | zone-spa |
| kids | Детский клуб | zone | Скалодром и игровая | 2 | 160 | — | zone-kids |
| lobby | Ресепшен | zone | Вход и лаунж | 1 | 240 | — | zone-lobby |
| lockers | Раздевалки | zone | Шкафчики, душевые, фены | 1 | 520 | — | zone-lockers |
| fitbar | Фитнес-бар | zone | Смузи и протеин | 3 | 90 | — | zone-fitbar |

Goals: `lean` (photo goal-lean), `endurance` (goal-endurance), `strength` (goal-strength), `health` (goal-health).

## Heart-rate model (src/lib/zones.ts)

HRmax = 208 − 0.7 × age (Tanaka). Zones by Karvonen: rest + (HRmax − rest) × [0.5–0.6, 0.6–0.7, 0.7–0.8, 0.8–0.9,
0.9–1.0]. Zone names: Z1 Разминка, Z2 База, Z3 Темп, Z4 Порог, Z5 Максимум. Ruffier index = (P1 + P2 + P3 − 200) / 10
with per-minute values.

## Club rules the copy must match (src/lib/club.ts)

Kazan, ул. Сибгата Хакима, 44, three floors, 6 200 m², 25 m pool with 6 lanes, 6 studios, up to 50 classes a day,
12 coaches. Hours: Mon–Fri 06:30–23:30, Sat–Sun 08:00–22:00. Online booking opens 7 days ahead and closes 15 minutes
before the start; online cancellation until 2 hours before; a freed place goes to the first person on the waitlist
automatically; one person books a class once. First visit: a free trial class with a coach and a pulse test.
