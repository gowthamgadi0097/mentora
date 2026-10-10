"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Quiz = { id: string; topic: string };
type Note = { id: string; title: string };

export default function CreateQuizPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [noteId, setNoteId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    fetch("/api/quiz").then((r) => (r.ok ? r.json() : null)).then((d) => d && setQuizzes(d.quizzes));
    fetch("/api/summarize").then((r) => (r.ok ? r.json() : null)).then((d) => d && setNotes(d.notes));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, count, difficulty, noteId: noteId || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Something went wrong.");
    router.push(`/quiz/${data.id}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={onSubmit} className="glass space-y-4 rounded-2xl p-6 shadow-glow lg:col-span-2">
        <h1 className="font-display text-2xl font-bold">Generate a quiz</h1>

        <label className="block text-sm">
          <span className="mb-1 block text-muted">Topic</span>
          <input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. The French Revolution" required />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Questions</span>
            <input className="input" type="number" min={3} max={15} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Difficulty</span>
            <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Base on my notes</span>
            <select className="input" value={noteId} onChange={(e) => setNoteId(e.target.value)}>
              <option value="">None (use topic)</option>
              {notes.map((n) => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="btn-primary" disabled={busy}>{busy ? "Generating…" : "Generate quiz"}</button>
      </form>

      <aside className="glass rounded-2xl p-5">
        <h2 className="mb-3 font-display text-lg font-semibold">Recent quizzes</h2>
        {quizzes.length ? (
          <ul className="space-y-2">
            {quizzes.map((q) => (
              <li key={q.id}>
                <Link href={`/quiz/${q.id}`} className="block rounded-xl bg-bg/40 px-3 py-2 text-sm transition hover:bg-bg/70">
                  {q.topic}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Your quizzes will appear here.</p>
        )}
      </aside>
    </div>
  );
}
