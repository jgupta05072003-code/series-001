import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { SITE } from "@/lib/site";
import "./globals.css";

// Montserrat is the only typeface on the site. Italic is the same family.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-montserrat",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "SERIES 001 — An Independent Visual Archive",
    template: "%s — SERIES 001",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.owner }],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: "SERIES 001 — An Independent Visual Archive",
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#e8ff00",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
