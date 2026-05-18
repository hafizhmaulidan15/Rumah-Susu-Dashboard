import useSWR, { mutate as globalMutate } from "swr";

import { GOOGLE_SCRIPT_URL, SHEET_MAP } from "@/lib/googleSheets";

export {
  fetchAllSheetsSummary,
  fetchGoogleSheetData,
  getLatestStockFromRows,
  GOOGLE_SCRIPT_URL,
  SHEET_MAP,
  SHEETS,
} from "@/lib/googleSheets";

const fetcher = async (url: string) => {
  const buildId = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
  const sep = url.includes("?") ? "&" : "?";
  const res = await fetch(`${url}${sep}_build=${buildId}`, {
    cache: "no-store",
  });
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

function getLatestStocksCacheKey() {
  return "latest-sheet-stocks";
}

async function fetchStocksFromApi(): Promise<Record<string, number>> {
  const res = await fetch("/api/sheets/stocks", { cache: "no-store" });
  if (!res.ok) throw new Error(`Stocks API HTTP ${res.status}`);
  const body = (await res.json()) as {
    stocks?: Record<string, number>;
    failedSheets?: string[];
  };
  return body.stocks ?? {};
}

/** Accurate stocks from each sheet's last row (same source as inventory pages). */
export function useLatestSheetStocksMap() {
  const {
    data,
    error,
    isLoading,
    mutate: mutateStocks,
  } = useSWR(getLatestStocksCacheKey(), fetchStocksFromApi, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    revalidateIfStale: true,
    dedupingInterval: 0,
    errorRetryCount: 3,
    loadingTimeout: 30_000,
  });

  return {
    stockMap: data ?? {},
    isLoading,
    isError: !!error,
    mutate: mutateStocks,
  };
}

export function useSheetData(sheet: string) {
  const sheetName = SHEET_MAP[sheet] || sheet;
  const url = `/api/sheet?sheet=${encodeURIComponent(sheetName)}`;
  const cacheKey = getSheetCacheKey(sheet);

  const {
    data,
    error,
    isLoading,
    mutate: mutateData,
  } = useSWR(cacheKey, () => fetcher(url), {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    revalidateIfStale: true,
    dedupingInterval: 0,
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
