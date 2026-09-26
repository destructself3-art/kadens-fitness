import type { Metadata, Viewport } from "next";
import { Golos_Text, Handjet, Science_Gothic } from "next/font/google";
import { PulseProvider } from "@/components/pulse/PulseProvider";
import "./globals.css";

const display = Science_Gothic({
  subsets: ["latin", "cyrillic"],
  axes: ["wdth"],
  variable: "--font-display",
  // Google Fonts has no metric overrides for this family yet; skip the adjusted fallback.
  adjustFontFallback: false,
  display: "swap",
});

const sans = Golos_Text({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const digits = Handjet({
  subsets: ["latin", "cyrillic"],
  axes: ["ELSH"],
  variable: "--font-digits",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3200"),
  title: {
    default: "Каденс — фитнес-клуб, который тренирует по пульсу",
    template: "%s · Каденс",
  },
  description:
    "Большой фитнес-клуб в Казани: шесть студий, бассейн 25 метров, до 50 занятий в день. Узнайте свой пульс за 10 секунд, и мы соберём неделю тренировок под ваше сердце.",
  openGraph: {
    title: "Каденс — клуб, который бьётся в вашем ритме",
    description: "Пульсовые зоны, живое расписание и запись онлайн.",
    locale: "ru_RU",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0B0A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${sans.variable} ${digits.variable}`}>
      <body>
        <PulseProvider>{children}</PulseProvider>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
