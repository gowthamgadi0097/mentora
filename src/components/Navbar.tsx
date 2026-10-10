"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import ThemePicker from "./ThemePicker";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tutor", label: "Tutor" },
  { href: "/quiz", label: "Quizzes" },
  { href: "/notes", label: "Notes" },
  { href: "/planner", label: "Planner" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="glass sticky top-0 z-40 border-x-0 border-t-0">
      <nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          <span className="gradient-text">Mentor</span>a
        </Link>

        {session && (
          <ul className="ml-4 hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${
                    pathname.startsWith(l.href)
                      ? "bg-primary/15 text-text"
                      : "text-muted hover:bg-surface hover:text-text"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ThemePicker />
          {status === "loading" ? null : session ? (
            <button className="btn-ghost" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </button>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/register" className="btn-primary hidden sm:inline-flex">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {session && (
        <ul className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`whitespace-nowrap rounded-lg px-3 py-1 text-xs ${
                  pathname.startsWith(l.href) ? "bg-primary/15 text-text" : "text-muted"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
