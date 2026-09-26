// Club facts shared by every page. Fictional club: address and phone are made up for the portfolio.

export const CLUB = {
  name: "Каденс",
  nameLatin: "Kadens",
  city: "Казань",
  street: "ул. Сибгата Хакима, 44",
  district: "набережная Казанки, напротив Кремля",
  phone: "+7 843 207-44-44",
  phoneHref: "tel:+78432074444",
  email: "hello@kadens.club",
  telegram: "kadens_club",
  /** Moscow time, no DST */
  utcOffset: "+03:00",
  utcOffsetMinutes: 180,
  timeZone: "Europe/Moscow",
  openedYear: 2024,
  floors: 3,
  areaM2: 6200,
  poolLength: 25,
  poolLanes: 6,
  studios: 6,
  classesPerDayMax: 50,
  coaches: 12,
  parkingSpots: 80,
} as const;

/** Opening hours by ISO weekday (1 = Monday), minutes from midnight. */
export const HOURS: Record<number, { open: number; close: number }> = {
  1: { open: 6 * 60 + 30, close: 23 * 60 + 30 },
  2: { open: 6 * 60 + 30, close: 23 * 60 + 30 },
  3: { open: 6 * 60 + 30, close: 23 * 60 + 30 },
  4: { open: 6 * 60 + 30, close: 23 * 60 + 30 },
  5: { open: 6 * 60 + 30, close: 23 * 60 + 30 },
  6: { open: 8 * 60, close: 22 * 60 },
  7: { open: 8 * 60, close: 22 * 60 },
};

export const HOURS_LABEL = [
  { days: "Пн–Пт", time: "06:30–23:30" },
  { days: "Сб–Вс", time: "08:00–22:00" },
] as const;

/** Booking rules. Texts on the site must match these numbers. */
export const BOOKING = {
  /** Online booking opens this many days ahead (today included). */
  daysAhead: 7,
  /** Online booking closes this many minutes before the start. */
  closesBeforeMin: 15,
  /** A guest can cancel online until this many minutes before the start. */
  cancelBeforeMin: 120,
  /** Public code prefix, e.g. KD-7K3M9Q */
  codePrefix: "KD-",
} as const;
