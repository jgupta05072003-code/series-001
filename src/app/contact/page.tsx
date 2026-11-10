import type { Metadata } from "next";
import { SITE, SOCIALS } from "@/lib/site";
import "@/styles/contact.css";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Collaborate, talk creative ideas, or just say hello to Chaitanya Gupta.",
};

export default function ContactPage() {
  return (
    <div className="contact page">
      <p className="eyebrow">Section 04 / Say something</p>
      <h1 className="display contact__title">
        Got something <span>cool</span> in mind?
      </h1>

      <p className="body-copy contact__lead">
        Want to collaborate, swap ideas, talk about a project, or just say
        hello? My inbox is open. Tell me what you&apos;re making and
        let&apos;s see where it goes.
      </p>

      <div className="contact__grid">
        <a className="contact__mail" href={`mailto:${SITE.email}`}>
          <span className="caption">Email</span>
          <span className="contact__mail-addr">{SITE.email}</span>
          <span className="contact__arrow" aria-hidden="true">
            ↗
          </span>
        </a>

        <a
          className="contact__card contact__card--blue"
          href={SITE.linkedin}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="caption">LinkedIn</span>
          <span className="contact__card-name">Chaitanya Gupta</span>
          <span className="contact__arrow" aria-hidden="true">
            ↗
          </span>
        </a>

        {SOCIALS.map((s, i) => (
          <a
            key={s.key}
            className={`contact__card contact__card--${["red", "green", "orange"][i % 3]}`}
            href={s.url || s.fallback}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="caption">{s.label}</span>
            <span className="contact__card-name">
              {s.url ? "Follow along" : "Handle coming soon"}
            </span>
            <span className="contact__arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        ))}
      </div>

      <p className="note contact__note">
        replies usually arrive faster than a render finishes exporting.
      </p>
      <div className="sticker sticker--burst contact__burst" aria-hidden="true">
        <span>
          SAY
          <br />
          HI
        </span>
      </div>
    </div>
  );
}
