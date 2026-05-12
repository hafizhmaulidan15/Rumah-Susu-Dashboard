import useSWR, { mutate as globalMutate } from "swr";

export const SHEET_MAP: Record<string, string> = {
  form: "form",
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
  "https://script.google.com/macros/s/AKfycbxRlcAK8NPNNLlMz-qt-kw_Cu4yzJNo2hQjAF_2WZg20nM5H2Nybz3nmoS0wOYIPAaakQ/exec";

export async function fetchGoogleSheetData(sheet: string = "susu") {
  const sheetName = SHEET_MAP[sheet] || sheet;
  const url = `${GOOGLE_SCRIPT_URL}?sheet=${sheetName}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch from script");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Fetch error:", error);
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
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

function getSheetCacheKey(sheet: string) {
  return `sheet-${sheet}`;
}

function getSummaryCacheKey() {
  return "sheet-summary";
}

export function useSheetData(sheet: string) {
  const sheetName = SHEET_MAP[sheet] || sheet;
  const url = `${GOOGLE_SCRIPT_URL}?sheet=${sheetName}`;
  const cacheKey = getSheetCacheKey(sheet);

  const {
    data,
    error,
    isLoading,
    mutate: mutateData,
  } = useSWR(cacheKey, () => fetcher(url), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
    dedupingInterval: 5000,
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
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
    dedupingInterval: 5000,
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
  if (
    sheet === "susu cup" ||
    sheet === "cup 130 ml" ||
    sheet === "cup 175 ml"
  ) {
    invalidateSummaryCache();
  }
}

export function preloadData() {
  const prioritySheets = [
    "susu",
    "cup 130 ml",
    "Stock Box Tasik",
    "cup 175 ml",
  ];

  prioritySheets.forEach((sheet) => {
    const sheetName = SHEET_MAP[sheet] || sheet;
    const url = `${GOOGLE_SCRIPT_URL}?sheet=${sheetName}`;
    globalMutate(url, undefined, { revalidate: true });
  });

  globalMutate(`${GOOGLE_SCRIPT_URL}?action=summary`, undefined, {
    revalidate: true,
  });
}
