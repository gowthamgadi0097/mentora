import { z } from "zod";
import { getUser } from "@/lib/auth";
import { streamChat } from "@/lib/ai";
import { tutorSystem } from "@/lib/prompts";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(8000) }))
    .min(1)
    .max(40),
  level: z.string().max(40).default("Grade 10"),
});

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!rateLimit(`chat:${user.id}`, 20, 60_000)) return new Response("Too many requests, slow down.", { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response("Bad request", { status: 400 });

  try {
    const stream = await streamChat(tutorSystem(parsed.data.level), parsed.data.messages);
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache, no-transform" },
    });
  } catch (e) {
    console.error(e);
    return new Response("The tutor is unavailable right now.", { status: 502 });
  }
}
