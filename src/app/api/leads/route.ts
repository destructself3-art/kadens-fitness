import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fieldErrors, leadInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Trial class, program for a coach, corporate, kids club, membership or callback requests. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Не удалось прочитать форму" }, { status: 400 });
  }
  const parsed = leadInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте поля формы", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const d = parsed.data;
  const lead = await prisma.lead.create({
    data: {
      kind: d.kind,
      name: d.name,
      phone: d.phone,
      email: d.email || null,
      company: d.company || null,
      goal: d.goal || null,
      age: d.age ?? null,
      restingHr: d.restingHr ?? null,
      plan: d.plan || null,
      program: d.program || null,
      comment: d.comment || null,
      source: "site",
    },
  });
  return NextResponse.json({ id: lead.id }, { status: 201 });
}
