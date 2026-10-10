"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QuizCard from "@/components/QuizCard";

type PublicQuestion = { question: string; options: string[]; topic: string };
type Result = { correct: boolean; answerIndex: number; explanation: string };
type Outcome = { score: number; total: number; weakTopics: string[]; results: Result[] };

export default function TakeQuizPage({ params }: { params: { id: string } }) {
  const [quiz, setQuiz] = useState<{ topic: string; questions: PublicQuestion[] } | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/quiz/${params.id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Could not load quiz");
        setQuiz(d);
        setAnswers(Array(d.questions.length).fill(-1));
      })
      .catch((e) => setError(e.message));
  }, [params.id]);

  async function submit() {
    setBusy(true);
    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId: params.id, answers }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Could not submit");
    setOutcome(data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (error) return <p className="text-center text-red-400">{error}</p>;
  if (!quiz) return <p className="text-center text-muted">Loading quiz…</p>;

  const answered = answers.filter((a) => a >= 0).length;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">{quiz.topic}</h1>
        <p className="text-sm text-muted">{quiz.questions.length} questions</p>
      </div>

      {outcome && (
        <div className="glass rounded-2xl p-6 text-center shadow-glow">
          <p className="text-sm text-muted">Your score</p>
          <p className="gradient-text font-display text-5xl font-bold">
            {outcome.score}/{outcome.total}
          </p>
          {outcome.weakTopics.length > 0 && (
            <p className="mt-2 text-sm text-muted">Review: {outcome.weakTopics.join(", ")}</p>
          )}
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/quiz" className="btn-primary">New quiz</Link>
            <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
          </div>
        </div>
      )}

      {quiz.questions.map((q, i) => (
        <QuizCard
          key={i}
          index={i}
          question={q.question}
          options={q.options}
          selected={answers[i] ?? -1}
          onSelect={(o) => setAnswers((a) => a.map((v, j) => (j === i ? o : v)))}
          result={outcome ? outcome.results[i] : undefined}
        />
      ))}

      {!outcome && (
        <button className="btn-primary w-full" onClick={submit} disabled={busy || answered === 0}>
          {busy ? "Checking…" : `Submit (${answered}/${quiz.questions.length} answered)`}
        </button>
      )}
    </div>
  );
}
