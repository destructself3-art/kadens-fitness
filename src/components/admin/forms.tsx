"use client";

// Small admin forms. Each posts to a server action, so it also works before JavaScript loads;
// useActionState shows the answer next to the button.
import { useActionState, useEffect, useId, useState } from "react";
import clsx from "clsx";
import {
  addBooking,
  markAllAttended,
  sessionStatus,
  setSubstitute,
  updateBookingStatus,
  updateLeadStatus,
  type ActionState,
} from "@/app/admin/actions";
import { Field, PhoneField } from "@/components/ui/Form";
import { LEAD_STATUS_LABELS, type BookingStatus, type LeadStatus } from "@/lib/session-types";
import { miniBtn, miniBtnDanger, miniBtnSolid, miniField } from "./styles";

/** The answer of an action: calm for success, scarlet for an error. Always in the DOM for screen readers. */
function ActionMessage({ state, className }: { state: ActionState; className?: string }) {
  return (
    <p role="status" aria-live="polite" className={clsx("text-[13px] leading-snug empty:hidden", state?.error ? "text-pulse" : "text-dust", className)}>
      {state?.error ?? state?.ok ?? ""}
    </p>
  );
}

// ---------- Class: substitute, cancel, restore ----------

export type CoachOption = { slug: string; name: string };

export function SessionControls({
  id,
  cancelled,
  started,
  note,
  substitute,
  regularName,
  options,
  className,
}: {
  id: string;
  cancelled: boolean;
  started: boolean;
  note: string | null;
  /** Current substitute slug */
  substitute: string | null;
  /** The coach on the timetable */
  regularName: string;
  /** Other coaches of this format */
  options: CoachOption[];
  className?: string;
}) {
  const [subState, subAction, subPending] = useActionState<ActionState, FormData>(setSubstitute, null);
  const [statusState, statusAction, statusPending] = useActionState<ActionState, FormData>(sessionStatus, null);
  const uid = useId();

  return (
    <div className={clsx("grid gap-6", className)}>
      <form action={subAction} className="grid gap-2">
        <input type="hidden" name="id" value={id} />
        <label htmlFor={`${uid}-coach`} className="text-[13px] font-medium text-dust">
          Кто ведёт
        </label>
        <div className="flex flex-wrap gap-2">
          {/* Keyed by the saved value: after the action React resets the form, and a fresh select starts from the new coach */}
          <select
            key={substitute ?? ""}
            id={`${uid}-coach`}
            name="coach"
            defaultValue={substitute ?? ""}
            className={clsx(miniField, "min-w-0 flex-1 basis-[180px]")}
          >
            <option value="">{regularName} (основной)</option>
            {options.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name}, замена
              </option>
            ))}
          </select>
          <button type="submit" disabled={subPending} className={miniBtn}>
            {subPending ? "Сохраняем…" : "Сохранить"}
          </button>
        </div>
        {options.length === 0 && <p className="text-[12.5px] text-dust">Этот формат ведёт только один тренер: замену из команды не поставить.</p>}
        <ActionMessage state={subState} />
      </form>

      <form action={statusAction} className="grid gap-2">
        <input type="hidden" name="id" value={id} />
        {cancelled ? (
          <>
            <input type="hidden" name="op" value="restore" />
            <p className="text-[13px] font-medium text-dust">
              Отменено{note && note !== "Отменено" ? <>. На сайте: «{note.replace(/^Отменено:\s*/, "")}»</> : null}
            </p>
            <div>
              <button type="submit" disabled={statusPending} className={miniBtn}>
                {statusPending ? "Возвращаем…" : "Вернуть в расписание"}
              </button>
            </div>
          </>
        ) : started ? (
          <p className="text-[13px] text-dust">Занятие уже началось, отменить его нельзя.</p>
        ) : (
          <>
            <input type="hidden" name="op" value="cancel" />
            <label htmlFor={`${uid}-note`} className="text-[13px] font-medium text-dust">
              Отменить занятие
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                id={`${uid}-note`}
                name="note"
                maxLength={140}
                placeholder="Причина для сайта: тренер заболел"
                className={clsx(miniField, "min-w-0 flex-1 basis-[180px]")}
              />
              <button type="submit" disabled={statusPending} className={miniBtnDanger}>
                {statusPending ? "Отменяем…" : "Отменить"}
              </button>
            </div>
          </>
        )}
        <ActionMessage state={statusState} />
      </form>
    </div>
  );
}

