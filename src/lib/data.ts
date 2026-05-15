import useSWR, { mutate as globalMutate } from "swr";

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
  "https://script.google.com/macros/s/AKfycbxRlcAK8NPNNLlMz-qt-kw_Cu4yzJNo2hQjAF_2WZg20nM5H2Nybz3nmoS0wOYIPAaakQ/exec";

export async function fetchGoogleSheetData(sheet: string = "susu") {
  const sheetName = SHEET_MAP[sheet] || sheet;
  const url = `${GOOGLE_SCRIPT_URL}?sheet=${encodeURIComponent(sheetName)}`;

  try {
    const res = await fetch(url);
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
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

function getSheetCacheKey(sheet: string) {
  return `sheet-${sheet}`;
}

function getSummaryCacheKey() {
  return "sheet-summary";
}

export type SummaryRow = {
  name?: string;
  currentStock?: number;
  balance?: number;
  stock?: number;
  net?: number;
};

/** Stock from GAS summary action — may be stale; prefer getLatestStockFromRows. */
export function getSummaryStock(summary: SummaryRow[], key: string): number {
  const item = summary.find((s) => s.name?.toLowerCase() === key.toLowerCase());
  if (!item) return 0;
  return item.currentStock ?? item.balance ?? item.stock ?? item.net ?? 0;
}

type SheetStockRow = { row?: number | string; Net?: number | string };

/** Current stock = Net on the highest row number (matches inventory table). */
export function getLatestStockFromRows(
  rows: SheetStockRow[] | null | undefined,
): number {
  if (!rows?.length) return 0;

  let latest = rows[0];
  let maxRow = Number(latest.row ?? 0);

  for (let i = 1; i < rows.length; i++) {
    const rowNum = Number(rows[i].row ?? 0);
    if (rowNum >= maxRow) {
      maxRow = rowNum;
      latest = rows[i];
    }
  }

  return Number(latest.Net ?? 0);
}

const INVENTORY_SHEET_KEYS = SHEETS.filter((s) => s.key !== "summary").map(
  (s) => s.key,
);

function getLatestStocksCacheKey() {
  return "latest-sheet-stocks";
}

/** Accurate stocks from each sheet's last row (same source as inventory pages). */
export function useLatestSheetStocksMap() {
  const {
    data,
    error,
    isLoading,
    mutate: mutateStocks,
  } = useSWR(
    getLatestStocksCacheKey(),
    async () => {
      const entries = await Promise.all(
        INVENTORY_SHEET_KEYS.map(async (key) => {
          const rows = await fetchGoogleSheetData(key);
          const stock = getLatestStockFromRows(rows);
          return [key, stock] as const;
        }),
      );
      return Object.fromEntries(entries) as Record<string, number>;
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
    },
  );

  return {
    stockMap: data ?? {},
    isLoading,
    isError: !!error,
    mutate: mutateStocks,
  };
}

export function useSheetData(sheet: string) {
  const sheetName = SHEET_MAP[sheet] || sheet;
  const url = `${GOOGLE_SCRIPT_URL}?sheet=${encodeURIComponent(sheetName)}`;
  const cacheKey = getSheetCacheKey(sheet);

  const {
    data,
    error,
    isLoading,
    mutate: mutateData,
  } = useSWR(cacheKey, () => fetcher(url), {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
    dedupingInterval: 2000,
    errorRetryCount: 3,
    loadingTimeout: 3000,
  });

  return {
    data: Array.isArray(data) ? data : [],
    isLoading,
    isError: !!error,
    mutate: mutateData,
  };
}

export function useSummaryData() {
  const url = `${GOOGLE_SCRIPT_URL}?action=summary`;
  const cacheKey = getSummaryCacheKey();

  const {
    data,
    error,
    isLoading,
    mutate: mutateData,
  } = useSWR(cacheKey, () => fetcher(url), {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
    dedupingInterval: 2000,
    errorRetryCount: 3,
    loadingTimeout: 3000,
  });

  return {
    data: Array.isArray(data) ? data : [],
    isLoading,
    isError: !!error,
    mutate: mutateData,
  };
}

export function invalidateSheetCache(sheet: string) {
  globalMutate(getSheetCacheKey(sheet), undefined, { revalidate: true });
}

export function invalidateSummaryCache() {
  globalMutate(getSummaryCacheKey(), undefined, { revalidate: true });
}

export function invalidateAllCaches() {
  globalMutate(() => true, undefined, { revalidate: true });
}

export function invalidateRelatedCaches(sheet: string) {
  invalidateSheetCache(sheet);
  invalidateSummaryCache();
  globalMutate(getLatestStocksCacheKey(), undefined, { revalidate: true });
}

export function preloadData() {
  const prioritySheets = [
    "susu",
    "cup 130 ml",
    "Stock Box Tasik",
    "cup 175 ml",
  ];

  prioritySheets.forEach((sheet) => {
    globalMutate(getSheetCacheKey(sheet), undefined, { revalidate: true });
  });

  globalMutate(getSummaryCacheKey(), undefined, {
    revalidate: true,
  });
}
