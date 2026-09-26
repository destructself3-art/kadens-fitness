# Kadens — a fitness club that trains to your heart rate

Portfolio site for «Каденс», a fictional three-storey fitness club in Kazan: six studios, a 25 m pool and up to
50 classes a day. The whole identity is built on the pulse: the visitor taps along to their heartbeat, and the site
starts beating in that rhythm, calculates their personal heart-rate zones and recolours the schedule, so every class
shows "your zone: 140–152".

- **Pulse-driven interface**: one animation loop beats at the visitor's resting heart rate (68 until measured).
  Headlines set in Science Gothic physically expand on every beat (variable `wdth` axis), cardiogram canvases sweep in
  the same rhythm, and a cardiogram strip under the header fills as you scroll. The pulse is measured by tapping
  (median of intervals), entered by hand or taken from the Ruffier test, and stored in the browser.
- **Personal zones everywhere**: HRmax = 208 − 0.7 × age (Tanaka), zones by Karvonen. Every class, schedule row and
  article shows the visitor's own numbers.
- **Live schedule with real booking**: sessions are generated week by week from a timetable template; coaches are
  assigned without overlaps by a small backtracking search. Places are seats: the unique (session, seat) index makes
  overbooking impossible at the database level. Without a free seat the booking joins a waitlist and is promoted
  automatically when someone cancels. Ticket page with an .ics file, cancellation by the last four phone digits,
  «Мои записи» lookup.
- **Program builder**: goal, level, days and preferred times → a week of real classes with free places, balanced by
  heart-rate zone and with rest days around hard sessions; book the whole week in one go or send it to a coach.
- **Ruffier test** guided on the phone: metronome for 30 squats, countdowns, index and grade.
- **Holographic coach cards**: the foil follows the cursor or the phone's tilt, tinted with the coach's zone — the same
  colour as the rim light in their photo.
- **Owner panel** (`/admin`, demo password `kadens`): today's board by studio, week schedule with cancellations and
  substitutes, rosters with attendance, booking search, leads with the programs visitors sent, coach load.

## Run

Double-click `start.bat`, or:

```
npm install
cp .env.example .env
npx prisma migrate deploy
npx prisma db seed
npm run photos
npm run dev
```

Open http://localhost:3200.

With `DEMO_BOOKINGS="true"` (the default in `.env.example`) every generated week gets believable bookings, two coach
substitutions and one cancelled class, and the admin panel gets a stream of leads. Set it to `"false"` for a real club.

## Photos

57 generated shots, prompts in `docs/PHOTO_PROMPTS.md` (per shot) and `docs/BATCH_PROMPTS.md` (four passes for a
chat-based image model), source of truth `docs/shot-list.json`. Put new files into `photos-raw/` named by shot id and
run `npm run photos`: each photo is cropped to its shot ratio, compressed into `public/photos/` and registered in
`src/data/photo-manifest.json`. Every photo on the site goes through `MediaFrame`, which draws the light of the shot
until the file exists. People appear only as silhouettes, from behind or cropped: no faces of fictional people.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · framer-motion · Lenis · Prisma 7 + SQLite
(better-sqlite3 adapter) · zod 4. Fonts: Science Gothic (variable width), Golos Text, Handjet.

## Project map

| Path | What |
| --- | --- |
| `src/app/(site)` | Public pages |
| `src/app/admin` | Owner panel |
| `src/app/api` | Booking, cancellation, lookup, batch booking, leads, program, club status |
| `src/components/pulse` | The heartbeat engine and everything that beats |
| `src/data` | Typed content: spaces, classes, coaches, goals, memberships, reviews, FAQ, journal, timetable |
| `src/lib` | Club time, zones math, schedule and booking logic, program builder, validation |
| `docs` | Concept, architecture notes, photo prompts |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3200 |
| `npm run build` / `npm start` | Production build and server |
| `npm run photos` | Process `photos-raw/` into `public/photos/` and the photo manifest |
| `npm run shotlist` | Rebuild the prompt documents from `docs/shot-list.json` |
| `npm run db:seed` | Upsert studios, classes and coaches and create this and next week's sessions |

Concept project for a portfolio: the club, its address, phone number and people are fictional.