// ---------- Roster ----------

const ROSTER_ACTIONS: Record<BookingStatus, { status: string; label: string; danger?: boolean }[]> = {
  booked: [
    { status: "attended", label: "Пришёл" },
    { status: "no_show", label: "Не пришёл", danger: true },
    { status: "cancelled", label: "Отменить", danger: true },
  ],
  waitlist: [
    { status: "booked", label: "В группу" },
    { status: "cancelled", label: "Убрать", danger: true },
  ],
  attended: [
    { status: "no_show", label: "Не пришёл", danger: true },
    { status: "booked", label: "Снять отметку" },
  ],
  no_show: [
    { status: "attended", label: "Пришёл" },
    { status: "booked", label: "Снять отметку" },
  ],
  cancelled: [{ status: "booked", label: "Вернуть" }],
};

export function RosterActions({ id, status, name, canMark }: { id: string; status: BookingStatus; name: string; canMark: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateBookingStatus, null);
  // Before check-in opens a booked guest can only be cancelled.
  const actions = (ROSTER_ACTIONS[status] ?? []).filter((a) => canMark || (a.status !== "attended" && a.status !== "no_show"));
  return (
    <form action={action} className="grid gap-1">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-nowrap items-center gap-1.5">
        {actions.map((a) => (
          <button
            key={a.status}
            type="submit"
            name="status"
            value={a.status}
            disabled={pending}
            aria-label={`${a.label}: ${name}`}
            className={clsx(a.danger ? miniBtnDanger : miniBtn, "!px-3 !text-[13px]")}
          >
            {a.label}
          </button>
        ))}
      </div>
      <ActionMessage state={state} className="max-w-[300px] whitespace-normal" />
    </form>
  );
}

export function MarkAllAttended({ sessionId, count }: { sessionId: string; count: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(markAllAttended, null);
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="sessionId" value={sessionId} />
      <button type="submit" disabled={pending || count === 0} className={miniBtnSolid}>
        Все записанные пришли{count ? ` · ${count}` : ""}
      </button>
      <ActionMessage state={state} />
    </form>
  );
}

/** A booking taken at the desk or by phone. */
export function AddBookingForm({ sessionId, full }: { sessionId: string; full: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addBooking, null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  useEffect(() => {
    if (state?.ok) {
      setName("");
      setPhone("");
    }
  }, [state]);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="sessionId" value={sessionId} />
      <Field label="Имя" name="name" autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} error={state?.fields?.name} />
      <PhoneField value={phone} onChange={setPhone} error={state?.fields?.phone} />
      <button type="submit" disabled={pending} className="btn-primary disabled:cursor-wait disabled:opacity-60">
        {pending ? "Записываем…" : full ? "Записать в лист ожидания" : "Записать"}
      </button>
      <ActionMessage state={state?.fields ? { error: state.error } : state} />
    </form>
  );
}

// ---------- Leads ----------

const LEAD_ORDER: LeadStatus[] = ["new", "contacted", "converted", "lost"];

export function LeadStatusForm({ id, status, name }: { id: string; status: string; name: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateLeadStatus, null);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="id" value={id} />
      <div role="group" aria-label={`Статус заявки: ${name}`} className="flex flex-wrap gap-1.5">
        {LEAD_ORDER.map((s) => (
          <button
            key={s}
            type="submit"
            name="status"
            value={s}
            aria-pressed={s === status}
            disabled={pending || s === status}
            className={clsx(
              "inline-flex min-h-11 items-center rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
              s === status
                ? s === "new"
                  ? "border-pulse bg-pulse text-asphalt disabled:cursor-default"
                  : "border-chalk bg-chalk text-asphalt disabled:cursor-default"
                : "border-line/20 text-dust hover:border-chalk hover:text-chalk disabled:opacity-50",
            )}
          >
            {LEAD_STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      <ActionMessage state={state} />
    </form>
  );
}
