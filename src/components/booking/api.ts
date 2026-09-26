// Browser calls to the booking API. Every call resolves (never throws) so forms only branch on `ok`.
import type { BookingView } from "@/lib/session-types";

export type ApiFailure = { ok: false; status: number; error: string; fields?: Record<string, string> };
export type ApiResult<T> = { ok: true; data: T } | ApiFailure;

async function postJson<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as Partial<{ error: string; fields: Record<string, string> }>;
    if (!res.ok) {
      return { ok: false, status: res.status, error: data.error ?? "Что-то пошло не так. Попробуйте ещё раз.", fields: data.fields };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, error: "Нет связи с сервером. Проверьте интернет и попробуйте ещё раз." };
  }
}

export const cancelBookingRequest = (code: string, last4: string) =>
  postJson<{ ok: true; promoted: boolean }>("/api/bookings/cancel", { code, last4 });

export const lookupBookingsRequest = (code: string, last4: string) =>
  postJson<{ bookings: BookingView[] }>("/api/bookings/lookup", { code, last4 });
