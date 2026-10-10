import { z } from "zod";
import { getUser } from "@/lib/auth";
import { complete, extractJson } from "@/lib/ai";
import { quizSystem, quizUser } from "@/lib/prompts";
import { rateLimit } from "@/lib/ratelimit";
import { db } from "@/lib/db";
import { json } from "@/lib/utils";
import { QuizSchema } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  topic: z.string().trim().min(2).max(200),
  count: z.number().int().min(3).max(15).default(5),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  noteId: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (!rateLimit(`quiz:${user.id}`, 6, 60_000)) return json({ error: "Too many requests" }, 429);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Enter a topic (2+ characters)." }, 400);
  const { topic, count, difficulty, noteId } = parsed.data;

  let notes: string | undefined;
  if (noteId) {
    const note = await db.note.findFirst({ where: { id: noteId, userId: user.id } });
    notes = note?.content.slice(0, 20000);
  }

  try {
    const raw = await complete(quizSystem, [{ role: "user", content: quizUser({ topic, count, difficulty, notes }) }], 3000);
    const quiz = QuizSchema.parse(extractJson(raw));
    const saved = await db.quiz.create({ data: { userId: user.id, topic, questions: quiz.questions } });
    return json({ id: saved.id });
  } catch (e) {
    console.error(e);
    return json({ error: "Could not generate a valid quiz. Please try again." }, 502);
  }
}

/** List the signed-in user's recent quizzes. */
export async function GET() {
  const user = await getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);
  const quizzes = await db.quiz.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, topic: true, createdAt: true },
  });
  return json({ quizzes });
}
