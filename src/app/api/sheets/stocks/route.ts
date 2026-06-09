import {
  forbidden,
  isValidOrigin,
  SHEET_FETCH_TIMEOUT_MS,
  withTimeout,
} from "@/lib/api-utils";
import {
  fetchGoogleSheetData,
  getLatestStockFromRows,
  INVENTORY_SHEET_KEYS,
} from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isValidOrigin(request)) return forbidden();

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

    return new Response(
      JSON.stringify({ stocks, failedSheets, ok: failedSheets.length === 0 }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("Stocks API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", ok: false }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  }
}
