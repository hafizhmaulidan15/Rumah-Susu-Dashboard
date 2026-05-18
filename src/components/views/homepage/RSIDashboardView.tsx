"use client";

import {
  AlertTriangle,
  ArrowRight,
  Box,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  GlassWater,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Milk,
  PackageSearch,
  PlusCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  TrendingDown,
  Zap,
} from "lucide-react";
import { useFormatter } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/common/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/shadcn/card";
import { Progress } from "@/components/common/shadcn/progress";
import { CUP_PO_KEYS, useActivePO } from "@/context/ActivePOContext";
import { Link } from "@/i18n/navigation";
import {
  invalidateAllCaches,
  SHEETS,
  useLatestSheetStocksMap,
} from "@/lib/data";

// --- Configuration & Styles ---

const categoryIcons: Record<string, React.ReactNode> = {
  Susu: <Milk className="w-5 h-5 text-blue-500" />,
  "Cup Products": <GlassWater className="w-5 h-5 text-amber-500" />,
  Packaging: <Layers className="w-5 h-5 text-emerald-500" />,
  "Inventory Items": <Box className="w-5 h-5 text-purple-500" />,
};

const categoryStyles: Record<
  string,
  { bg: string; accent: string; glow: string }
> = {
  Susu: {
    bg: "bg-blue-500/5",
    accent: "bg-blue-500",
    glow: "shadow-blue-500/20",
  },
  "Cup Products": {
    bg: "bg-amber-500/5",
    accent: "bg-amber-500",
    glow: "shadow-amber-500/20",
  },
  Packaging: {
    bg: "bg-emerald-500/5",
    accent: "bg-emerald-500",
    glow: "shadow-emerald-500/20",
  },
  "Inventory Items": {
    bg: "bg-purple-500/5",
    accent: "bg-purple-500",
    glow: "shadow-purple-500/20",
  },
};

const getCategory = (key: string) => {
  if (key === "susu") return "Susu";
  if (key === "susu cup" || key === "cup 130 ml" || key === "cup 175 ml")
    return "Cup Products";
  if (key.includes("plastik")) return "Packaging";
  return "Inventory Items";
};

const sheetToUrl: Record<string, string> = {
  susu: "/susu",
  "susu cup": "/susu-cup",
  "cup 130 ml": "/cup-130ml",
  "cup 175 ml": "/cup-175ml",
  "plastik logo 2 line": "/plastik-logo-2line",
  "plastik logo 4 line": "/plastik-logo-4line",
  "plastik roll logo": "/plastik-roll-logo",
  "plastik roll polos": "/plastik-roll-polos",
  "Stock Box Tasik": "/stock-box-tasik",
  "Stock Tray Tasik": "/stock-tray-tasik",
};

/** Per-item low-stock limits (liter/pcs) — avoids false "Critical" on high-volume SKUs. */
const LOW_STOCK_THRESHOLDS: Record<string, number> = {
  susu: 500,
  "susu cup": 5_000,
  "cup 130 ml": 10_000,
  "cup 175 ml": 5_000,
  "plastik logo 2 line": 5,
  "plastik logo 4 line": 5,
  "plastik roll logo": 10,
  "plastik roll polos": 2,
  "Stock Box Tasik": 10,
  "Stock Tray Tasik": 10,
};

function isLowStock(key: string, stock: number): boolean {
  const threshold = LOW_STOCK_THRESHOLDS[key] ?? 1000;
  return stock < threshold;
}

