import { getClass } from "@/data/classes";
import { getCoach } from "@/data/coaches";
import { getSpace } from "@/data/spaces";
import type { ClassSlug, CoachSlug, SpaceSlug } from "@/data/types";
import { getBookingRow } from "@/lib/booking";
import { CLUB } from "@/lib/club";

export const dynamic = "force-dynamic";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** An .ics file so the member can put the class into any calendar. */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const booking = await getBookingRow(code);
  if (!booking || booking.status === "cancelled") return new Response("Запись не найдена", { status: 404 });

  const cls = getClass(booking.session.classType.slug as ClassSlug);
  const studio = getSpace(booking.session.studio.slug as SpaceSlug);
  const coach = getCoach((booking.session.substitute?.slug ?? booking.session.coach.slug) as CoachSlug);
  const waitlist = booking.status === "waitlist" ? " Вы в листе ожидания: место придёт автоматически, если кто-то откажется." : "";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kadens//Booking//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.code}@kadens`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(booking.session.startsAt)}`,
    `DTEND:${stamp(booking.session.endsAt)}`,
    `SUMMARY:${escape(`${cls.title} в «${CLUB.name}»`)}`,
    `LOCATION:${escape(`${CLUB.city}, ${CLUB.street}, студия «${studio.name}»`)}`,
    `DESCRIPTION:${escape(`Запись ${booking.code}. Тренер: ${coach.name}. Приходите за 10 минут до начала.${waitlist} ${CLUB.phone}`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(`Через два часа ${cls.title.toLowerCase()} в «${CLUB.name}»`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="kadens-${booking.code}.ics"`,
    },
  });
}
