/** 7900 -> "7 900 ₽" with a narrow no-break space. */
export function rub(value: number): string {
  return `${value.toLocaleString("ru-RU").replace(/\s/g, " ")} ₽`;
}

/** Thousands with a narrow no-break space: 6200 -> "6 200". */
export function num(value: number): string {
  return value.toLocaleString("ru-RU").replace(/\s/g, " ");
}

/** Keeps digits only and normalizes a Russian number to 7XXXXXXXXXX. */
export function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 10) digits = `7${digits}`;
  if (digits.length === 11 && digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  return digits;
}

/** 79161234567 -> "+7 916 123-45-67" */
export function formatPhone(digits: string): string {
  const d = normalizePhone(digits);
  if (d.length !== 11) return digits;
  return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
}

/** Hides the middle of a phone number for lists: "+7 916 •••-••-67" */
export function maskPhone(digits: string): string {
  const d = normalizePhone(digits);
  if (d.length !== 11) return "•••";
  return `+${d[0]} ${d.slice(1, 4)} •••-••-${d.slice(9, 11)}`;
}

/** Live mask for a phone input: "+7 916 123-45-67" while typing. */
export function phoneMask(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("8")) d = `7${d.slice(1)}`;
  if (!d.startsWith("7")) d = `7${d}`;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  let out = "+7";
  if (p[0]) out += ` ${p[0]}`;
  if (p[1]) out += ` ${p[1]}`;
  if (p[2]) out += `-${p[2]}`;
  if (p[3]) out += `-${p[3]}`;
  return out;
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = Math.abs(n) % 10;
  const mod100 = Math.abs(n) % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export const placesLabel = (n: number) => `${n} ${plural(n, "место", "места", "мест")}`;
export const minutesLabel = (n: number) => `${n} ${plural(n, "минута", "минуты", "минут")}`;
export const yearsLabel = (n: number) => `${n} ${plural(n, "год", "года", "лет")}`;
export const monthsLabel = (n: number) => `${n} ${plural(n, "месяц", "месяца", "месяцев")}`;
