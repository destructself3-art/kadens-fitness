"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Check, CircleX, Hourglass } from "lucide-react";
import { Consent, Field, FormError, PhoneField } from "@/components/ui/Form";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { BOOKING } from "@/lib/club";
import { plural } from "@/lib/format";
import type { ProgramItem } from "@/lib/program";
import { formatDay } from "@/lib/time";
import { dayLabel } from "./WeekStrip";

/** One entry of POST /api/bookings/batch → results (CreateResult in src/lib/booking.ts). */
type BatchResult =
  | { ok: true; code: string; status: "booked" | "waitlist"; position: number | null; sessionId: string }
  | { ok: false; reason: "not-found" | "closed" | "duplicate" | "conflict"; message: string; code?: string; sessionId: string };

const cancelHours = BOOKING.cancelBeforeMin / 60;

/** "сегодня, 26 сентября" or "пн, 28 сентября" */
function shortDay(dateKey: string, today: string) {
  const f = formatDay(dateKey);
  const label = dayLabel(dateKey, today);
  return `${label === f.weekday ? f.weekdayShort : label}, ${f.dayMonth}`;
}

function ResultLine({ item, result, today }: { item: ProgramItem; result: BatchResult | undefined; today: string }) {
  const s = item.session;
  const when = `${dayLabel(s.dateKey, today)}, ${formatDay(s.dateKey).dayMonth}, ${s.time}`;
  let icon = <CircleX className="h-5 w-5 text-dust" aria-hidden />;
  let status: React.ReactNode = "Не получилось записать. Попробуйте на странице занятия.";
  let link: React.ReactNode = (
    <Link href={`/schedule/${s.id}`} className="link-underline text-chalk">
      Открыть занятие
    </Link>
  );
  if (result?.ok && result.status === "booked") {
    icon = <Check className="h-5 w-5 text-pulse" strokeWidth={3} aria-hidden />;
    status = <span className="font-semibold text-chalk">Записаны</span>;
    link = (
      <Link href={`/booking/${result.code}`} className="link-underline font-semibold text-chalk">
        Запись {result.code}
      </Link>
    );
  } else if (result?.ok) {
    icon = <Hourglass className="h-5 w-5 text-z2" aria-hidden />;
    status = (
      <>
        <span className="font-semibold text-chalk">Лист ожидания</span>, место в очереди{" "}
        <span className="digits text-[18px] text-chalk">{result.position ?? "—"}</span>. Освободится место — запишем вас автоматически.
      </>
    );
    link = (
      <Link href={`/booking/${result.code}`} className="link-underline font-semibold text-chalk">
        Запись {result.code}
      </Link>
    );
  } else if (result) {
    status = result.message;
    if (result.reason === "duplicate" && result.code) {
      icon = <Check className="h-5 w-5 text-chalk" strokeWidth={3} aria-hidden />;
      link = (
        <Link href={`/booking/${result.code}`} className="link-underline font-semibold text-chalk">
          Ваша запись {result.code}
        </Link>
      );
    }
  }
  return (
    <li className="grid grid-cols-[24px_1fr] gap-x-3 gap-y-1 border-b border-line/[0.07] py-4 last:border-b-0">
      <span className="pt-0.5">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-chalk">
          {s.classTitle} <span className="font-normal text-dust">· {when}</span>
        </span>
        <span className="mt-1 block text-[14px] leading-snug text-dust">{status}</span>
        <span className="mt-2 block text-[14px]">{link}</span>
      </span>
    </li>
  );
}

