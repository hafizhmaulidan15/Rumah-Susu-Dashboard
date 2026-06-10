"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Box,
  ClipboardList,
  Clock,
  GlassWater,
  Layers,
  LayoutDashboard,
  Milk,
  Minus,
  PackageSearch,
  PlusCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
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

function getStockHealth(key: string, stock: number) {
  const threshold = LOW_STOCK_THRESHOLDS[key] ?? 1000;
  const ratio = stock / threshold;
  if (ratio >= 1)
    return { level: "high" as const, ratio: Math.min(ratio / 2, 1) };
  if (ratio >= 0.5) return { level: "medium" as const, ratio };
  return { level: "low" as const, ratio };
}

function getBarColor(level: "high" | "medium" | "low") {
  switch (level) {
    case "high":
      return "from-emerald-500 to-emerald-400";
    case "medium":
      return "from-amber-500 to-amber-400";
    case "low":
      return "from-red-500 to-red-400";
  }
}

function getTrendIcon(level: "high" | "medium" | "low") {
  switch (level) {
    case "high":
      return { icon: ArrowUp, color: "text-emerald-500" };
    case "medium":
      return { icon: Minus, color: "text-amber-500" };
    case "low":
      return { icon: ArrowDown, color: "text-red-500" };
  }
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

  const allStockItems = useMemo(() => {
    return SHEETS.filter((s) => s.key !== "summary").map((sheet) => {
      const stock = Number(stockMap[sheet.key]) || 0;
      const health = getStockHealth(sheet.key, stock);
      return { ...sheet, stock, health };
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
      (item) => item.health.level === "low" && item.key !== "susu cup",
    );
  }, [allStockItems, showStocksPending]);

  const totalStockValue = useMemo(() => {
    return Object.values(stockMap).reduce((sum, val) => {
      const n = Number(val);
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
  }, [stockMap]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-5 pb-12">
      {isStocksError && Object.keys(stockMap).length === 0 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
          Gagal memuat data dari Google Sheets. Coba Refresh atau periksa
          koneksi / URL script di environment Vercel.
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-primaryBg p-5 rounded-2xl border border-mainBorder shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-mainColor p-2.5 rounded-xl shadow-lg shadow-mainColor/20">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Rumah Susu Indonesia - Warehouse Tasik
            </h1>
            <div className="flex items-center gap-2 text-[12px] font-semibold text-zinc-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-mainColor" />{" "}
                {currentTime
                  ? format.dateTime(currentTime, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  : "..."}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-300" />
              <span className="text-emerald-500 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3 h-3" /> System Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              aria-label="Search inventory"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mainColor/10 transition-all"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Refresh stock data"
            onClick={handleRefresh}
            disabled={isStocksLoading || isRefreshing}
            className="rounded-xl h-[38px] w-[38px] border-zinc-100 dark:border-zinc-800"
          >
            <RefreshCcw
              className={`w-3.5 h-3.5 text-zinc-500 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-zinc-900 border-none text-white shadow-xl relative overflow-hidden group">
          <CardContent className="p-5 relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Total Warehouse Stock
            </p>
            <h2 className="text-3xl font-bold tabular-nums">
              {showStocksPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-zinc-600 border-t-mainColor animate-spin" />
                  <span className="text-sm">Memuat...</span>
                </div>
              ) : (
                format.number(totalStockValue)
              )}
            </h2>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-mainColor">
              <Zap className="w-2.5 h-2.5 fill-current" /> Live from Google
              Sheets
            </div>
          </CardContent>
          <PackageSearch className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform duration-500" />
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Critical Alerts
            </p>
            <h2
              className={`text-3xl font-bold tabular-nums ${showStocksPending ? "text-zinc-300" : lowStockItems.length > 0 ? "text-red-500" : "text-emerald-500"}`}
            >
              {showStocksPending ? "..." : lowStockItems.length}
            </h2>
            <div
              className={`mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${lowStockItems.length > 0 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}
            >
              {showStocksPending
                ? "Loading..."
                : lowStockItems.length > 0
                  ? "Action Required"
                  : "Status Healthy"}
            </div>
          </CardContent>
          <AlertTriangle
            className={`absolute -right-3 -bottom-3 w-20 h-20 opacity-5 ${lowStockItems.length > 0 ? "text-red-500" : "text-emerald-500"}`}
          />
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              PO Aktif (Cup)
            </p>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tabular-nums">
              {poCount}
            </h2>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400">
              <ClipboardList className="w-3 h-3" /> Sesi tab (refresh OK)
            </div>
          </CardContent>
        </Card>

        <Link
          href="/purchase-order"
          className="bg-mainColor hover:bg-mainColor/90 p-1 rounded-2xl shadow-lg shadow-mainColor/20 group transition-all"
        >
          <div className="h-full w-full bg-white/10 rounded-[18px] flex flex-col items-center justify-center gap-1.5 text-white text-center p-4">
            <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">Create PO</span>
          </div>
        </Link>
      </div>

      {/* MAIN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
          {Object.entries(groupedData).length === 0 && searchQuery ? (
            <div className="col-span-full text-center py-12 text-zinc-400">
              <PackageSearch className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-sm">
                {`Tidak ada hasil untuk "${searchQuery}"`}
              </p>
            </div>
          ) : (
            Object.entries(groupedData).map(([category, items]) => {
              const style =
                categoryStyles[category] || categoryStyles["Inventory Items"];
              return (
                <Card
                  key={category}
                  className="overflow-hidden border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md"
                >
                  <div
                    className={`px-5 py-4 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between ${style.bg}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-white dark:bg-zinc-950 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800">
                        {categoryIcons[category]}
                      </div>
                      <h3 className="font-bold text-zinc-900 dark:text-white text-sm tracking-tight uppercase">
                        {category}
                      </h3>
                    </div>
                    <span className="text-[10px] font-semibold bg-white dark:bg-white/10 px-2.5 py-1 rounded-full text-zinc-500 shadow-sm">
                      {items.length} Units
                    </span>
                  </div>
                  <div className="divide-y divide-zinc-50 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                    {items.map((item) => {
                      const TrendIcon = getTrendIcon(item.health.level).icon;
                      const trendColor = getTrendIcon(item.health.level).color;
                      const barColor = getBarColor(item.health.level);
                      return (
                        <Link
                          key={item.key}
                          href={sheetToUrl[item.key] || "#"}
                          className="flex flex-col px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 transition-colors group"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-mainColor transition-colors">
                              {item.label}
                            </span>
                            <div className="text-right flex items-center gap-2">
                              <TrendIcon
                                className={`w-3.5 h-3.5 ${trendColor}`}
                              />
                              <div className="flex flex-col items-end">
                                <span
                                  className={`text-sm font-bold tabular-nums ${item.health.level === "low" ? "text-red-500" : "text-zinc-900 dark:text-white"}`}
                                >
                                  {showStocksPending
                                    ? "---"
                                    : format.number(item.stock)}
                                </span>
                                <span className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest">
                                  {item.unit}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
                                style={{
                                  width: `${Math.min(item.health.ratio * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <span
                              className={`text-[8px] font-bold uppercase tracking-tighter ${item.health.level === "low" ? "text-red-500" : "text-zinc-400"}`}
                            >
                              {item.health.level === "high"
                                ? "Good"
                                : item.health.level === "medium"
                                  ? "Fair"
                                  : "Critical"}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Stock Alerts Sidebar */}
        <div className="space-y-5 lg:sticky lg:top-6">
          <Card className="border-none bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl overflow-hidden">
            <CardHeader className="p-4 border-b border-white/5 dark:border-zinc-300">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-white dark:text-zinc-900">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {showStocksPending ? (
                <p className="p-6 text-center text-xs font-semibold text-white/60 dark:text-zinc-900/60">
                  Memuat data stok...
                </p>
              ) : lowStockItems.length > 0 ? (
                <div className="divide-y divide-white/5 dark:divide-zinc-300 max-h-[340px] overflow-y-auto">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.key}
                      className="p-4 flex items-center justify-between group hover:bg-white/5 dark:hover:bg-zinc-100 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-white dark:text-zinc-900">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-red-500">
                            {format.number(item.stock)}
                          </span>
                          <span className="text-[8px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">
                            {item.unit} Left
                          </span>
                        </div>
                      </div>
                      <Link
                        href={sheetToUrl[item.key] || "/purchase-order"}
                        aria-label={`Buat PO untuk ${item.label}`}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 mx-auto flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white dark:text-zinc-900">
                      All Good!
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                      No items need restocking.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-5 bg-mainColor/5 rounded-2xl border border-mainColor/10 space-y-2.5">
            <div className="flex items-center gap-1.5 text-mainColor">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                Quick Note
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
              Inventory levels are synced in real-time from{" "}
              <span className="text-zinc-900 dark:text-white font-bold underline decoration-mainColor/30">
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
