import { NextResponse, type NextRequest } from "next/server";
import { BOOKING } from "@/lib/club";
import { buildProgram } from "@/lib/program";
import { getSessionsBetween } from "@/lib/schedule";
import { addDays, dateKeyOf } from "@/lib/time";
import { fieldErrors, programInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Builds a week of real classes for a goal, level, number of days and preferred times. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Не удалось прочитать форму" }, { status: 400 });
  }
  const parsed = programInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Проверьте ответы", fields: fieldErrors(parsed.error) }, { status: 422 });
  const now = new Date();
  const today = dateKeyOf(now);
  const sessions = await getSessionsBetween(today, addDays(today, BOOKING.daysAhead - 1), {}, now);
  const program = buildProgram(sessions, parsed.data, today);
  return NextResponse.json(program);
}