/** "Book the whole week": one form, one request, a line per class with its own outcome. */
export function BookWeekForm({ items, today }: { items: ProgramItem[]; today: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<BatchResult[] | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setErrors({});
    setFormError(null);
    try {
      const res = await fetch("/api/bookings/batch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionIds: items.map((i) => i.session.id), name, phone, consent }),
      });
      const data = await res.json().catch(() => null);
      if (data && Array.isArray(data.results)) {
        setResults(data.results as BatchResult[]);
        requestAnimationFrame(() => resultRef.current?.focus());
        return;
      }
      setErrors(data?.fields ?? {});
      setFormError(data?.fields?.sessionIds ?? data?.error ?? "Не получилось записаться. Попробуйте ещё раз.");
    } catch {
      setFormError("Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
  }

  if (results) {
    const byId = new Map(results.map((r) => [r.sessionId, r]));
    const booked = results.filter((r) => r.ok && r.status === "booked").length;
    const waiting = results.filter((r) => r.ok && r.status === "waitlist").length;
    const ok = booked + waiting;
    const allDuplicates = results.every((r) => !r.ok && r.reason === "duplicate");
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="focus:outline-none">
        <p className="eyebrow">{ok > 0 ? "Готово" : "Не получилось"}</p>
        <p className="display mt-3 text-d-4 stretch-normal">
          {booked > 0 ? (
            <>
              Записали на <span className="digits text-pulse">{booked}</span> из <span className="digits">{items.length}</span>
            </>
          ) : waiting > 0 ? (
            "Вы в листе ожидания"
          ) : allDuplicates ? (
            "Вы уже записаны"
          ) : (
            "Записаться не вышло"
          )}
        </p>
        {waiting > 0 && (
          <p className="mt-2 text-[14.5px] text-dust">
            {booked > 0 && "Ещё "}
            <span className="digits text-[18px] text-chalk">{waiting}</span> {plural(waiting, "занятие", "занятия", "занятий")} в листе ожидания: освободится место,
            и запись подтвердится автоматически.
          </p>
        )}
        <ul className="mt-5">
          {items.map((item) => (
            <ResultLine key={item.session.id} item={item} result={byId.get(item.session.id)} today={today} />
          ))}
        </ul>
        <p className="mt-5 text-[13.5px] leading-relaxed text-dust">
          Отменить запись онлайн можно не позже чем за {cancelHours} {plural(cancelHours, "час", "часа", "часов")} до начала: на странице записи нужен её код и четыре
          последние цифры телефона. Все записи на одном номере — в разделе{" "}
          <Link href="/booking" className="text-chalk underline decoration-line/40 underline-offset-4 hover:decoration-chalk">
            «Мои записи»
          </Link>
          .
        </p>
        <button
          type="button"
          className="btn-quiet mt-3 -ml-4"
          onClick={() => {
            setResults(null);
            setName("");
            setPhone("");
            setConsent(false);
          }}
        >
          Записать другого человека
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4" aria-busy={sending}>
      <ul className="mb-3 grid gap-px overflow-hidden rounded-2xl border border-line/10 bg-line/10" aria-label="Что войдёт в запись">
        {items.map(({ session: s }) => (
          <li key={s.id} className="grid grid-cols-[52px_minmax(0,1fr)] items-baseline gap-x-3 bg-asphalt px-4 py-3 text-[14px]">
            <span className="digits text-[20px] leading-none text-chalk">{s.time}</span>
            <span className="min-w-0 sm:flex sm:items-baseline sm:justify-between sm:gap-3">
              <span className="block truncate font-semibold text-chalk">{s.classTitle}</span>
              <span className="block text-[13px] text-dust sm:flex-none">{shortDay(s.dateKey, today)}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field label="Имя" name="name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <PhoneField value={phone} onChange={setPhone} error={errors.phone} />
      </div>
      <Consent checked={consent} onChange={setConsent} error={errors.consent} />
      <FormError>{formError}</FormError>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <MagneticButton type="submit" disabled={sending} className="w-full sm:w-auto">
          {sending ? "Записываем…" : "Записаться на всю неделю"}
        </MagneticButton>
        <span className="text-[13px] text-dust">
          <span className="digits text-[18px] text-chalk">{items.length}</span> {plural(items.length, "занятие", "занятия", "занятий")} одной формой
        </span>
      </div>
    </form>
  );
}
