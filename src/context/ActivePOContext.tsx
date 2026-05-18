"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const CUP_PO_KEYS = ["cup 130 ml", "cup 175 ml"] as const;
export type CupPOKey = (typeof CUP_PO_KEYS)[number];

export interface ActiveCupPO {
  quantity: number;
  region?: string;
}

type ActivePOMap = Partial<Record<CupPOKey, ActiveCupPO>>;

interface ActivePOContextValue {
  activePO: ActivePOMap;
  isHydrated: boolean;
  setCupPO: (key: CupPOKey, data: ActiveCupPO | null) => void;
  clearCupPO: (key: CupPOKey) => void;
}

const SESSION_STORAGE_KEY = "rsi_active_po_v1";

const ActivePOContext = createContext<ActivePOContextValue | null>(null);

function isValidCupPOEntry(
  value: unknown,
): value is ActiveCupPO & { quantity: number } {
  if (!value || typeof value !== "object") return false;
  const v = value as ActiveCupPO;
  return typeof v.quantity === "number" && v.quantity > 0;
}

function loadActivePOFromSession(): ActivePOMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const result: ActivePOMap = {};
    for (const key of CUP_PO_KEYS) {
      const entry = parsed[key];
      if (isValidCupPOEntry(entry)) {
        result[key] = {
          quantity: entry.quantity,
          region:
            typeof entry.region === "string" && entry.region.trim()
              ? entry.region.trim()
              : undefined,
        };
      }
    }
    return result;
  } catch {
    return {};
  }
}

function persistActivePO(map: ActivePOMap) {
  if (typeof window === "undefined") return;
  if (Object.keys(map).length === 0) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(map));
}

export function ActivePOProvider({ children }: { children: ReactNode }) {
  const [activePO, setActivePO] = useState<ActivePOMap>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setActivePO(loadActivePOFromSession());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    persistActivePO(activePO);
  }, [activePO, isHydrated]);

  const setCupPO = useCallback((key: CupPOKey, data: ActiveCupPO | null) => {
    setActivePO((prev) => {
      if (data === null) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: data };
    });
  }, []);

  const clearCupPO = useCallback(
    (key: CupPOKey) => setCupPO(key, null),
    [setCupPO],
  );

  const value = useMemo(
    () => ({ activePO, isHydrated, setCupPO, clearCupPO }),
    [activePO, isHydrated, setCupPO, clearCupPO],
  );

  return (
    <ActivePOContext.Provider value={value}>
      {children}
    </ActivePOContext.Provider>
  );
}

export function useActivePO() {
  const ctx = useContext(ActivePOContext);
  if (!ctx) {
    throw new Error("useActivePO must be used within ActivePOProvider");
  }
  return ctx;
}

export function isCupPOKey(key: string): key is CupPOKey {
  return (CUP_PO_KEYS as readonly string[]).includes(key);
}
