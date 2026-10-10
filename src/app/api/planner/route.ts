import { z } from "zod";
import { getUser } from "@/lib/auth";
import { complete, extractJson } from "@/lib/ai";
import { plannerSystem } from "@/lib/prompts";
import { rateLimit } from "@/lib/ratelimit";
import { json } from "@/lib/utils";
import { PlanSchema } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  goal: z.string().trim().min(3).max(300),
  topics: z.string().trim().min(2).max(800),
  examDate: z.string().max(40).optional(),
  hoursPerDay: z.number().min(0.5).max(12).default(2),
  days: z.number().int().min(1).max(14).default(7),
});

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (!rateLimit(`planner:${user.id}`, 6, 60_000)) return json({ error: "Too many requests" }, 429);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Please fill in the goal and topics." }, 400);
  const p = parsed.data;

  const prompt = `Goal: ${p.goal}\nTopics: ${p.topics}\nExam date: ${p.examDate || "not specified"}\nHours available per day: ${p.hoursPerDay}\nPlan length: ${p.days} days`;

  try {
    const raw = await complete(plannerSystem, [{ role: "user", content: prompt }], 3000);
    return json({ plan: PlanSchema.parse(extractJson(raw)) });
  } catch (e) {
    console.error(e);
    return json({ error: "Could not build a valid plan. Please try again." }, 502);
  }
}
