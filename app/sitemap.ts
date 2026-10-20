import type { MetadataRoute } from "next";

const siteUrl = (process.env["SITE_URL"] ?? "https://hotelpnsnakshatra.com").replace(/\/+$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPaths = [
    "/",
    "/about-us",
    "/rooms",
    "/dining",
    "/gallery",
    "/contact",
    "/privacy-policy",
    "/terms-and-conditions",
    "/refund-cancellation-policy",
  ];

  return publicPaths.map((path) => ({
    url: `${siteUrl}${path}`,
  }));
}
