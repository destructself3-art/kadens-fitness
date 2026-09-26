import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Пульт клуба", template: "%s · Пульт «Каденса»" },
  description: "Панель администратора клуба «Каденс»: день по студиям, записи, замены тренеров и заявки.",
  robots: { index: false, follow: false, nocache: true },
};

/** The admin panel lives outside the public site: no site header, footer or smooth scroll. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100svh] bg-asphalt text-chalk">{children}</div>;
}
