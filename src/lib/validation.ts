import { z } from "zod";
import { normalizePhone } from "./format";
import { AGE_MAX, AGE_MIN, REST_MAX, REST_MIN } from "./zones";

const name = z.string().trim().min(2, "Напишите, как к вам обращаться").max(60, "Слишком длинное имя");
const phone = z
  .string()
  .transform(normalizePhone)
  .refine((v) => /^7\d{10}$/.test(v), "Нужен российский номер: +7 и 10 цифр");
const consent = z.literal(true, { error: "Нужно согласие на обработку персональных данных" });
const last4 = z.string().regex(/^\d{4}$/, "Введите 4 последние цифры телефона");
const code = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^(KD|DM)-[0-9A-Z]{6,7}$/, "Код выглядит так: KD-7K3M9Q");

export const bookingInput = z.object({ sessionId: z.string().min(1), name, phone, consent });
export type BookingInput = z.infer<typeof bookingInput>;

export const batchBookingInput = z.object({
  sessionIds: z.array(z.string().min(1)).min(1, "Выберите хотя бы одно занятие").max(7),
  name,
  phone,
  consent,
});

export const cancelInput = z.object({ code, last4 });
export const lookupInput = z.object({ code, last4 });

export const programInput = z.object({
  goal: z.enum(["lean", "endurance", "strength", "health"]),
  level: z.enum(["new", "regular", "advanced"]),
  days: z.coerce.number().int().min(2, "От 2 до 5 тренировок").max(5, "От 2 до 5 тренировок"),
  times: z.array(z.enum(["morning", "day", "evening"])).max(3),
});

export const LEAD_KINDS = ["trial", "program", "corporate", "kids", "membership", "callback"] as const;

export const leadInput = z.object({
  kind: z.enum(LEAD_KINDS),
  name,
  phone,
  email: z.string().trim().email("Проверьте почту").max(120).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  goal: z.string().trim().max(60).optional().or(z.literal("")),
  age: z.coerce.number({ error: "Возраст числом" }).int("Возраст целым числом").min(AGE_MIN, `Возраст от ${AGE_MIN} лет`).max(AGE_MAX, `Возраст до ${AGE_MAX} лет`).optional(),
  restingHr: z.coerce.number({ error: "Пульс числом" }).int("Пульс целым числом").min(REST_MIN, `Пульс покоя от ${REST_MIN}`).max(REST_MAX, `Пульс покоя до ${REST_MAX}`).optional(),
  plan: z.string().trim().max(40).optional().or(z.literal("")),
  /** JSON of the program; stored as is, length-limited */
  program: z.string().max(8000).optional(),
  comment: z.string().trim().max(600, "Комментарий до 600 символов").optional().or(z.literal("")),
  consent,
});
export type LeadInput = z.infer<typeof leadInput>;

/** First error message per field, for forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
