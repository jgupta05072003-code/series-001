import type { Metadata } from "next";
import "@/styles/admin.css";

export const metadata: Metadata = {
  title: { default: "Control room", template: "%s — Control room" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin">{children}</div>;
}
