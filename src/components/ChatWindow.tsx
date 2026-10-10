"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";

const LEVELS = ["Grade 6", "Grade 8", "Grade 10", "Grade 12", "College"];
const SUGGESTIONS = ["Explain photosynthesis simply", "What is a derivative?", "Help me understand Newton's laws"];

export default function ChatWindow() {
  const [level, setLevel] = useState("Grade 10");
  const [input, setInput] = useState("");
  const { messages, loading, error, send, stop, clear } = useChat(level);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
    setInput("");
  };

  return (
    <div className="glass flex h-[70vh] flex-col rounded-2xl shadow-glow">
      <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
        <h2 className="font-display text-lg font-semibold">AI Tutor</h2>
        <label className="ml-auto flex items-center gap-2 text-xs text-muted">
          Explain at
          <select className="input !w-auto !py-1.5" value={level} onChange={(e) => setLevel(e.target.value)}>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={clear} disabled={!messages.length}>
          Clear
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {!messages.length && (
          <div className="mx-auto mt-10 max-w-md text-center">
            <p className="gradient-text font-display text-2xl font-bold">What shall we learn today?</p>
            <p className="mt-2 text-sm text-muted">Ask anything. I will explain it at your level.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gradient-to-r from-primary to-accent text-bg"
                  : "border border-border/60 bg-bg/40"
              }`}
            >
              {m.content || <span className="animate-pulse text-muted">Thinking…</span>}
            </div>
          </div>
        ))}
        {error && <p className="text-center text-sm text-red-400">{error}</p>}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex gap-2 border-t border-border/50 p-3">
        <input
          className="input"
          placeholder="Ask your tutor a question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={4000}
        />
        {loading ? (
          <button type="button" className="btn-ghost" onClick={stop}>
            Stop
          </button>
        ) : (
          <button className="btn-primary" disabled={!input.trim()}>
            Send
          </button>
        )}
      </form>
    </div>
  );
}
