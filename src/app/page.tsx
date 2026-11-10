import Link from "next/link";
import Marquee from "@/components/Marquee";
import "@/styles/home.css";

export default function HomePage() {
  return (
    <>
      <section className="home page">
        <p className="eyebrow home__issue">
          Issue No. 001 &nbsp;/&nbsp; Printed digitally &nbsp;/&nbsp; Never
          finished
        </p>

        <h1 className="display home__title">
          <span>SERIES</span>
          <span className="home__title-num">001</span>
        </h1>

        <div className="home__descriptor">AN INDEPENDENT VISUAL ARCHIVE</div>

        <div className="home__shapes" aria-hidden="true">
          <div className="home__block home__block--blue" />
          <div className="home__block home__block--green" />
          <div className="home__block home__block--outline" />
          <div className="sticker sticker--burst home__burst spin-slow">
            <span>
              FRESH
              <br />
              PRINT
            </span>
          </div>
        </div>

        <p className="note home__note home__note--a">
          ↓ start here (or don&apos;t, no rules)
        </p>
        <p className="note home__note home__note--b">
          vol. 01 — the first edition,
          <br />
          more to come
        </p>

        <h2 className="display home__headline">
          Design, image, motion &amp; everything in between.
        </h2>

        <div className="home__lower">
          <p className="body-copy home__intro">
            A growing collection of visual experiments, graphic explorations,
            moving images, and ideas. Some planned, some accidental, all part of
            the process.
          </p>

          <div className="home__cta">
            <Link href="/work" className="btn btn--red">
              Enter the archive →
            </Link>
            <Link href="/about" className="btn btn--light">
              About
            </Link>
            <Link href="/contact" className="btn btn--light">
              Contact
            </Link>
          </div>
        </div>
      </section>

      <Marquee
        items={[
          "Graphic design",
          "Photography",
          "Video",
          "Typography",
          "Motion",
          "Experiments",
          "Series 001",
        ]}
      />
    </>
  );
}
