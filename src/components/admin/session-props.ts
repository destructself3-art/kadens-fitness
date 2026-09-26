import { getClass } from "@/data/classes";
import { getCoach } from "@/data/coaches";
import type { SessionView } from "@/lib/session-types";

/** Props for <SessionControls>: who is on the timetable, who substitutes, who else can lead this format. */
export function controlsFor(s: SessionView) {
  const regular = s.regularCoachSlug ?? s.coachSlug;
  return {
    id: s.id,
    cancelled: s.status === "cancelled",
    started: s.started,
    note: s.note,
    substitute: s.regularCoachSlug ? s.coachSlug : null,
    regularName: getCoach(regular).name,
    options: getClass(s.classSlug)
      .coaches.filter((c) => c !== regular)
      .map((c) => ({ slug: c, name: getCoach(c).name })),
  };
}