export const RSIDashboardView = () => {
  const format = useFormatter();
  const {
    stockMap = {},
    isLoading: isStocksLoading,
    isError: isStocksError,
    mutate: mutateStocks,
  } = useLatestSheetStocksMap();
  const showStocksPending =
    isStocksLoading && Object.keys(stockMap).length === 0;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const { activePO } = useActivePO();
  const poCount = CUP_PO_KEYS.filter(
    (key) => (activePO[key]?.quantity ?? 0) > 0,
  ).length;

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    invalidateAllCaches();
    await mutateStocks();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Data processing with safe Number conversion
  const allStockItems = useMemo(() => {
    return SHEETS.filter((s) => s.key !== "summary").map((sheet) => {
      const stock = Number(stockMap[sheet.key]) || 0;
      return { ...sheet, stock, isLow: isLowStock(sheet.key, stock) };
    });
  }, [stockMap]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return allStockItems;
    const q = searchQuery.toLowerCase();
    return allStockItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [allStockItems, searchQuery]);

  const groupedData = useMemo(() => {
    return filteredItems.reduce(
      (acc, item) => {
        const category = getCategory(item.key);
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      },
      {} as Record<string, typeof allStockItems>,
    );
  }, [filteredItems]);

  const lowStockItems = useMemo(() => {
    if (showStocksPending) return [];
    return allStockItems.filter(
      (item) => item.isLow && item.key !== "susu cup",
    );
  }, [allStockItems, showStocksPending]);

  const totalStockValue = useMemo(() => {
    return Object.values(stockMap).reduce((sum, val) => {
      const n = Number(val);
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
  }, [stockMap]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12 animate-in fade-in duration-700">
      {isStocksError && Object.keys(stockMap).length === 0 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
          Gagal memuat data dari Google Sheets. Coba Refresh atau periksa
          koneksi / URL script di environment Vercel.
        </div>
      )}

      {/* HEADER: Dynamic & Professional */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-primaryBg p-6 rounded-3xl border border-mainBorder shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-mainColor p-3 rounded-2xl shadow-lg shadow-mainColor/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Warehouse Overview
            </h1>
            <div className="flex items-center gap-3 text-[13px] font-semibold text-zinc-400 mt-0.5">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-mainColor" />{" "}
                {currentTime
                  ? format.dateTime(currentTime, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  : "..."}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
              <span className="text-emerald-500 flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> System Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-mainColor/10 transition-all"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isStocksLoading || isRefreshing}
            className="rounded-2xl h-[46px] w-[46px] border-zinc-100 dark:border-zinc-800"
          >
            <RefreshCcw
              className={`w-4 h-4 text-zinc-500 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* KPI GRID: Balanced & High Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-none text-white shadow-xl relative overflow-hidden group">
          <CardContent className="p-6 relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
              Total Warehouse Stock
            </p>
            <h3 className="text-4xl font-black tabular-nums">
              {showStocksPending ? "---" : format.number(totalStockValue)}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-mainColor">
              <Zap className="w-3 h-3 fill-current" /> Live from Google Sheets
            </div>
          </CardContent>
          <PackageSearch className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform duration-700" />
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
              Critical Alerts
            </p>
            <h3
              className={`text-4xl font-black tabular-nums ${lowStockItems.length > 0 ? "text-red-500" : "text-emerald-500"}`}
            >
              {showStocksPending ? "---" : lowStockItems.length}
            </h3>
            <div
              className={`mt-4 inline-flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] font-bold ${lowStockItems.length > 0 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}
            >
              {showStocksPending
                ? "Loading..."
                : lowStockItems.length > 0
                  ? "Action Required"
                  : "Status Healthy"}
            </div>
          </CardContent>
          <AlertTriangle
            className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 ${lowStockItems.length > 0 ? "text-red-500" : "text-emerald-500"}`}
          />
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
              PO Aktif (Tampilan Cup)
            </p>
            <h3 className="text-4xl font-black text-zinc-900 dark:text-white tabular-nums">
              {poCount}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-zinc-400">
              <ClipboardList className="w-3 h-3" /> Sesi tab (refresh OK)
            </div>
          </CardContent>
        </Card>

        <Link
          href="/purchase-order"
          className="bg-mainColor hover:bg-mainColor/90 p-1 rounded-3xl shadow-xl shadow-mainColor/20 group transition-all"
        >
          <div className="h-full w-full bg-white/10 rounded-[22px] flex flex-col items-center justify-center gap-2 text-white text-center p-4">
            <div className="bg-white/20 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight">Create PO</span>
          </div>
        </Link>
      </div>

      {/* MAIN SECTION: Category Masonry & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: Product Categories (3 columns on LG) */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groupedData).map(([category, items]) => {
            const style =
              categoryStyles[category] || categoryStyles["Inventory Items"];
            return (
              <Card
                key={category}
                className="overflow-hidden border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md"
              >
                <div
                  className={`px-6 py-5 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between ${style.bg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                      {categoryIcons[category]}
                    </div>
                    <h3 className="font-black text-zinc-900 dark:text-white text-base tracking-tight uppercase">
                      {category}
                    </h3>
                  </div>
                  <span className="text-[10px] font-black bg-white dark:bg-white/10 px-3 py-1 rounded-full text-zinc-500 shadow-sm">
                    {items.length} Units
                  </span>
                </div>
                <div className="divide-y divide-zinc-50 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                  {items.map((item) => (
                    <Link
                      key={item.key}
                      href={sheetToUrl[item.key] || "#"}
                      className="flex flex-col px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[15px] font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-mainColor transition-colors">
                          {item.label}
                        </span>
                        <div className="text-right flex flex-col items-end">
                          <span
                            className={`text-sm font-black tabular-nums ${item.isLow ? "text-red-500" : "text-zinc-900 dark:text-white"}`}
                          >
                            {showStocksPending
                              ? "---"
                              : format.number(item.stock)}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                            {item.unit}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-2 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${item.isLow ? "bg-red-500" : style.accent}`}
                            style={{
                              width: `${Math.min((item.stock / 5000) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase tracking-tighter ${item.isLow ? "text-red-500 animate-pulse" : "text-zinc-400"}`}
                        >
                          {item.isLow ? "Critical" : "Healthy"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right: Focused Alerts */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <Card className="border-none bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xl overflow-hidden">
            <CardHeader className="p-5 border-b border-white/5 dark:border-zinc-50">
              <CardTitle className="text-base font-black flex items-center gap-2 uppercase tracking-wider">
                <AlertTriangle className="w-5 h-5 text-red-500" /> Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {showStocksPending ? (
                <p className="p-8 text-center text-sm font-semibold opacity-60">
                  Memuat data stok...
                </p>
              ) : lowStockItems.length > 0 ? (
                <div className="divide-y divide-white/5 dark:divide-zinc-50 max-h-[380px] overflow-y-auto">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.key}
                      className="p-5 flex items-center justify-between group hover:bg-white/5 dark:hover:bg-zinc-50 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold opacity-90">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-red-500">
                            {format.number(item.stock)}
                          </span>
                          <span className="text-[9px] font-bold opacity-40 uppercase tracking-tighter">
                            {item.unit} Left
                          </span>
                        </div>
                      </div>
                      <Link
                        href="/purchase-order"
                        className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 mx-auto flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black">All Good!</p>
                    <p className="text-[11px] opacity-50 mt-1">
                      No items need restocking.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 bg-mainColor/5 rounded-[32px] border border-mainColor/10 space-y-3">
            <div className="flex items-center gap-2 text-mainColor">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Quick Note
              </span>
            </div>
            <p className="text-[12px] text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
              Inventory levels are synced in real-time from{" "}
              <span className="text-zinc-900 dark:text-white font-black underline decoration-mainColor/30">
                Google Sheets
              </span>
              . Use search for quick navigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
