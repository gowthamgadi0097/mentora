import { z } from "zod";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { json } from "@/lib/utils";
import { QuestionSchema } from "@/types";

const Body = z.object({
  quizId: z.string(),
  answers: z.array(z.number().int().min(-1).max(3)),
});

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Bad request" }, 400);

  const quiz = await db.quiz.findFirst({ where: { id: parsed.data.quizId, userId: user.id } });
  if (!quiz) return json({ error: "Quiz not found" }, 404);

  const questions = z.array(QuestionSchema).parse(quiz.questions);
  const results = questions.map((q, i) => {
    const chosen = parsed.data.answers[i] ?? -1;
    return {
      correct: chosen === q.answerIndex,
      chosen,
      answerIndex: q.answerIndex,
      explanation: q.explanation,
      topic: q.topic,
    };
  });

  const score = results.filter((r) => r.correct).length;
  const weakTopics = Array.from(new Set(results.filter((r) => !r.correct).map((r) => r.topic)));

  await db.attempt.create({
    data: { quizId: quiz.id, userId: user.id, score, total: questions.length, weakTopics },
  });

  return json({ score, total: questions.length, weakTopics, results });
}
