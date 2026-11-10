import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer">
      <span className="footer__brand">SERIES 001</span>
      <span>
        © {new Date().getFullYear()} {SITE.owner}. All rights reserved.
      </span>
      <span>
        <Link href="/admin">Control room</Link>
      </span>
    </footer>
  );
}
