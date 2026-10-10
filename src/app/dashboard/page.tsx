import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { percent } from "@/lib/utils";
import ProgressChart from "@/components/ProgressChart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const attempts = await db.attempt.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 20,
    include: { quiz: { select: { topic: true } } },
  });

  const points = attempts.map((a) => ({ label: a.quiz.topic, value: percent(a.score, a.total) }));
  const avg = points.length ? Math.round(points.reduce((s, p) => s + p.value, 0) / points.length) : 0;

  const weak = new Map<string, number>();
  for (const a of attempts) for (const t of a.weakTopics) weak.set(t, (weak.get(t) ?? 0) + 1);
  const weakList = Array.from(weak.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const stats = [
    { label: "Quizzes taken", value: attempts.length },
    { label: "Average score", value: `${avg}%` },
    { label: "Best score", value: `${points.length ? Math.max(...points.map((p) => p.value)) : 0}%` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">
          Hello, <span className="gradient-text">{session.user.name?.split(" ")[0] ?? "learner"}</span>
        </h1>
        <p className="text-sm text-muted">Here is how your studying is going.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-muted">{s.label}</p>
            <p className="gradient-text mt-1 font-display text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="mb-2 font-display text-lg font-semibold">Score history</h2>
          <ProgressChart points={points} />
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="mb-3 font-display text-lg font-semibold">Topics to revisit</h2>
          {weakList.length ? (
            <ul className="space-y-2">
              {weakList.map(([topic, n]) => (
                <li key={topic} className="flex items-center justify-between rounded-xl bg-bg/40 px-3 py-2 text-sm">
                  <span>{topic}</span>
                  <span className="text-xs text-muted">missed {n}×</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Nothing yet. Weak topics appear after you take quizzes.</p>
          )}
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/tutor" className="btn-primary">Ask the tutor</Link>
        <Link href="/quiz" className="btn-ghost">New quiz</Link>
        <Link href="/notes" className="btn-ghost">Summarize notes</Link>
        <Link href="/planner" className="btn-ghost">Plan my week</Link>
      </div>
    </div>
  );
}
