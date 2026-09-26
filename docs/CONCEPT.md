# Kadens — concept

Status (2026-09-25): concept agreed; the working title «Такт» was replaced by «Каденс». Photos generated (57 shots), site built as a full Next.js app (see README.md and ARCHITECTURE.md). City: Kazan. The Ruffier test is part of v1 (/program/ruffier).

## Idea

«Каденс» (Kadens) is a large fitness club that trains to your heart rate. The visitor taps along to their pulse for about ten seconds; the site learns their resting heart rate, starts beating in that rhythm, calculates personal heart-rate zones (Karvonen, HRmax = 208 − 0.7 × age) and recolours the schedule, so every class shows "your zone: 140–152".

## Club

- Kazan, three floors, 25 m pool, up to 50 classes a day (49 on weekdays, 25 on weekends), 12 coaches.
- Studios: «Вираж» cycle, «Ринг» combat sports, «Кузня» HIIT and circuits, «Такт» dance and group programs, «Тишина» yoga and stretching, «Опора» pilates reformers. Pool «Глубина».
- Also: gym floor, functional zone, cardio zone with panoramic windows, spa, kids' club, locker rooms, fit-bar.

## Visual

- Dark sport. Asphalt `#0C0B0A`, graphite `#171514`, chalk `#F2EFEA`, dust `#8C8781`, scarlet pulse `#FF3A24`.
- Heart-rate zones: Z1 `#6E6862` warm-up, Z2 `#D39A3A` base, Z3 `#FF7A1A` tempo, Z4 `#FF3A24` threshold, Z5 `#FFE6D2` max.
- Fonts, all with Cyrillic: Science Gothic for headlines (its width axis, 50–200, makes words beat), Golos Text for text, Handjet for heart-rate and time digits (treadmill-display look).
- Texture: rubber-floor speckle and a cardiogram grid. References by spirit: Barry's red rooms, WHOOP-style body data on black, treadmill LED displays.
- Photos: people only as silhouettes, from behind or cropped, never a face. Coach portraits are one rim-lit series; the rim colour is the coach's usual heart-rate zone.

## Signature interactions

- Tap your pulse: the site beats in your rhythm, zones and schedule update.
- One ECG line runs through the whole page as the scroll indicator.
- Holographic coach cards: the foil follows the cursor or the phone's tilt.
- The "live now" badge pulses in your rhythm; seats left update.
- Ruffier test (pulse, 30 squats in 45 s, pulse again) as a deeper option in the program builder (to confirm for v1).

## Pages

1. Home: pulse, club in numbers, live now, coaches, reviews with numbers, memberships, trial class.
2. Program: pulse, age, goal, experience, days and time, then a week built from real classes in your zones, bookable in one click.
3. Schedule: week by studio; filters by zone, studio, coach, time and "my zones"; two-field booking, waitlist, ticket with an .ics file, cancellation by the last four phone digits.
4. Coaches: cards and a page per coach with their classes.
5. Memberships: plans, freeze, trial request.
6. Admin (`/admin`): the day by studio with fill rate and attendance; coach swaps and cancellations show on the site at once; trial requests arrive with the client's program and zones.

Booking rules: the database enforces capacity, one person cannot book the same class twice, a freed seat goes to the first person on the waitlist.

## Stack

Same as `svetoten-cafe`: Next.js, Prisma + SQLite, Tailwind 3, framer-motion, Lenis, zod, and the same primitives (`Reveal`, `MediaFrame`).

## Files

- `docs/shot-list.json`: the photo shot list, source of truth. `node scripts/build-shotlist.mjs` and `node scripts/build-batch-prompts.mjs` rebuild `docs/PHOTO_PROMPTS.md` and `docs/BATCH_PROMPTS.md`.
- `docs/concept-board.html`: the first interactive concept draft, made under the working title «Такт».

