import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "kd_admin";
const TTL_SECONDS = 12 * 60 * 60;

const secret = () => process.env.ADMIN_SECRET || "dev-only-secret";

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function verify(value: string | undefined) {
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !safeEqual(signature, sign(expires))) return false;
  return Number(expires) * 1000 > Date.now();
}

export function checkPassword(input: string) {
  return safeEqual(input, process.env.ADMIN_PASSWORD || "kadens");
}

export async function isAdmin() {
  const store = await cookies();
  return verify(store.get(COOKIE)?.value);
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function startSession() {
  const expires = String(Math.floor(Date.now() / 1000) + TTL_SECONDS);
  const store = await cookies();
  store.set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(COOKIE);
}
