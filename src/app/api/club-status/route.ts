import { NextResponse } from "next/server";
import { getLiveNow, peopleInClub } from "@/lib/schedule";
import { openStatus } from "@/lib/time";

export const dynamic = "force-dynamic";

/** Header status: people in the club, open or closed, classes running right now. */
export async function GET() {
  const now = new Date();
  const [people, live] = await Promise.all([peopleInClub(now), getLiveNow(now)]);
  const status = openStatus(now);
  return NextResponse.json({ people, open: status.open, label: status.label, live: live.live.length });
}
