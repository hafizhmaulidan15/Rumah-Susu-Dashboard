export const SHEET_MAP: Record<string, string> = {
  susu: "susu",
  "susu cup": "susu cup",
  "cup 130 ml": "cup 130 ml",
  "cup 175 ml": "cup 175 ml",
  "plastik logo 2 line": "plastik logo 2 line",
  "plastik logo 4 line": "plastik logo 4 line",
  "plastik roll logo": "plastik roll logo",
  "plastik roll polos": "plastik roll polos",
  "Stock Box Tasik": "Stock Box Tasik",
  "Stock Tray Tasik": "Stock Tray Tasik",
};

export const SHEETS = [
  { key: "summary", label: "All Stocks", unit: "" },
  { key: "susu", label: "Susu", unit: "Liter" },
  { key: "susu cup", label: "Susu Cup", unit: "Pcs" },
  { key: "cup 130 ml", label: "Cup 130 ml", unit: "Pcs" },
  { key: "cup 175 ml", label: "Cup 175 ml", unit: "Pcs" },
  { key: "plastik logo 2 line", label: "Plastik Logo 2 Line", unit: "Pcs" },
  { key: "plastik logo 4 line", label: "Plastik Logo 4 Line", unit: "Pcs" },
  { key: "plastik roll logo", label: "Plastik Roll Logo", unit: "Pcs" },
  { key: "plastik roll polos", label: "Plastik Roll Polos", unit: "Pcs" },
  { key: "Stock Box Tasik", label: "Stock Box Tasik", unit: "Pcs" },
  { key: "Stock Tray Tasik", label: "Stock Tray Tasik", unit: "Pcs" },
];

export const GOOGLE_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbzR4LzWzTgBvEcjfg9z4K31baf2-CNB5InQNPOLn3ko-AVwYT1Cgc969KVzEnmt5_pjsA/exec";

export const INVENTORY_SHEET_KEYS = SHEETS.filter(
  (s) => s.key !== "summary",
).map((s) => s.key);

export async function fetchGoogleSheetData(sheet: string = "susu") {
  const sheetName = SHEET_MAP[sheet] || sheet;
  const url = `${GOOGLE_SCRIPT_URL}?sheet=${encodeURIComponent(sheetName)}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || typeof data !== "object") {
      console.warn("[RSI] Invalid response from GAS:", data);
      return [];
    }
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("[RSI] Fetch error:", error);
    return [];
  }
}

export async function fetchAllSheetsSummary() {
  const url = `${GOOGLE_SCRIPT_URL}?action=summary`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

type SheetStockRow = {
  row?: number | string;
  Tgl?: string;
  Net?: number | string;
};

function rowSortKey(r: SheetStockRow): number {
  const tgl = r.Tgl ? Date.parse(r.Tgl) : NaN;
  if (Number.isFinite(tgl)) return tgl;
  return Number(r.row ?? 0);
}

/** Current stock = Net on the latest transaction row (by date, then row number). */
export function getLatestStockFromRows(
  rows: SheetStockRow[] | null | undefined,
): number {
  if (!rows?.length) return 0;

  const latest = [...rows].sort((a, b) => {
    const diff = rowSortKey(a) - rowSortKey(b);
    if (diff !== 0) return diff;
    return Number(a.row ?? 0) - Number(b.row ?? 0);
  })[rows.length - 1];

  const net = Number(latest?.Net ?? 0);
  return Number.isFinite(net) ? net : 0;
}
