// Anonymous per-browser id used to key likes. It is not an account and holds
// no personal data; clearing site data simply resets it.
const KEY = "series001:visitor";
let memoryId: string | null = null;

export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Storage blocked (private mode etc.): fall back to a per-session id.
    return (memoryId ??= crypto.randomUUID());
  }
}
