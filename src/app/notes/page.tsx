"use client";

import { useEffect, useState } from "react";
import FileUpload from "@/components/FileUpload";

type NoteItem = { id: string; title: string; summary: string };

export default function NotesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([]);

  const load = () =>
    fetch("/api/summarize")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setNotes(d.notes));

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData();
    form.set("title", title);
    form.set("text", text);
    if (file) form.set("file", file);

    const res = await fetch("/api/summarize", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Something went wrong.");
    setTitle("");
    setText("");
    setFile(null);
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="glass space-y-4 rounded-2xl p-6 shadow-glow">
        <h1 className="font-display text-2xl font-bold">Summarize notes</h1>
        <input className="input" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <FileUpload onFile={setFile} />
        <p className="text-center text-xs text-muted">or paste text</p>
        <textarea
          className="input min-h-[140px]"
          placeholder="Paste your notes here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="btn-primary" disabled={busy || (!file && text.trim().length < 40)}>
          {busy ? "Summarizing…" : "Summarize"}
        </button>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Your summaries</h2>
        {notes.length === 0 && <p className="text-sm text-muted">Summaries you create will show up here.</p>}
        {notes.map((n) => (
          <article key={n.id} className="glass rounded-2xl p-5">
            <h3 className="font-display font-semibold">{n.title}</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">{n.summary}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
