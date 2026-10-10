"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const body = {
      name: String(f.get("name")),
      email: String(f.get("email")),
      password: String(f.get("password")),
      role: String(f.get("role")),
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setBusy(false);
      return setError((await res.json().catch(() => null))?.error ?? "Could not create your account.");
    }

    await signIn("credentials", { email: body.email, password: body.password, redirect: false });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="glass mx-auto mt-8 max-w-md rounded-2xl p-6 shadow-glow">
      <h1 className="font-display text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-muted">It takes less than a minute.</p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <input className="input" name="name" placeholder="Full name" required maxLength={80} autoComplete="name" />
        <input className="input" name="email" type="email" placeholder="Email" required autoComplete="email" />
        <input
          className="input"
          name="password"
          type="password"
          placeholder="Password (8+ characters)"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <select className="input" name="role" defaultValue="STUDENT">
          <option value="STUDENT">I am a student</option>
          <option value="TEACHER">I am a teacher</option>
        </select>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Creating…" : "Sign up"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
