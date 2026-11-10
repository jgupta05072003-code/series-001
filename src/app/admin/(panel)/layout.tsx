import Link from "next/link";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/admin/SignOutButton";
import { createClient } from "@/lib/supabase/server";

// Server-side gate. Even if the proxy were bypassed, nothing under (panel)
// renders unless the signed-in user is listed in public.owners. The database
// enforces the same rule again through Row Level Security.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isOwner } = await supabase.rpc("is_owner");
  if (isOwner !== true) {
    return (
      <div className="page">
        <div className="state" role="alert">
          <h2 className="state__title">Not the owner</h2>
          <p className="body-copy">
            You&apos;re signed in as {user.email}, but this account isn&apos;t
            authorised to manage SERIES 001.
          </p>
          <div style={{ marginTop: 16 }}>
            <SignOutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin__shell">
      <div className="admin__bar">
        <span className="admin__bar-title">Control room</span>
        <nav className="admin__bar-nav" aria-label="Admin">
          <Link className="btn btn--small btn--light" href="/admin">
            Dashboard
          </Link>
          <Link className="btn btn--small btn--red" href="/admin/posts/new">
            + New post
          </Link>
          <Link className="btn btn--small btn--light" href="/work" target="_blank">
            View site ↗
          </Link>
          <SignOutButton />
        </nav>
      </div>
      <div className="admin__content">{children}</div>
    </div>
  );
}
