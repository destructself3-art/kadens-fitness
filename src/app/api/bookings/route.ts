import { NextResponse, type NextRequest } from "next/server";
import { createBooking } from "@/lib/booking";
import { bookingInput, fieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * Books a place in a class. 201 with the code (status "booked" or "waitlist"),
 * 422 for invalid fields or a closed class, 409 for a duplicate or a lost race.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Не удалось прочитать форму" }, { status: 400 });
  }
  const parsed = bookingInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте поля формы", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const { sessionId, name, phone } = parsed.data;
  const result = await createBooking({ sessionId, name, phone }, "site");
  if (!result.ok) {
    const status = result.reason === "duplicate" || result.reason === "conflict" ? 409 : result.reason === "not-found" ? 404 : 422;
    return NextResponse.json({ error: result.message, reason: result.reason, code: result.code }, { status });
  }
  return NextResponse.json({ code: result.code, status: result.status, position: result.position }, { status: 201 });
}
