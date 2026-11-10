import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <p className="eyebrow">Error 404</p>
      <h1 className="display" style={{ fontSize: "clamp(3.4rem, 15vw, 13rem)", margin: "12px 0 24px" }}>
        Page not <span style={{ color: "var(--red)" }}>found</span>
      </h1>
      <p className="body-copy" style={{ marginBottom: 24 }}>
        That page wandered off the grid. Let&apos;s get you back to the archive.
      </p>
      <Link href="/" className="btn">
        Back to the cover
      </Link>
    </div>
  );
}
