"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getClass } from "@/data/classes";
import { getCoach } from "@/data/coaches";
import { getSpace } from "@/data/spaces";
import type { ClassSlug, CoachSlug, SpaceSlug } from "@/data/types";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import { createBooking, setBookingStatus, type AdminStatus } from "@/lib/booking";
import { plural } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import type { LeadStatus } from "@/lib/session-types";
import { timeOf } from "@/lib/time";
import { bookingInput, fieldErrors } from "@/lib/validation";
import { MARK_BEFORE_MIN, markingOpensAt } from "@/components/admin/rules";

export type ActionState = { ok?: string; error?: string; fields?: Record<string, string> } | null;

const NOTE_MAX = 140;
const SUBSTITUTE_NOTE = "Замена тренера";
const ADMIN_STATUSES: AdminStatus[] = ["booked", "attended", "no_show", "cancelled"];
const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "converted", "lost"];

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

/** Admin changes show on the public site at once: schedule, class pages, coach pages, the home page. */
function refreshEverything() {
  revalidatePath("/", "layout");
}

// ---------- Session ----------

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!checkPassword(String(formData.get("password") ?? ""))) return { error: "Пароль не подошёл" };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// ---------- Classes: cancel, restore, substitute ----------

/** Cancels a class (op=cancel, with a public note) or puts it back (op=restore). Bookings stay, so a restore loses nothing. */
export async function sessionStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  return text(formData, "op") === "restore" ? restoreSession(id) : cancelSession(id, formData);
}

async function cancelSession(id: string, formData: FormData): Promise<ActionState> {
  const note = text(formData, "note").slice(0, NOTE_MAX);
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) return { error: "Занятие не найдено" };
  if (session.status === "cancelled") return { ok: "Занятие уже отменено" };
  if (session.startsAt.getTime() <= Date.now()) return { error: "Занятие уже началось, отменять поздно" };
  await prisma.session.update({
    where: { id },
    data: { status: "cancelled", note: note ? (/^отмен/i.test(note) ? note : `Отменено: ${note}`) : "Отменено" },
  });
  const people = await prisma.booking.count({ where: { sessionId: id, status: { in: ["booked", "waitlist"] } } });
  refreshEverything();
  return {
    ok: people
      ? `Отменено. ${people} ${plural(people, "человек записан", "человека записаны", "человек записаны")}: предупредите их, телефоны в списке группы`
      : "Отменено, на сайте занятие уже зачёркнуто",
  };
}

async function restoreSession(id: string): Promise<ActionState> {
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) return { error: "Занятие не найдено" };
  if (session.status !== "cancelled") return { ok: "Занятие и так в расписании" };
  await prisma.session.update({
    where: { id },
    data: { status: "scheduled", note: session.substituteId ? SUBSTITUTE_NOTE : null },
  });
  refreshEverything();
  return { ok: "Вернули в расписание" };
}

export async function setSubstitute(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  const slug = text(formData, "coach");
  const session = await prisma.session.findUnique({
    where: { id },
    include: { classType: { select: { slug: true } }, coach: { select: { slug: true } } },
  });
  if (!session) return { error: "Занятие не найдено" };
  const keepNote = session.status === "cancelled" || (session.note && session.note !== SUBSTITUTE_NOTE);

  if (!slug) {
    if (!session.substituteId) return { ok: "Ведёт основной тренер" };
    await prisma.session.update({ where: { id }, data: { substituteId: null, ...(keepNote ? {} : { note: null }) } });
    refreshEverything();
    return { ok: `Замену сняли: ведёт ${getCoach(session.coach.slug as CoachSlug).name}` };
  }

  const cls = getClass(session.classType.slug as ClassSlug);
  if (!cls.coaches.includes(slug as CoachSlug) || slug === session.coach.slug) {
    return { error: "Этот тренер не ведёт такой формат" };
  }
  const coach = await prisma.coach.findUnique({ where: { slug } });
  if (!coach) return { error: "Тренер не найден" };

  // A coach cannot be in two studios at once.
  const clash = await prisma.session.findFirst({
    where: {
      id: { not: id },
      status: "scheduled",
      startsAt: { lt: session.endsAt },
      endsAt: { gt: session.startsAt },
      OR: [{ substituteId: coach.id }, { coachId: coach.id, substituteId: null }],
    },
    include: { classType: { select: { slug: true } }, studio: { select: { slug: true } } },
  });
  const name = getCoach(slug as CoachSlug).name;
  if (clash) {
    const title = getClass(clash.classType.slug as ClassSlug).title;
    const studio = getSpace(clash.studio.slug as SpaceSlug).name;
    return { error: `${name} в это время ведёт «${title}» («${studio}», ${timeOf(clash.startsAt)}–${timeOf(clash.endsAt)})` };
  }

  await prisma.session.update({ where: { id }, data: { substituteId: coach.id, ...(keepNote ? {} : { note: SUBSTITUTE_NOTE }) } });
  refreshEverything();
  return { ok: `Замена: ведёт ${name}. На сайте уже видно` };
}

