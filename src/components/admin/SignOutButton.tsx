"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn--small btn--light"
      onClick={async () => {
        await createClient().auth.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
