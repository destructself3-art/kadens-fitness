// Seeds studios, class types and coaches from src/data and creates the sessions of this week and the next.
// Safe to run again: catalog rows are upserted by slug, sessions are unique per studio and start time.
// Demo bookings and leads are generated lazily by the site itself when DEMO_BOOKINGS=true.
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { CLASSES } from "../src/data/classes";
import { COACHES } from "../src/data/coaches";
import { SPACES } from "../src/data/spaces";
import { planWeek } from "../src/lib/timetable";
import { addDays, clubInstant, dateKeyOf, weekStartOf } from "../src/lib/time";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" }),
});

async function main() {
  for (const [sort, s] of SPACES.filter((x) => x.capacity).entries()) {
    const data = { name: s.name, capacity: s.capacity!, sort };
    await prisma.studio.upsert({ where: { slug: s.slug }, update: data, create: { slug: s.slug, ...data } });
  }
  for (const [sort, c] of CLASSES.entries()) {
    const data = { title: c.title, zone: c.zone, durationMin: c.durationMin, sort };
    await prisma.classType.upsert({ where: { slug: c.slug }, update: data, create: { slug: c.slug, ...data } });
  }
  for (const [sort, c] of COACHES.entries()) {
    const data = { name: c.name, zone: c.zone, sort };
    await prisma.coach.upsert({ where: { slug: c.slug }, update: data, create: { slug: c.slug, ...data } });
  }

  const [studios, classes, coaches] = await Promise.all([
    prisma.studio.findMany(),
    prisma.classType.findMany(),
    prisma.coach.findMany(),
  ]);
  const id = {
    studio: new Map(studios.map((s) => [s.slug, s.id])),
    classType: new Map(classes.map((c) => [c.slug, c.id])),
    coach: new Map(coaches.map((c) => [c.slug, c.id])),
  };

  let created = 0;
  const thisWeek = weekStartOf(dateKeyOf());
  for (const week of [thisWeek, addDays(thisWeek, 7)]) {
    for (const p of planWeek(week)) {
      const studioId = id.studio.get(p.studioSlug)!;
      const startsAt = clubInstant(p.dateKey, p.start);
      const exists = await prisma.session.findUnique({ where: { studioId_startsAt: { studioId, startsAt } } });
      if (exists) continue;
      await prisma.session.create({
        data: {
          studioId,
          classTypeId: id.classType.get(p.classSlug)!,
          coachId: id.coach.get(p.coachSlug)!,
          startsAt,
          endsAt: clubInstant(p.dateKey, p.end),
          capacity: p.capacity,
        },
      });
      created++;
    }
  }
  console.log(`Seeded ${studios.length} studios, ${classes.length} classes, ${coaches.length} coaches, ${created} new sessions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
