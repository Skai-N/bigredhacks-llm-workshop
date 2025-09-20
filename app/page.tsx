// app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Let's write a story together! You go first." },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data.reply ?? "(no reply)";

      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Oops, something went wrong." },
      ]);
      console.error(err);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b bg-white px-4 py-3 text-lg font-semibold text-gray-900">
        Simple Chat
      </header>

      <section className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`w-fit max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-white text-gray-900 border"
              }`}
            >
              {m.content}
            </div>
          ))}
          {isSending && (
            <div className="w-fit max-w-[85%] rounded-2xl bg-white text-gray-500 border px-3 py-2 text-sm shadow-sm">
              thinking…
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </section>

      <form
        onSubmit={sendMessage}
        className="border-t bg-white px-4 py-3"
        aria-label="chat-input"
      >
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something…"
            className="flex-1 rounded-xl border px-3 py-2 outline-none focus:ring text-gray-900 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </main>
  );
}