// ---------- Bookings ----------

export async function updateBookingStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status") as AdminStatus;
  if (!id || !ADMIN_STATUSES.includes(status)) return { error: "Неизвестное действие" };
  const before = await prisma.booking.findUnique({
    where: { id },
    select: { sessionId: true, seat: true, status: true, session: { select: { startsAt: true, status: true } } },
  });
  if (!before) return { error: "Запись не найдена" };
  if (status === "attended" || status === "no_show") {
    if (before.session.status === "cancelled") return { error: "Занятие отменено: отмечать приход не нужно" };
    if (Date.now() < markingOpensAt(before.session.startsAt).getTime()) {
      return { error: `Отметить приход можно за ${MARK_BEFORE_MIN} минут до начала` };
    }
  }
  const waiting = status === "cancelled" && before.seat ? await prisma.booking.count({ where: { sessionId: before.sessionId, status: "waitlist" } }) : 0;
  const result = await setBookingStatus(id, status);
  if (!result.ok) return { error: result.message };
  refreshEverything();
  const done: Record<AdminStatus, string> = {
    attended: "Отметили: пришёл",
    no_show: "Отметили: не пришёл",
    booked: before.status === "waitlist" ? "Перевели в группу" : "Вернули в записанные",
    cancelled: waiting ? "Отменили, место ушло первому из листа ожидания" : "Запись отменена",
  };
  return { ok: done[status] };
}

export async function markAllAttended(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const sessionId = text(formData, "sessionId");
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) return { error: "Занятие не найдено" };
  if (session.startsAt.getTime() > Date.now()) return { error: "Занятие ещё не началось" };
  const { count } = await prisma.booking.updateMany({ where: { sessionId, status: "booked" }, data: { status: "attended" } });
  refreshEverything();
  return { ok: count ? `Отметили пришедшими: ${count}` : "Отмечать некого" };
}

/** A booking taken at the desk or by phone: same seats, waitlist and duplicate protection as the site. */
export async function addBooking(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = bookingInput.safeParse({
    sessionId: text(formData, "sessionId"),
    name: formData.get("name"),
    phone: String(formData.get("phone") ?? ""),
    consent: true,
  });
  if (!parsed.success) return { error: "Проверьте имя и телефон", fields: fieldErrors(parsed.error) };
  const { sessionId, name, phone } = parsed.data;
  const result = await createBooking({ sessionId, name, phone }, "admin");
  if (!result.ok) {
    return { error: result.reason === "duplicate" ? `Этот номер уже записан на занятие, код ${result.code}` : result.message };
  }
  refreshEverything();
  return {
    ok:
      result.status === "booked"
        ? `${name} в группе, код ${result.code}`
        : `Мест нет: ${name} в листе ожидания, №${result.position}, код ${result.code}`,
  };
}

// ---------- Leads ----------

export async function updateLeadStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status") as LeadStatus;
  if (!id || !LEAD_STATUSES.includes(status)) return { error: "Неизвестный статус" };
  const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });
  if (!lead) return { error: "Заявка не найдена" };
  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath("/admin", "layout");
  return { ok: "Статус обновлён" };
}
