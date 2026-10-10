"use client";

import { useState } from "react";
import type { StudyPlan } from "@/types";

export default function PlannerPage() {
  const [goal, setGoal] = useState("");
  const [topics, setTopics] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHours] = useState(2);
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<StudyPlan | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, topics, examDate: examDate || undefined, hoursPerDay, days }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Something went wrong.");
    setPlan(data.plan);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form onSubmit={onSubmit} className="glass space-y-4 rounded-2xl p-6 shadow-glow lg:col-span-2 lg:self-start">
        <h1 className="font-display text-2xl font-bold">Study planner</h1>
        <input className="input" placeholder="Goal (e.g. Ace my physics midterm)" value={goal} onChange={(e) => setGoal(e.target.value)} required />
        <textarea className="input min-h-[100px]" placeholder="Topics to cover, comma separated" value={topics} onChange={(e) => setTopics(e.target.value)} required />
        <div className="grid grid-cols-3 gap-3">
          <label className="text-xs text-muted">
            Exam date
            <input className="input mt-1" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          </label>
          <label className="text-xs text-muted">
            Hours/day
            <input className="input mt-1" type="number" min={0.5} max={12} step={0.5} value={hoursPerDay} onChange={(e) => setHours(Number(e.target.value))} />
          </label>
          <label className="text-xs text-muted">
            Days
            <input className="input mt-1" type="number" min={1} max={14} value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </label>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Planning…" : "Build my plan"}</button>
      </form>

      <section className="space-y-4 lg:col-span-3">
        {!plan ? (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted">Your personalised schedule will appear here.</div>
        ) : (
          <>
            <div className="glass rounded-2xl p-5">
              <h2 className="gradient-text font-display text-2xl font-bold">{plan.title}</h2>
              <p className="mt-1 text-sm text-muted">{plan.summary}</p>
            </div>

            {plan.days.map((d) => (
              <div key={d.day} className="glass rounded-2xl p-5">
                <h3 className="mb-3 font-display font-semibold">{d.day}</h3>
                <ul className="space-y-2">
                  {d.sessions.map((s, i) => (
                    <li key={i} className="flex gap-3 rounded-xl bg-bg/40 p-3 text-sm">
                      <span className="w-24 shrink-0 text-xs text-primary">{s.time}</span>
                      <span className="flex-1">
                        <strong>{s.topic}</strong>
                        <span className="block text-muted">{s.activity}</span>
                      </span>
                      <span className="text-xs text-muted">{s.minutes} min</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {plan.tips.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <h3 className="mb-2 font-display font-semibold">Tips</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                  {plan.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
