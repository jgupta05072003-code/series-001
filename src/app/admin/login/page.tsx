import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="page admin__login">
      <p className="eyebrow">Private / Owner only</p>
      <h1 className="display admin__login-title">Control room</h1>
      <LoginForm />
    </div>
  );
}
