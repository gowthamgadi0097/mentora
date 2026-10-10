import Link from "next/link";

const features = [
  { icon: "💬", title: "AI Tutor", text: "Ask anything and get clear explanations pitched at your level, streamed live." },
  { icon: "📝", title: "Quiz Generator", text: "Turn any topic or your own notes into multiple-choice quizzes in seconds." },
  { icon: "📄", title: "Notes Summarizer", text: "Upload a PDF or paste text and get key points and terms to remember." },
  { icon: "🗓️", title: "Study Planner", text: "A realistic day-by-day schedule that fits your hours and exam date." },
  { icon: "📈", title: "Progress Dashboard", text: "Track scores over time and spot the topics that need more practice." },
];

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-3xl pb-14 pt-10 text-center sm:pt-20">
        <span className="glass inline-block rounded-full px-4 py-1 text-xs text-muted">
          ✨ Mentora: your personal AI mentor
        </span>
        <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-6xl">
          Learn faster with an AI that <span className="gradient-text">teaches like a person</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted">
          Chat with a patient tutor, practise with generated quizzes, summarize your notes and follow a plan built
          around your schedule.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="btn-primary">
            Start learning free
          </Link>
          <Link href="/login" className="btn-ghost">
            I already have an account
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <article key={f.title} className="glass rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-glow">
            <div className="text-2xl">{f.icon}</div>
            <h3 className="mt-3 font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.text}</p>
          </article>
        ))}
        <article className="glass rounded-2xl p-5 sm:col-span-2 lg:col-span-1">
          <div className="text-2xl">🎨</div>
          <h3 className="mt-3 font-display text-lg font-semibold">Make it yours</h3>
          <p className="mt-1 text-sm text-muted">
            Switch between six colour themes and five animated backgrounds from the Appearance menu.
          </p>
        </article>
      </section>
    </div>
  );
}
