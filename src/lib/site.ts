// Single place for site-wide content you may want to edit.

export const SITE = {
  name: "SERIES 001",
  owner: "Chaitanya Gupta",
  descriptor: "An independent visual archive",
  description:
    "SERIES 001 is the independent visual archive of Chaitanya Gupta: graphic design, photography, video, typography and visual experiments.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "chaitanyaapj@gmail.com",
  linkedin: "https://www.linkedin.com/in/chaitanya-gupta-81b024263/",
} as const;

// Social profiles. Set the NEXT_PUBLIC_*_URL env vars (or edit `url` here) once
// the profiles exist. Until then each link opens the platform's home page and
// is labelled "handle coming soon".
export const SOCIALS = [
  {
    key: "instagram",
    label: "Instagram",
    url: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
    fallback: "https://www.instagram.com/",
  },
  {
    key: "behance",
    label: "Behance",
    url: process.env.NEXT_PUBLIC_BEHANCE_URL || "",
    fallback: "https://www.behance.net/",
  },
  {
    key: "pinterest",
    label: "Pinterest",
    url: process.env.NEXT_PUBLIC_PINTEREST_URL || "",
    fallback: "https://www.pinterest.com/",
  },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/contact", label: "Contact" },
] as const;
