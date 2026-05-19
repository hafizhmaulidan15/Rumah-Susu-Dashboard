import { NextResponse } from "next/server";

import {
  NO_STORE_HEADERS,
  SHEET_FETCH_TIMEOUT_MS,
  withTimeout,
} from "@/lib/api-utils";
import { fetchGoogleSheetData, SHEET_MAP } from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

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

export async function GET(request: Request) {
  if (!isValidOrigin(request)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: NO_STORE_HEADERS },
    );
  }

  const sheet = new URL(request.url).searchParams.get("sheet");
  if (!sheet) {
    return NextResponse.json(
      { error: "Missing sheet parameter" },
      { status: 400 },
    );
  }

  if (!(sheet in SHEET_MAP)) {
    return NextResponse.json(
      { error: "Invalid sheet" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }
  const sheetName = SHEET_MAP[sheet];

  try {
    const rows = await withTimeout(
      fetchGoogleSheetData(sheetName),
      SHEET_FETCH_TIMEOUT_MS,
    );
    return NextResponse.json(rows, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("[api/sheet] fetch failed:", sheetName, error);
    return NextResponse.json(
      { error: "Failed to load sheet data" },
      { status: 502, headers: NO_STORE_HEADERS },
    );
  }
}
