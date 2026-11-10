// Fixed locale + UTC so server and client render identical strings.
const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export const formatDate = (iso: string) =>
  dateFmt.format(new Date(iso)).toUpperCase();

export const pad = (n: number, width = 3) => String(n).padStart(width, "0");

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "post";
