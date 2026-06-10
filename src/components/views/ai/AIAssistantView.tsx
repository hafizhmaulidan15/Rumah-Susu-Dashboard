"use client";

import { Bot, SendHorizontal, Sparkles, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/common/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/shadcn/card";
import { useAIChatStore } from "@/store/aiChatStore";

export const AIAssistantView = () => {
  const {
    messages,
    isStreaming,
    addMessage,
    appendToLastAssistant,
    setStreaming,
    clearMessages,
  } = useAIChatStore();

  const [input, setInput] = useState("");
  const [connected, setConnected] = useState<boolean | null>(null);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then((d) => setConnected(d.connected))
      .catch(() => setConnected(false));
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");

    addMessage({ role: "user", content: text });
    addMessage({ role: "assistant", content: "" });
    setStreaming(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: text }].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              appendToLastAssistant(parsed.content);
            }
          } catch {
            continue;
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Gagal terhubung ke AI";
      toast.error(msg);
    } finally {
      setStreaming(false);
      setAbortController(null);
    }
  }, [
    input,
    isStreaming,
    messages,
    addMessage,
    appendToLastAssistant,
    setStreaming,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const cancelStream = () => {
    abortController?.abort();
    setStreaming(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto w-full">
      <Card className="flex flex-col flex-1 border-border/50 shadow-sm">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-500" />
            AI Assistant
            {connected === true && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Qwen2.5
              </span>
            )}
            {connected === false && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Offline
              </span>
            )}
          </CardTitle>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4 px-4 py-2">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-3">
              <Sparkles className="w-10 h-10 text-blue-400" />
              <p className="text-sm max-w-sm">
                Tanya AI tentang data inventaris, bantu laporan, atau diskusi
                seputar stok produk.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  "Berapa total stok susu?",
                  "Produk apa yang stoknya menipis?",
                  "Bantu buat laporan stok",
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-md"
                    : "bg-accent text-foreground rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="whitespace-pre-wrap">{msg.content || ""}</div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {isStreaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-2.5 bg-accent rounded-bl-md">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </CardContent>

        <div className="border-t border-border/50 pt-3 pb-3 px-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-end gap-2 w-full"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                connected === false
                  ? "AI sedang offline (Ollama tidak terhubung)..."
                  : "Tanyakan sesuatu..."
              }
              disabled={isStreaming || connected === false}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            {isStreaming ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={cancelStream}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || connected === false}
                className="shrink-0"
              >
                <SendHorizontal className="w-4 h-4" />
              </Button>
            )}
          </form>
        </div>
      </Card>
    </div>
  );
};
