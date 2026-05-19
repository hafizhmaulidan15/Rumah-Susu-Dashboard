import { NextResponse } from "next/server";

import { NO_STORE_HEADERS } from "@/lib/api-utils";
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

function isValidOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  if (!origin && !referer) return true;
  const host = request.headers.get("host") || "localhost:3000";
  const allowed = [
    `http://${host}`,
    `https://${host}`,
    "http://localhost:3000",
  ];
  const check = origin || referer || "";
  return allowed.some((a) => check.startsWith(a));
}

export async function POST(request: Request) {
  try {
    if (!isValidOrigin(request)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403, headers: NO_STORE_HEADERS },
      );
    }

    const apiKey = request.headers.get("x-api-key");
    if (process.env.API_SECRET_KEY && apiKey !== process.env.API_SECRET_KEY) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const validationError = validateBody(body);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "External service error" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("GSheet Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
