"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(f.get("email")),
      password: String(f.get("password")),
      redirect: false,
    });
    setBusy(false);
    if (res?.error) return setError("Incorrect email or password.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="glass mx-auto mt-8 max-w-md rounded-2xl p-6 shadow-glow">
      <h1 className="font-display text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Log in to continue learning.</p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <input className="input" name="email" type="email" placeholder="Email" required autoComplete="email" />
        <input className="input" name="password" type="password" placeholder="Password" required autoComplete="current-password" />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Signing in…" : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
