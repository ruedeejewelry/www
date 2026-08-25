import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * The old site answered 404 to crawlers even though it opened fine in a browser
 * (CLAUDE-storefront.md §8). Serving robots.txt and the sitemap from the app
 * itself removes one place that can go wrong — but the CDN/WAF rule still has
 * to be checked against the live domain before launch.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/favorites"] },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
