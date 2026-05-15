import { NextResponse } from "next/server";

import {
  fetchGoogleSheetData,
  getLatestStockFromRows,
  INVENTORY_SHEET_KEYS,
} from "@/lib/googleSheets";

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

export async function GET() {
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

  return NextResponse.json({
    stocks,
    failedSheets,
    ok: failedSheets.length === 0,
  });
}
