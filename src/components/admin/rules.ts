// Desk rules of the panel, shared by server actions and pages ("use server" files may export only functions).

/** Reception starts checking people in this many minutes before a class. */
export const MARK_BEFORE_MIN = 30;

/** From this moment a booking can be marked "пришёл" / "не пришёл". */
export const markingOpensAt = (startsAt: Date | string) => new Date(new Date(startsAt).getTime() - MARK_BEFORE_MIN * 60_000);
