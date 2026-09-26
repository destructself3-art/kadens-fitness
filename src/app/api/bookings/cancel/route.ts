import { NextResponse, type NextRequest } from "next/server";
import { cancelByGuest } from "@/lib/booking";
import { cancelInput, fieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Cancels a booking by its code and the last 4 digits of the phone number. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Не удалось прочитать форму" }, { status: 400 });
  }
  const parsed = cancelInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Проверьте поля", fields: fieldErrors(parsed.error) }, { status: 422 });
  const result = await cancelByGuest(parsed.data.code, parsed.data.last4);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: 409 });
  return NextResponse.json({ ok: true, promoted: result.promoted });
}
