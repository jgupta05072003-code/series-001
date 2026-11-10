// A template remounts on every navigation, which replays the entrance
// animation and gives each route change a soft page transition.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
