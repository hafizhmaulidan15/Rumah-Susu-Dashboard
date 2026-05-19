import { NextResponse } from "next/server";

import {
  NO_STORE_HEADERS,
  SHEET_FETCH_TIMEOUT_MS,
  withTimeout,
} from "@/lib/api-utils";
import {
  fetchGoogleSheetData,
  getLatestStockFromRows,
  INVENTORY_SHEET_KEYS,
} from "@/lib/googleSheets";

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

  try {
    const results = await Promise.allSettled(
      INVENTORY_SHEET_KEYS.map(async (key) => {
        const rows = await withTimeout(
          fetchGoogleSheetData(key),
          SHEET_FETCH_TIMEOUT_MS,
        );
        const stock = getLatestStockFromRows(rows);
        return { key, stock, rowCount: rows.length };
      }),
    );

    const stocks: Record<string, number> = {};
    const failedSheets: string[] = [];

    for (let i = 0; i < results.length; i++) {
      const key = INVENTORY_SHEET_KEYS[i];
      const result = results[i];
      if (result.status === "fulfilled") {
        const stock = result.value.stock;
        stocks[result.value.key] = Number.isFinite(stock) ? stock : 0;
      } else {
        stocks[key] = 0;
        failedSheets.push(key);
      }
    }

    return NextResponse.json(
      {
        stocks,
        failedSheets,
        ok: failedSheets.length === 0,
      },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Stocks API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", ok: false },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
