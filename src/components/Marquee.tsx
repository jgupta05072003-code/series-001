export default function Marquee({ items }: { items: string[] }) {
  // Duplicated once so the -50% translate loops seamlessly.
  const row = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {row.map((item, i) => (
          <span className="marquee__item" key={i}>
            {item} ✦
          </span>
        ))}
      </div>
    </div>
  );
}
