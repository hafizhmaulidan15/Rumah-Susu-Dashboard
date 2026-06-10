import { NextRequest } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5-coder:14b";

const SYSTEM_PROMPT = `You are an AI assistant for Rumah Susu Indonesia, a dairy inventory management dashboard.
You help staff track and manage inventory across multiple product categories:
- Susu (milk in liters)
- Cup products (Susu Cup, Cup 130ml, Cup 175ml)
- Packaging (plastic bags and rolls)
- Inventory items (Box Tasik, Tray Tasik)

Answer questions about stock data, help generate reports, and assist with inventory management.
Keep responses concise and practical. Use Indonesian or English as appropriate.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "messages array is required" },
        { status: 400 },
      );
    }

    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: fullMessages,
        stream: true,
      }),
    });

    if (!ollamaRes.ok) {
      const text = await ollamaRes.text();
      return Response.json(
        { error: `Ollama error (${ollamaRes.status}): ${text}` },
        { status: 502 },
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaRes.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line);
                if (parsed.message?.content) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ content: parsed.message.content })}\n\n`,
                    ),
                  );
                }
                if (parsed.done) {
                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                }
              } catch {
                continue;
              }
            }
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("AI chat error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
