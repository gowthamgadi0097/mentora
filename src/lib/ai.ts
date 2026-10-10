import type { ChatMessage } from "@/types";

/**
 * Provider-agnostic AI client. Runs on the server only (API keys never reach the browser).
 * Set AI_PROVIDER = anthropic | openai | gemini, plus AI_API_KEY (and optional AI_MODEL).
 */

type Provider = "anthropic" | "openai" | "gemini";

const DEFAULT_MODELS: Record<Provider, string> = {
  anthropic: "claude-sonnet-5-5",
  openai: "gpt-4o-mini",
  gemini: "gemini-1.5-flash",
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
          generationConfig: { maxOutputTokens: maxTokens },
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

/** Pulls the first JSON object out of a model reply (tolerates stray prose or code fences). */
export function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("Model did not return JSON");
  return JSON.parse(text.slice(start, end + 1));
}
