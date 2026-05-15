import { NextResponse } from "next/server";

import { fetchGoogleSheetData, SHEET_MAP } from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

const SHEET_FETCH_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Sheet fetch timeout")), ms);
    }),
  ]);
}

export async function GET(request: Request) {
  const sheet = new URL(request.url).searchParams.get("sheet");
  if (!sheet) {
    return NextResponse.json(
      { error: "Missing sheet parameter" },
      { status: 400 },
    );
  }

  const sheetName = SHEET_MAP[sheet] ?? sheet;

  try {
    const rows = await withTimeout(
      fetchGoogleSheetData(sheetName),
      SHEET_FETCH_TIMEOUT_MS,
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("[api/sheet] fetch failed:", sheetName, error);
    return NextResponse.json(
      { error: "Failed to load sheet data" },
      { status: 502 },
    );
  }
}
