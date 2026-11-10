import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/work", "/contact"].map((path) => ({
    url: `${SITE.url}${path}`,
    changeFrequency: path === "/work" ? "weekly" : "monthly",
  }));
}
