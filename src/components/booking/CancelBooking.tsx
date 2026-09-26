"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Field, FormError } from "@/components/ui/Form";
import { cancelBookingRequest } from "./api";

type Props = {
  code: string;
  /** Online cancellation is still possible */
  cancellable: boolean;
  /** Leaving the waitlist rather than giving up a seat */
  waitlist: boolean;
  /** Shown above the button while cancelling is possible */
  note?: ReactNode;
  /** Shown instead of the form when cancelling online is no longer possible */
  fallback?: ReactNode;
  className?: string;
};

/**
 * Cancel with the last four phone digits: enough to stop a stranger who has the link.
 * Render it in the same place for every booking state: it stays mounted across router.refresh(),
 * so the confirmation survives the page switching to «Запись отменена».
 */
export function CancelBooking({ code, cancellable, waitlist, note, fallback, className }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [digits, setDigits] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { promoted: boolean; waitlist: boolean }>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{4}$/.test(digits)) {
      setFieldError("Введите 4 последние цифры телефона");
      return;
    }
    setBusy(true);
    setError(null);
    setFieldError(undefined);
    const res = await cancelBookingRequest(code, digits);
    setBusy(false);
    if (!res.ok) {
      if (res.fields?.last4) setFieldError(res.fields.last4);
      else setError(res.error);
      return;
    }
    // Props change after the refresh, so remember what was cancelled.
    setDone({ promoted: res.data.promoted, waitlist });
    setOpen(false);
    router.refresh();
  }

  const message = done
    ? done.waitlist
      ? "Вы вышли из листа ожидания."
      : done.promoted
        ? "Запись отменена. Ваше место сразу получил первый из листа ожидания."
        : "Запись отменена. Место вернулось в расписание."
    : "";

  const body = done ? null : cancellable ? (
    <>
      {note}
      {open ? (
        <form onSubmit={submit} noValidate className="grid gap-4 rounded-2xl border border-line/15 bg-asphalt/60 p-4 sm:p-5">
          <Field
            label="Последние 4 цифры телефона из записи"
            name="last4"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            placeholder="0000"
            value={digits}
            onChange={(e) => {
              setDigits(e.target.value.replace(/\D/g, "").slice(0, 4));
              setFieldError(undefined);
            }}
            error={fieldError}
            style={{ letterSpacing: "0.35em", fontVariantNumeric: "tabular-nums" }}
          />
          <FormError>{error}</FormError>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn-primary" disabled={busy} aria-busy={busy || undefined}>
              {busy ? "Отменяем…" : waitlist ? "Выйти из очереди" : "Да, отменить"}
            </button>
            <button
              type="button"
              className="btn-quiet"
              onClick={() => {
                setOpen(false);
                setError(null);
                setFieldError(undefined);
              }}
            >
              Не отменять
            </button>
          </div>
        </form>
      ) : (
        <div>
          <button type="button" className="btn-ghost w-full sm:w-auto" onClick={() => setOpen(true)}>
            {waitlist ? "Выйти из листа ожидания" : "Отменить запись"}
          </button>
        </div>
      )}
    </>
  ) : (
    fallback
  );

  return (
    <div className={done || body ? className : undefined}>
      <p aria-live="polite" className={done ? "rounded-xl border border-line/15 bg-raised px-4 py-3 text-[14.5px] text-chalk" : "sr-only"}>
        {message}
      </p>
      {body}
    </div>
  );
}
