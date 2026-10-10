import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { json } from "@/lib/utils";
import { rateLimit } from "@/lib/ratelimit";

const Body = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["STUDENT", "TEACHER"]).default("STUDENT"),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  if (!rateLimit(`register:${ip}`, 10, 60_000)) return json({ error: "Too many requests" }, 429);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Please check your details (password needs 8+ characters)." }, 400);

  const { name, email, password, role } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) return json({ error: "That email is already registered." }, 409);

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({ data: { name, email, passwordHash, role } });
  return json({ ok: true }, 201);
}
