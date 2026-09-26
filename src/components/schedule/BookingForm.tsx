"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BeatDot } from "@/components/pulse/Beat";
import { Consent, Field, FormError, PhoneField } from "@/components/ui/Form";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { BOOKING, CLUB } from "@/lib/club";
import { normalizePhone, plural } from "@/lib/format";
import type { SessionView } from "@/lib/session-types";
import { weekStartOf } from "@/lib/time";

type Alternative = { id: string; label: string };

type Props = {
  session: SessionView;
  /** For "not-open-yet": when booking opens, e.g. "завтра" or "28 сентября" */
  opensLabel: string | null;
  /** The next bookable session of the same class, offered when this one is closed */
  alternative: Alternative | null;
};

type ApiError = { error?: string; reason?: string; code?: string; fields?: Record<string, string> };

function Closed({ session, opensLabel, alternative }: Props) {
  const reason = session.closedReason;
  const title =
    reason === "cancelled"
      ? "Занятие отменено"
      : reason === "started"
        ? session.live
          ? "Занятие идёт прямо сейчас"
          : "Занятие уже прошло"
        : reason === "closing"
          ? "Онлайн-запись закрылась"
          : "Запись ещё не открыта";
  const text =
    reason === "cancelled"
      ? "Запишитесь на соседнее время: ниже есть это же занятие в другие дни и всё, что идёт в студии в этот день."
      : reason === "started"
        ? session.live
          ? `Закончится в ${session.endTime}. Опоздавших на разминку тренер пускает, но записаться онлайн уже нельзя.`
          : "Такой же класс идёт на этой неделе ещё не раз."
        : reason === "closing"
          ? `Онлайн-запись закрылась за ${BOOKING.closesBeforeMin} минут до начала. Подходите на ресепшен: если место свободно, вас впустят.`
          : `Запись откроется ${opensLabel ?? "позже"}: онлайн записаться можно не раньше чем за ${BOOKING.daysAhead} дней до занятия.`;

  return (
    <div role="status" className="grid gap-4">
      <p className="flex items-center gap-2.5 text-[18px] font-semibold text-chalk">
        {session.live && <BeatDot className="h-2.5 w-2.5 text-pulse" />}
        {title}
      </p>
      <p className="text-[15px] leading-relaxed text-dust">{text}</p>
      <div className="flex flex-wrap gap-3 pt-1">
        {alternative && (
          <Link href={`/schedule/${alternative.id}`} className="btn-primary">
            {alternative.label}
          </Link>
        )}
        <Link href={`/schedule?week=${weekStartOf(session.dateKey)}&day=${session.dateKey}`} className="btn-ghost">
          Весь день в расписании
        </Link>
      </div>
    </div>
  );
}

/**
 * Two fields and a consent: POST /api/bookings. A full class books into the waitlist automatically,
 * so the only difference for the visitor is the button label and the explanation above it.
 */
export function BookingForm(props: Props) {
  const { session } = props;
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const focusInvalid = useRef(false);

  // After a failed check, move focus to the first field React has just marked invalid.
  useEffect(() => {
    if (!focusInvalid.current) return;
    focusInvalid.current = false;
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [errors]);

  if (!session.bookable) return <Closed {...props} />;

  const full = session.left === 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setNotice(null);
    setDuplicate(null);
    const local: Record<string, string> = {};
    if (name.trim().length < 2) local.name = "Напишите, как к вам обращаться";
    if (!/^7\d{10}$/.test(normalizePhone(phone))) local.phone = "Нужен российский номер: +7 и 10 цифр";
    if (!consent) local.consent = "Нужно согласие на обработку персональных данных";
    setErrors(local);
    if (Object.keys(local).length) {
      focusInvalid.current = true;
      return;
    }

    setSending(true);
    let leaving = false;
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, name: name.trim(), phone, consent }),
      });
      const data = (await res.json().catch(() => ({}))) as ApiError & { code?: string };
      if (res.status === 201 && data.code) {
        leaving = true;
        router.push(`/booking/${data.code}?new=1`);
        return;
      }
      if (res.status === 409 && data.reason === "duplicate" && data.code) {
        setDuplicate(data.code);
        return;
      }
      if (res.status === 422 && data.fields) {
        focusInvalid.current = true;
        setErrors(data.fields);
        if (data.fields.sessionId) setNotice(data.error ?? "Не получилось записаться.");
        return;
      }
      setNotice(data.error ?? "Не получилось записаться. Попробуйте ещё раз.");
      // The class closed or was cancelled while the page was open: show its real state.
      if (res.status === 422 || res.status === 404) router.refresh();
    } catch {
      setNotice("Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      if (!leaving) setSending(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="grid gap-5" aria-describedby="booking-terms">
      {full && (
        <div className="rounded-xl border border-line/15 border-l-pulse bg-raised px-4 py-3.5 text-[14.5px] leading-relaxed text-chalk [border-left-width:3px]">
          <p className="font-semibold">Мест нет, но есть лист ожидания</p>
          <p className="mt-1 text-dust">
            {session.waitlist > 0
              ? `Перед вами ${session.waitlist} ${plural(session.waitlist, "человек", "человека", "человек")}. `
              : "Вы будете первым в очереди. "}
            Если кто-то отменит запись, место автоматически перейдёт первому в очереди. Статус видно по коду записи в разделе «Мои записи».
          </p>
        </div>
      )}

      <Field
        label="Имя"
        name="name"
        autoComplete="given-name"
        placeholder="Как к вам обращаться"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        maxLength={60}
        required
      />
      <PhoneField value={phone} onChange={setPhone} error={errors.phone} />
      <Consent checked={consent} onChange={setConsent} error={errors.consent} />

      <div aria-live="polite" className="empty:hidden">
        {duplicate && (
          <p role="alert" className="rounded-xl border border-line/20 bg-raised px-4 py-3 text-[14.5px] leading-relaxed text-chalk">
            С этим номером вы уже записаны на это занятие. Одна запись на человека.{" "}
            <Link href={`/booking/${duplicate}`} className="font-semibold underline decoration-pulse underline-offset-4">
              Открыть запись {duplicate}
            </Link>
          </p>
        )}
        {notice && <FormError>{notice}</FormError>}
      </div>

      <MagneticButton type="submit" disabled={sending} className="w-full">
        {sending ? "Записываем…" : full ? "Встать в лист ожидания" : "Записаться"}
      </MagneticButton>

      <p id="booking-terms" className="text-[13px] leading-relaxed text-dust">
        Регистрироваться не нужно: после записи вы получите билет с кодом. Отменить онлайн можно не позже чем за {BOOKING.cancelBeforeMin / 60}{" "}
        {plural(BOOKING.cancelBeforeMin / 60, "час", "часа", "часов")} до начала, позже — по телефону{" "}
        <a href={CLUB.phoneHref} className="whitespace-nowrap text-chalk underline decoration-line/40 underline-offset-2 hover:decoration-chalk">
          {CLUB.phone}
        </a>
        .
      </p>
    </form>
  );
}
