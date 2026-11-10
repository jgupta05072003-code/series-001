"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setBusy(false);
      // Deliberately generic: don't reveal whether the email exists.
      setError("Those details didn't work.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  if (!hasSupabaseEnv) {
    return (
      <div className="state" role="alert">
        <h2 className="state__title">Not connected</h2>
        <p className="body-copy">
          Supabase isn&apos;t configured yet. Add the keys to <code>.env.local</code>{" "}
          and restart the dev server (see the README).
        </p>
      </div>
    );
  }

  return (
    <form className="admin__card admin__login-form" onSubmit={onSubmit}>
      <label className="field">
        <span className="field__label">Email</span>
        <input
          className="input"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="field">
        <span className="field__label">Password</span>
        <input
          className="input"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
