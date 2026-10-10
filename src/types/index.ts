import { z } from "zod";

export const QuestionSchema = z.object({
  question: z.string().min(3),
  options: z.array(z.string().min(1)).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string().default(""),
  topic: z.string().default("General"),
});

export const QuizSchema = z.object({
  questions: z.array(QuestionSchema).min(1).max(20),
});

export type Question = z.infer<typeof QuestionSchema>;

export const PlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  days: z
    .array(
      z.object({
        day: z.string(),
        sessions: z.array(
          z.object({
            time: z.string(),
            topic: z.string(),
            activity: z.string(),
            minutes: z.number().int().positive(),
          })
        ),
      })
    )
    .min(1),
  tips: z.array(z.string()).default([]),
});

export type StudyPlan = z.infer<typeof PlanSchema>;

export type ChatMessage = { role: "user" | "assistant"; content: string };
