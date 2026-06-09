import {
  badRequest,
  forbidden,
  isValidOrigin,
  rateLimit,
  serverError,
  unauthorized,
} from "@/lib/api-utils";
import { INVENTORY_SHEET_KEYS } from "@/lib/googleSheets";
import { GOOGLE_SCRIPT_URL } from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

const ALLOWED_ACTIONS = ["add", "edit", "delete"] as const;

const validateBody = (body: unknown): string | null => {
  if (!body || typeof body !== "object") return "Request body required";
  const b = body as Record<string, unknown>;
  if (
    typeof b.action !== "string" ||
    !ALLOWED_ACTIONS.includes(b.action as (typeof ALLOWED_ACTIONS)[number])
  )
    return "Invalid action";
  if (!INVENTORY_SHEET_KEYS.includes(b.sheet as string)) return "Invalid sheet";
  return null;
};

export async function POST(request: Request) {
  if (rateLimit(request)) return badRequest("Too many requests");

  if (!isValidOrigin(request)) return forbidden();

  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) return unauthorized();

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const validationError = validateBody(body);
    if (validationError) return badRequest(validationError);

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Forward the actual error message from Google Script if available
      const errorBody = await response.json().catch(() => ({}));
      return badRequest(errorBody?.error || "External service error");
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
