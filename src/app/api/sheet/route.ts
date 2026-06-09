import {
  forbidden,
  isValidOrigin,
  serverError,
  SHEET_FETCH_TIMEOUT_MS,
  withTimeout,
} from "@/lib/api-utils";
import { fetchGoogleSheetData, SHEET_MAP } from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isValidOrigin(request)) return forbidden();

  const sheet = new URL(request.url).searchParams.get("sheet");
  if (!sheet) {
    return new Response(JSON.stringify({ error: "Missing sheet parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!(sheet in SHEET_MAP)) {
    return new Response(JSON.stringify({ error: "Invalid sheet" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  const sheetName = SHEET_MAP[sheet];

  try {
    const rows = await withTimeout(
      fetchGoogleSheetData(sheetName),
      SHEET_FETCH_TIMEOUT_MS,
    );
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[api/sheet] fetch failed:", sheetName, error);
    return serverError(error);
  }
}
