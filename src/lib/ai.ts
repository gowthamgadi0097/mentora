import type { ChatMessage } from "@/types";

/**
 * Provider-agnostic AI client. Runs on the server only (API keys never reach the browser).
 * Set AI_PROVIDER = anthropic | openai | gemini, plus AI_API_KEY (and optional AI_MODEL).
 */

type Provider = "anthropic" | "openai" | "gemini";

const DEFAULT_MODELS: Record<Provider, string> = {
  anthropic: "claude-sonnet-5-5",
  openai: "gpt-4o-mini",
  gemini: "gemini-2.5-flash",
};

function config() {
  const provider = (process.env.AI_PROVIDER ?? "anthropic").toLowerCase() as Provider;
  if (!(provider in DEFAULT_MODELS)) throw new Error(`Unknown AI_PROVIDER "${provider}"`);
  const key = process.env.AI_API_KEY;
  if (!key) throw new Error("AI_API_KEY is not set");
  return { provider, key, model: process.env.AI_MODEL || DEFAULT_MODELS[provider] };
}

async function ensureOk(res: Response) {
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  return res;
}

/** Single, non-streaming completion. */
export async function complete(
  system: string,
  messages: ChatMessage[],
  maxTokens = 2000
): Promise<string> {
  const { provider, key, model } = config();

  if (provider === "anthropic") {
    const res = await ensureOk(
      await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTokens, system, messages }),
      })
    );
    const data = await res.json();
    return (data.content ?? []).map((b: { text?: string }) => b.text ?? "").join("");
  }

  if (provider === "openai") {
    const res = await ensureOk(
      await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      })
    );
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  const res = await ensureOk(
    await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            maxOutputTokens: maxTokens,
            // 2.5 Flash "thinking" tokens would eat the output budget and cut the JSON short
            ...(model.includes("2.5-flash") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
          },
        }),
      }
    )
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
}

/** Turns an SSE response body into a stream of plain text chunks. */
function sseToTextStream(
  body: ReadableStream<Uint8Array>,
  pick: (json: any) => string | undefined // eslint-disable-line @typescript-eslint/no-explicit-any
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const text = pick(JSON.parse(payload));
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            /* ignore partial / non-JSON lines */
          }
        }
      },
    })
  );
}

/** Streaming completion used by the tutor chat. */
export async function streamChat(system: string, messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
  const { provider, key, model } = config();

  if (provider === "anthropic") {
    const res = await ensureOk(
      await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model, max_tokens: 1500, system, messages, stream: true }),
      })
    );
    return sseToTextStream(res.body!, (j) => (j.type === "content_block_delta" ? j.delta?.text : undefined));
  }

  if (provider === "openai") {
    const res = await ensureOk(
      await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({
          model,
          max_tokens: 1500,
          stream: true,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      })
    );
    return sseToTextStream(res.body!, (j) => j.choices?.[0]?.delta?.content);
  }

  // Gemini: fall back to a single chunk
  const text = await complete(system, messages, 1500);
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(c) {
      c.enqueue(encoder.encode(text));
      c.close();
    },
  });
}

/** Turns any AI-related failure into a message the user can act on. */
export function aiErrorMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("AI_API_KEY is not set"))
    return "AI is not configured: add AI_API_KEY in your host's environment variables, then redeploy.";
  if (msg.includes("Unknown AI_PROVIDER")) return "AI_PROVIDER must be one of: anthropic, openai, gemini.";

  const m = msg.match(/AI request failed \((\d+)\)/);
  if (m) {
    const status = Number(m[1]);
    if (status === 401 || status === 403)
      return "The AI provider rejected your API key. Check AI_API_KEY, and that AI_PROVIDER matches the key's provider.";
    if (status === 404) return "The AI model was not found. Set AI_MODEL to a model your key can use.";
    if (status === 429) return "The AI provider's limit or credit balance was reached. Check your plan, then try again.";
    return `The AI provider returned an error (${status}). Check your server logs for details.`;
  }

  if (msg.includes("did not return JSON") || (e instanceof Error && (e.name === "ZodError" || e.name === "SyntaxError")))
    return "The AI replied in an unexpected format. Please try again.";
  return "Could not reach the AI service. Please try again.";
}

/** Pulls the first JSON object out of a model reply (tolerates stray prose or code fences). */
export function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("Model did not return JSON");
  return JSON.parse(text.slice(start, end + 1));
}
