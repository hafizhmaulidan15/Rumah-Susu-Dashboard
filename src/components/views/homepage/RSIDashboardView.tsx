"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  CupIcon,
  DropletIcon,
  LayersIcon,
  PackageIcon,
} from "@/assets/icons/RSIIcons";
import { Card } from "@/components/common/shadcn/card";
import { SHEETS, useSummaryData } from "@/lib/data";

interface SummaryItem {
  name: string;
  totalIn: number;
  totalOut: number;
  currentStock: number;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Susu: <DropletIcon className="w-6 h-6 text-mainColor" />,
  "Cup Products": <CupIcon className="w-6 h-6 text-mainColor" />,
  Packaging: <LayersIcon className="w-6 h-6 text-mainColor" />,
  "Inventory Items": <PackageIcon className="w-6 h-6 text-mainColor" />,
};

const categoryColors: Record<string, string> = {
  Susu: "bg-blue-500/10 border-blue-500/20",
  "Cup Products": "bg-amber-500/10 border-amber-500/20",
  Packaging: "bg-green-500/10 border-green-500/20",
  "Inventory Items": "bg-purple-500/10 border-purple-500/20",
};

const getCategory = (key: string) => {
  if (key === "susu" || key === "susu cup") return "Susu";
  if (key === "cup 130 ml" || key === "cup 175 ml") return "Cup Products";
  if (key.includes("plastik")) return "Packaging";
  if (key.includes("box") || key.includes("tray")) return "Inventory Items";
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

const getStock = (summary: SummaryItem[], key: string): number => {
  const item = summary.find((s) => s.name.toLowerCase() === key.toLowerCase());
  return item?.currentStock ?? 0;
};

export const RSIDashboardView = () => {
  const { data: summary, isLoading } = useSummaryData();

  const summaryData: SummaryItem[] = Array.isArray(summary) ? summary : [];

  const groupedData = useMemo(() => {
    return SHEETS.slice(1).reduce(
      (acc, sheet) => {
        const category = getCategory(sheet.key);
        if (!acc[category]) acc[category] = [];
        acc[category].push(sheet);
        return acc;
      },
      {} as Record<string, typeof SHEETS>,
    );
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(groupedData).map(([category, sheets]) => {
          const totalStock = sheets.reduce(
            (sum, sheet) => sum + getStock(summaryData, sheet.key),
            0,
          );
          return (
            <Card
              key={category}
              className={`border ${categoryColors[category]} p-5`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-secondaryText text-sm mb-1">{category}</p>
                  <p className="text-2xl font-bold text-primaryText">
                    {isLoading ? (
                      <span className="h-8 w-24 bg-primaryBg/50 rounded animate-pulse block" />
                    ) : (
                      totalStock.toLocaleString()
                    )}
                  </p>
                  <p className="text-xs text-secondaryText mt-1">Total Stock</p>
                </div>
                <div className="p-2 rounded-lg bg-primaryBg/50">
                  {categoryIcons[category]}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="px-6 pt-6 pb-4 border-b border-cardBorder">
              <h2 className="text-base font-semibold text-primaryText">
                All Stocks
              </h2>
              <p className="text-sm text-secondaryText mt-1">
                Ringkasan semua inventory
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {SHEETS.slice(1).map((sheet) => {
                  const stock = getStock(summaryData, sheet.key);
                  const summaryItem = summaryData.find(
                    (s) => s.name.toLowerCase() === sheet.key.toLowerCase(),
                  );
                  return (
                    <Link
                      key={sheet.key}
                      href={sheetToUrl[sheet.key] || "/susu"}
                      className="group flex items-center justify-between p-4 rounded-xl border border-cardBorder hover:border-mainColor/50 hover:bg-mainColor/5 transition-all duration-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-primaryText group-hover:text-mainColor transition-colors">
                          {sheet.label}
                        </p>
                        <p className="text-xs text-secondaryText mt-0.5">
                          {sheet.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        {isLoading ? (
                          <div className="h-5 w-16 bg-mainColor/10 rounded animate-pulse" />
                        ) : (
                          <>
                            <p className="text-lg font-bold text-primaryText">
                              {stock.toLocaleString()}
                            </p>
                            {summaryItem && (
                              <p className="text-xs text-green-500/70">
                                +{summaryItem.totalIn.toLocaleString()} in
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <div className="px-6 pt-6 pb-4 border-b border-cardBorder">
              <h2 className="text-base font-semibold text-primaryText">
                Quick Actions
              </h2>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {SHEETS.slice(1, 5).map((sheet) => (
                <Link
                  key={sheet.key}
                  href={sheetToUrl[sheet.key] || "/susu"}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-mainColor/5 border border-transparent hover:border-cardBorder transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-mainColor/10 flex items-center justify-center">
                    <DropletIcon className="w-4 h-4 text-mainColor" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primaryText">
                      {sheet.label}
                    </p>
                    <p className="text-xs text-secondaryText">{sheet.unit}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <div className="px-6 pt-6 pb-4 border-b border-cardBorder">
              <h2 className="text-base font-semibold text-primaryText">
                Stock Details
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {summaryData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-primaryText capitalize">
                      {item.name}
                    </p>
                    <p className="text-xs text-secondaryText">
                      In: {item.totalIn.toLocaleString()} | Out:{" "}
                      {item.totalOut.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-mainColor">
                    {item.currentStock.toLocaleString()}
                  </p>
                </div>
              ))}
              {isLoading && (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 bg-primaryBg/50 rounded animate-pulse"
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
