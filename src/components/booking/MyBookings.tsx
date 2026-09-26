"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { Field, FormError } from "@/components/ui/Form";
import type { BookingView } from "@/lib/session-types";
import { BOOKING } from "@/lib/club";
import { plural } from "@/lib/format";
import { lookupBookingsRequest } from "./api";
import { BookingCard } from "./BookingCard";
import { CODE_PATTERN, isUpcoming, normalizeCode, ticketState } from "./ticket-state";

// «Мои записи»: a booking code plus the last four phone digits open every booking of that number.
// The last successful pair lives in sessionStorage, so the list comes back on reload until the tab is closed.

const STORAGE_KEY = "kadens:my-bookings";

type Query = { code: string; last4: string };
type Loaded = { query: Query; bookings: BookingView[]; loadedAt: Date };
type FieldErrors = { code?: string; last4?: string };

function readStored(): Query | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<Query>;
    return typeof v.code === "string" && CODE_PATTERN.test(v.code) && typeof v.last4 === "string" && /^\d{4}$/.test(v.last4)
      ? { code: v.code, last4: v.last4 }
      : null;
  } catch {
    return null;
  }
}

function writeStored(q: Query | null) {
  try {
    if (q) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(q));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: the list simply will not come back after a reload.
  }
}

const bookingsLabel = (n: number) => `${n} ${plural(n, "запись", "записи", "записей")}`;
const classesLabel = (n: number) => `${n} ${plural(n, "занятие", "занятия", "занятий")}`;

