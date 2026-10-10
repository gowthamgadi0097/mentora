import pdf from "pdf-parse/lib/pdf-parse.js";
import { getUser } from "@/lib/auth";
import { complete } from "@/lib/ai";
import { summarizeSystem } from "@/lib/prompts";
import { rateLimit } from "@/lib/ratelimit";
import { db } from "@/lib/db";
import { json } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 4 * 1024 * 1024; // keep under serverless body limits
const MAX_CHARS = 30000;

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (!rateLimit(`summarize:${user.id}`, 6, 60_000)) return json({ error: "Too many requests" }, 429);

  const form = await req.formData().catch(() => null);
  if (!form) return json({ error: "Bad request" }, 400);

  let title = String(form.get("title") ?? "").trim();
  let text = String(form.get("text") ?? "").trim();
  const file = form.get("file");

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) return json({ error: "File is too large (max 4 MB)." }, 413);
    const buf = Buffer.from(await file.arrayBuffer());
    try {
      text = file.name.toLowerCase().endsWith(".pdf") ? (await pdf(buf)).text : buf.toString("utf8");
    } catch {
      return json({ error: "Could not read that file." }, 422);
    }
    if (!title) title = file.name.replace(/\.[^.]+$/, "");
  }

  text = text.replace(/\s+\n/g, "\n").trim().slice(0, MAX_CHARS);
  if (text.length < 40) return json({ error: "Add some text or upload a PDF with readable text." }, 400);
  if (!title) title = text.slice(0, 40) + "…";

  try {
    const summary = await complete(summarizeSystem, [{ role: "user", content: text }], 1500);
    const note = await db.note.create({ data: { userId: user.id, title, content: text, summary } });
    return json({ id: note.id, title, summary });
  } catch (e) {
    console.error(e);
    return json({ error: "Summarizing failed. Please try again." }, 502);
  }
}

export async function GET() {
  const user = await getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);
  const notes = await db.note.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, title: true, summary: true },
  });
  return json({ notes });
}
