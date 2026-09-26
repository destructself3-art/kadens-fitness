import { NextResponse, type NextRequest } from "next/server";
import { createBookings } from "@/lib/booking";
import { batchBookingInput, fieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** "Book the whole week" from the program builder: one result per session, successes and failures together. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Не удалось прочитать форму" }, { status: 400 });
  }
  const parsed = batchBookingInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте поля формы", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const { sessionIds, name, phone } = parsed.data;
  const results = await createBookings([...new Set(sessionIds)], { name, phone }, "program");
  const booked = results.filter((r) => r.ok).length;
  return NextResponse.json({ results, booked }, { status: booked > 0 ? 201 : 409 });
}