export function MyBookings({ initialCode, aside }: { initialCode: string; aside?: ReactNode }) {
  const [code, setCode] = useState(initialCode);
  const [last4, setLast4] = useState("");
  const [fields, setFields] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const requestId = useRef(0);

  const run = useCallback(async (q: Query, mode: "submit" | "restore" | "reload") => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    if (mode !== "reload") setNotice(null);
    const res = await lookupBookingsRequest(q.code, q.last4);
    if (id !== requestId.current) return; // a newer request is on its way
    setLoading(false);
    if (!res.ok) {
      if (mode === "restore") {
        // The stored pair no longer works: forget it quietly and show the empty form.
        writeStored(null);
        setLast4("");
        return;
      }
      if (res.fields && (res.fields.code || res.fields.last4)) {
        setFields({ code: res.fields.code, last4: res.fields.last4 });
      } else {
        setError(res.error);
      }
      if (mode === "submit") setLoaded(null);
      setAnnounce(res.error);
      return;
    }
    writeStored(q);
    const bookings = res.data.bookings;
    setLoaded({ query: q, bookings, loadedAt: new Date() });
    if (mode !== "reload") {
      const ahead = bookings.filter((b) => isUpcoming(ticketState(b))).length;
      setAnnounce(`Нашли ${bookingsLabel(bookings.length)}, впереди ${classesLabel(ahead)}.`);
    }
  }, []);

  // Restore the last successful lookup of this tab.
  useEffect(() => {
    const stored = readStored();
    if (!stored || (initialCode && stored.code !== initialCode)) return;
    setCode(stored.code);
    setLast4(stored.last4);
    void run(stored, "restore");
  }, [initialCode, run]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: FieldErrors = {};
    const normalized = normalizeCode(code);
    if (!CODE_PATTERN.test(normalized)) next.code = "Код выглядит так: KD-7K3M9Q";
    if (!/^\d{4}$/.test(last4)) next.last4 = "Введите 4 последние цифры телефона";
    setFields(next);
    setError(null);
    if (next.code || next.last4) {
      setAnnounce("Проверьте поля формы.");
      return;
    }
    setCode(normalized);
    void run({ code: normalized, last4 }, "submit");
  }

  function forget() {
    requestId.current++;
    writeStored(null);
    setLoaded(null);
    setLoading(false);
    setLast4("");
    setNotice(null);
    setAnnounce("Записи скрыты. Код и цифры на этом устройстве забыты.");
  }

  const onCancelled = (message: string) => {
    setNotice(message);
    setAnnounce(message);
    if (loaded) void run(loaded.query, "reload");
  };

  const upcoming = loaded ? loaded.bookings.filter((b) => isUpcoming(ticketState(b))) : [];
  const archive = loaded ? loaded.bookings.filter((b) => !isUpcoming(ticketState(b))).reverse() : [];
  const owner = loaded ? (loaded.bookings.find((b) => b.code === loaded.query.code) ?? loaded.bookings[0]) : null;
  const firstName = owner?.name.trim().split(/\s+/)[0];

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-8">
      <div className="grid min-w-0 content-start gap-8 lg:col-span-5 lg:col-start-1 lg:row-start-1">
        <form onSubmit={submit} noValidate aria-labelledby="lookup-title" className="card grid gap-5 p-5 sm:p-7">
          <div>
            <p className="eyebrow">Без пароля и регистрации</p>
            <h2 id="lookup-title" className="display mt-3 text-d-4 stretch-normal">
              Найти мои записи
            </h2>
          </div>
          <Field
            label="Код записи"
            name="code"
            placeholder="KD-7K3M9Q"
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            maxLength={12}
            value={code}
            onChange={(e) => {
              setCode(normalizeCode(e.target.value));
              setFields((f) => ({ ...f, code: undefined }));
            }}
            error={fields.code}
            hint="Латиницей. Если набрали в русской раскладке, переведём сами."
            style={{ fontFamily: "var(--font-digits)", fontSize: 24, letterSpacing: "0.06em", fontWeight: 700 }}
          />
          <Field
            label="Последние 4 цифры телефона"
            name="last4"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            placeholder="0000"
            value={last4}
            onChange={(e) => {
              setLast4(e.target.value.replace(/\D/g, "").slice(0, 4));
              setFields((f) => ({ ...f, last4: undefined }));
            }}
            error={fields.last4}
            hint="Того номера, на который записывались."
            style={{ fontFamily: "var(--font-digits)", fontSize: 24, letterSpacing: "0.4em", fontWeight: 700 }}
          />
          <FormError>{error}</FormError>
          <button type="submit" className="btn-primary w-full" disabled={loading} aria-busy={loading || undefined}>
            {loading ? "Ищем…" : "Показать записи"}
          </button>
          <p className="text-[13px] leading-snug text-dust">
            Код и цифры запомним только в этой вкладке, чтобы после обновления страницы не вводить их заново. Закроете вкладку — забудем.
          </p>
        </form>
      </div>

      <div className="min-w-0 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
        <p aria-live="polite" className="sr-only">
          {announce}
        </p>

        {!loaded && loading && (
          <div aria-hidden className="grid gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[132px] animate-pulse rounded-2xl border border-line/10 bg-graphite motion-reduce:animate-none" />
            ))}
          </div>
        )}

        {!loaded && !loading && (
          <div className="ecg-grid relative grid min-h-[360px] content-end overflow-hidden rounded-card border border-line/10 p-6 sm:p-9">
            <svg aria-hidden viewBox="0 0 600 60" preserveAspectRatio="none" className="absolute inset-x-0 top-[38%] h-14 w-full">
              <path d="M0 30 H240 l10 -4 l8 4 l6 3 l8 -26 l8 44 l6 -18 l8 1 H600" fill="none" stroke="#FF3A24" strokeWidth={2} vectorEffect="non-scaling-stroke" opacity={0.7} />
            </svg>
            <p className="display text-d-3 stretch-narrow">Здесь появятся ваши занятия</p>
            <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-dust">
              Один код открывает все записи на ваш номер: предстоящие, лист ожидания и прошедшие со вчерашнего дня. Запись открывается за {BOOKING.daysAhead}{" "}
              дней, так что впереди будет максимум неделя.
            </p>
          </div>
        )}

        {loaded && (
          <div aria-busy={loading || undefined} className="grid gap-12">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line/10 pb-6">
              <div>
                <p className="eyebrow">
                  Номер <span className="tabular normal-case tracking-normal text-chalk">{owner?.phoneMasked}</span>
                </p>
                <p className="display mt-3 text-d-3 stretch-narrow">
                  {firstName ? `${firstName}, ` : ""}
                  {upcoming.length ? (
                    <>
                      впереди <span className="digits text-[1.2em] text-pulse">{upcoming.length}</span>
                      {` ${plural(upcoming.length, "занятие", "занятия", "занятий")}`}
                    </>
                  ) : (
                    "впереди пусто"
                  )}
                </p>
              </div>
              <button type="button" className="btn-quiet min-h-[44px] px-0 text-[14px]" onClick={forget}>
                Забыть на этом устройстве
              </button>
            </div>

            {notice && (
              <p role="status" className="rounded-xl border border-line/15 bg-raised px-4 py-3 text-[14.5px] text-chalk">
                {notice}
              </p>
            )}

            <section aria-labelledby="upcoming-title">
              <h2 id="upcoming-title" className="flex items-baseline gap-3 font-display text-[28px] uppercase leading-none" style={{ fontVariationSettings: '"wdth" 90', fontWeight: 850 }}>
                Предстоящие
                <span className="digits text-[26px] text-dust">{upcoming.length}</span>
              </h2>
              {upcoming.length ? (
                <ul className="mt-5 grid gap-3">
                  {upcoming.map((b) => (
                    <BookingCard key={b.id} booking={b} last4={loaded.query.last4} loadedAt={loaded.loadedAt} onCancelled={onCancelled} />
                  ))}
                </ul>
              ) : (
                <div className="mt-5 grid gap-4 rounded-2xl border border-dashed border-line/20 p-6 sm:p-8">
                  <p className="text-[16px] text-chalk">Предстоящих занятий на этот номер нет.</p>
                  <p className="max-w-lg text-[14.5px] leading-relaxed text-dust">
                    Запись открывается за {BOOKING.daysAhead} дней и закрывается за {BOOKING.closesBeforeMin} минут до начала. Выберите время в расписании или
                    соберите неделю под свой пульс.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/schedule" className="btn-primary">
                      Открыть расписание
                    </Link>
                    <Link href="/program" className="btn-ghost">
                      Программа под пульс
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {archive.length > 0 && (
              <section aria-labelledby="archive-title">
                <h2 id="archive-title" className="flex items-baseline gap-3 font-display text-[28px] uppercase leading-none text-chalk/80" style={{ fontVariationSettings: '"wdth" 90', fontWeight: 850 }}>
                  Прошедшие и отменённые
                  <span className="digits text-[26px] text-dust">{archive.length}</span>
                </h2>
                <ul className="mt-5 grid gap-3">
                  {archive.map((b) => (
                    <BookingCard key={b.id} booking={b} last4={loaded.query.last4} loadedAt={loaded.loadedAt} onCancelled={onCancelled} />
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>

      {aside && <div className="min-w-0 lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:self-start">{aside}</div>}
    </div>
  );
}
