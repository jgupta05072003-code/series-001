import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import "@/styles/about.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Chaitanya Gupta — civil engineering student at MITS Gwalior with a thing for graphic design, photography, video and visual storytelling.",
};

const TIMELINE = [
  {
    bg: "2012",
    years: "2012 — 2024",
    school: "Apeejay School",
    level: "High School / Grade 10",
    dates: "April 2012 – March 2024",
    skills: ["Leadership", "Video Production"],
    color: "red",
  },
  {
    bg: "2024",
    years: "2024 — 2026",
    school: "Amity International School, Pushp Vihar",
    level: "Intermediate / Grade 12 · Stream: PCM",
    dates: "April 2024 – March 2026",
    skills: ["Video Production", "Critical Thinking"],
    color: "blue",
  },
  {
    bg: "2026",
    years: "2026 — 2030",
    school: "Madhav Institute of Technology and Science, Gwalior",
    level: "B.Tech Civil Engineering",
    dates: "August 2026 – August 2030",
    skills: [],
    status: "Currently pursuing",
    color: "green",
    current: true,
  },
] as const;

const INTERESTS = [
  "Graphic Design",
  "Photography",
  "Video Production",
  "Video Editing",
  "Visual Experimentation",
  "Visual Storytelling",
];

export default function AboutPage() {
  return (
    <div className="about page">
      <p className="eyebrow">Section 02 / The person behind the series</p>
      <h1 className="display about__title">
        Who the hell is <span className="about__title-name">Chaitanya?</span>
      </h1>

      <section className="about__bio" aria-label="About me">
        <Reveal className="about__lead">
          <p>
            Chaitanya Gupta. Student, tinkerer, serial visual-experimenter.
          </p>
        </Reveal>
        <Reveal className="about__copy" delay={80}>
          <p>
            I&apos;m currently pursuing a B.Tech in Civil Engineering at Madhav
            Institute of Technology and Science, Gwalior (2026–2030).
          </p>
          <p>
            Although my academic background is in engineering, I have a strong
            interest in the creative world, particularly graphic design,
            photography, video editing, and visual storytelling.
          </p>
          <p>
            I enjoy experimenting with visuals, exploring typography, playing
            with compositions, editing footage, and turning ordinary ideas into
            something visually interesting.
          </p>
          <p>
            I&apos;m interested in the relationship between structure and
            creativity. Engineering gives me a way to understand how things are
            built; design gives me a way to explore how things can be seen
            differently.
          </p>
          <p>
            I don&apos;t want to limit myself to one creative field. I enjoy
            learning, experimenting, and discovering new ways to communicate
            through visuals.
          </p>
        </Reveal>
        <div className="about__stamp sticker sticker--tag" aria-hidden="true">
          Structure
          <br />+ Creativity
        </div>
      </section>

      <section aria-labelledby="timeline-title" className="about__timeline">
        <h2 id="timeline-title" className="display about__h2">
          The chapters so far
        </h2>
        <ol className="timeline">
          {TIMELINE.map((item) => (
            <Reveal
              as="li"
              key={item.bg}
              className={`timeline__item timeline__item--${item.color}`}
            >
              <span className="timeline__bg" aria-hidden="true">
                {item.bg}
              </span>
              <div className="timeline__card">
                {"current" in item && item.current && (
                  <span className="sticker sticker--tag timeline__sticker">
                    Current chapter
                  </span>
                )}
                <p className="caption">{item.years}</p>
                <h3 className="timeline__school">{item.school}</h3>
                <p className="timeline__level">{item.level}</p>
                <p className="caption timeline__dates">{item.dates}</p>
                {item.skills.length > 0 && (
                  <p className="timeline__skills">
                    <span className="caption">Skills</span>
                    {item.skills.map((s) => (
                      <span className="tag" key={s}>
                        {s}
                      </span>
                    ))}
                  </p>
                )}
                {"status" in item && (
                  <p className="timeline__skills">
                    <span className="caption">Status</span>
                    <span className="tag">{item.status}</span>
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <section aria-labelledby="beyond-title" className="about__beyond">
        <Reveal>
          <h2 id="beyond-title" className="display about__h2">
            Beyond the frame
          </h2>
        </Reveal>
        <ul className="beyond__list">
          {INTERESTS.map((interest, i) => (
            <Reveal
              as="li"
              key={interest}
              delay={i * 60}
              className={`beyond__item beyond__item--${i % 6}`}
            >
              <span className="beyond__num">0{i + 1}</span>
              {interest}
            </Reveal>
          ))}
        </ul>
        <Reveal>
          <p className="body-copy beyond__para">
            I&apos;m curious by default, observant by habit, and experimental
            whenever there&apos;s a spare hour. I notice the weird spacing on a
            shop sign, the way light lands on a wall, how a cut can change a
            whole scene. If I can learn something new from it, I&apos;ll
            probably try making something out of it.
          </p>
        </Reveal>
      </section>

      <section className="about__close" aria-label="Closing statement">
        <Reveal>
          <p className="display about__closing">
            Still figuring things out.
            <br />
            <span>Still making things.</span>
          </p>
        </Reveal>
        <Link href="/work" className="btn btn--red">
          See what I&apos;ve made →
        </Link>
      </section>
    </div>
  );
}
