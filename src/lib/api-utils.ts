import { NextResponse } from "next/server";

export const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export const SHEET_FETCH_TIMEOUT_MS = 20_000;

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Sheet fetch timeout")), ms);
    }),
  ]);
}

const ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:4000"];

if (process.env.NEXT_PUBLIC_AUTH_URL) {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_AUTH_URL);
    ALLOWED_ORIGINS.push(url.origin);
  } catch {}
}

export function isValidOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const check = origin || referer || "";
  if (!check) return false;
  return ALLOWED_ORIGINS.some((a) => check === a || check.startsWith(a + "/"));
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json(
    { error: message },
    { status: 401, headers: NO_STORE_HEADERS },
  );
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json(
    { error: message },
    { status: 403, headers: NO_STORE_HEADERS },
  );
}

export function badRequest(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400, headers: NO_STORE_HEADERS },
  );
}

export function serverError(error: unknown) {
  console.error("Server Error:", error);
  return NextResponse.json(
    { error: "Internal Server Error" },
    { status: 500, headers: NO_STORE_HEADERS },
  );
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(
  request: Request,
  opts: { max: number; windowMs: number } = { max: 30, windowMs: 60_000 },
): boolean {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + opts.windowMs });
    return false;
  }
  entry.count++;
  if (entry.count > opts.max) return true;
  return false;
}
