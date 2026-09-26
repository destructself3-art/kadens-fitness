import type { MetadataRoute } from "next";
import { CLASSES } from "@/data/classes";
import { COACHES } from "@/data/coaches";
import { ARTICLES } from "@/data/journal";
import { SPACES } from "@/data/spaces";

const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3200").replace(/\/+$/, "");

type Entry = MetadataRoute.Sitemap[number];

const STATIC: { path: string; priority: number; changeFrequency: Entry["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/schedule", priority: 0.9, changeFrequency: "hourly" },
  { path: "/program", priority: 0.8, changeFrequency: "monthly" },
  { path: "/program/ruffier", priority: 0.6, changeFrequency: "monthly" },
  { path: "/zones", priority: 0.7, changeFrequency: "monthly" },
  { path: "/classes", priority: 0.8, changeFrequency: "weekly" },
  { path: "/coaches", priority: 0.8, changeFrequency: "weekly" },
  { path: "/studios", priority: 0.7, changeFrequency: "monthly" },
  { path: "/club", priority: 0.6, changeFrequency: "monthly" },
  { path: "/kids", priority: 0.6, changeFrequency: "monthly" },
  { path: "/memberships", priority: 0.8, changeFrequency: "monthly" },
  { path: "/trial", priority: 0.8, changeFrequency: "monthly" },
  { path: "/corporate", priority: 0.5, changeFrequency: "monthly" },
  { path: "/reviews", priority: 0.5, changeFrequency: "weekly" },
  { path: "/journal", priority: 0.6, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contacts", priority: 0.7, changeFrequency: "yearly" },
  { path: "/booking", priority: 0.3, changeFrequency: "yearly" },
  { path: "/rules", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;
  return [
    ...STATIC.map((r) => ({ url: url(r.path), changeFrequency: r.changeFrequency, priority: r.priority })),
    ...CLASSES.map((c) => ({ url: url(`/classes/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...COACHES.map((c) => ({ url: url(`/coaches/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...SPACES.map((s) => ({ url: url(`/studios/${s.slug}`), changeFrequency: "monthly" as const, priority: 0.5 })),
    ...ARTICLES.map((a) => ({ url: url(`/journal/${a.slug}`), lastModified: new Date(a.date), changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
