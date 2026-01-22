"use client";

import { useState } from "react";

interface Msg { role: "user" | "assistant" | "system"; content: string }

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!input.trim()) return;
    const next = [...messages, { role: "user", content: input } as Msg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      const reply = data?.message?.content ?? "";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setError(e?.message || "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="border rounded p-3 space-y-2 min-h-40">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500">Ask me anything…</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className="text-sm">
            <span className="font-medium mr-2">{m.role}:</span>
            <span className="whitespace-pre-wrap">{m.content}</span>
          </div>
        ))}
        {loading && <p className="text-sm text-gray-500">Thinking…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type your message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
        />
        <button onClick={send} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Send</button>
      </div>
    </div>
  );
}
