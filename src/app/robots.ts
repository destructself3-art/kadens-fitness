import type { MetadataRoute } from "next";

const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3200").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin panel, the API and personal booking tickets (/booking/KD-…) stay out of search.
      disallow: ["/admin", "/api", "/booking/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
