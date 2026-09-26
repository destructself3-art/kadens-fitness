import { NextResponse, type NextRequest } from "next/server";
import { lookupBookings } from "@/lib/booking";
import { fieldErrors, lookupInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** «Мои записи»: code + last 4 phone digits → every booking of that phone from yesterday on. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Не удалось прочитать форму" }, { status: 400 });
  }
  const parsed = lookupInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Проверьте поля", fields: fieldErrors(parsed.error) }, { status: 422 });
  const result = await lookupBookings(parsed.data.code, parsed.data.last4);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: 404 });
  return NextResponse.json({ bookings: result.bookings });
}
