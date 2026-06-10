import { checkOllamaStatus } from "@/lib/ollama";

export const dynamic = "force-dynamic";

export async function GET() {
  const connected = await checkOllamaStatus();
  return Response.json({ connected });
}
