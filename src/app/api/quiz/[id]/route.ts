import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { json } from "@/lib/utils";
import { QuestionSchema } from "@/types";
import { z } from "zod";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const quiz = await db.quiz.findFirst({ where: { id: params.id, userId: user.id } });
  if (!quiz) return json({ error: "Quiz not found" }, 404);

  const questions = z.array(QuestionSchema).parse(quiz.questions);
  // Answers are not sent to the browser; they are checked on the server in /api/attempts.
  return json({
    id: quiz.id,
    topic: quiz.topic,
    questions: questions.map(({ question, options, topic }) => ({ question, options, topic })),
  });
}
