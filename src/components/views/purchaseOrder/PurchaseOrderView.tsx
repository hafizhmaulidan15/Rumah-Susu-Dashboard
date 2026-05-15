"use client";

import {
  CheckCircle2,
  History,
  MapPin,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useFormatter } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/common/shadcn/button";
import { Card, CardContent } from "@/components/common/shadcn/card";
import { Input } from "@/components/common/shadcn/input";
import { SHEETS, useLatestSheetStocksMap } from "@/lib/data";

interface POHistoryItem {
  id: string;
  date: string;
  region: string;
  items: {
    label: string;
    needed: number;
    unit: string;
  }[];
  totalNeeded: number;
}

export const PurchaseOrderView = () => {
  const format = useFormatter();
  const { stockMap, isLoading } = useLatestSheetStocksMap();
  const [region, setRegion] = useState("");
  const [history, setHistory] = useState<POHistoryItem[]>([]);
  // Use 'quantities' instead of 'targets' to store manual order amounts
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "cup 130 ml": 0,
    "cup 175 ml": 0,
  });

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("rsi_po_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load PO history", e);
      }
    }
  }, []);

  const cupSheets = useMemo(() => {
    return SHEETS.filter(
      (s) => s.key === "cup 130 ml" || s.key === "cup 175 ml",
    );
  }, []);

  const poItems = useMemo(() => {
    return cupSheets.map((sheet) => {
      const currentStock = stockMap[sheet.key] ?? 0;
      const orderQty = quantities[sheet.key] ?? 0;

      return {
        ...sheet,
        currentStock,
        orderQty,
        status: orderQty > 0 ? "To Order" : "No Order",
      };
    });
  }, [stockMap, cupSheets, quantities]);

  const handleQtyChange = (key: string, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    const num = parseInt(cleanValue) || 0;
    setQuantities((prev) => ({ ...prev, [key]: num }));
  };

  const totalToOrder = poItems.reduce((acc, item) => acc + item.orderQty, 0);

  const handleGeneratePO = () => {
    if (!region.trim()) {
      alert("⚠️ Nama Daerah harus diisi!");
      return;
    }

    if (totalToOrder <= 0) {
      alert("⚠️ Masukkan jumlah cup yang ingin dipesan terlebih dahulu.");
      return;
    }

    const newPO: POHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      region: region.trim(),
      items: poItems
        .filter((i) => i.orderQty > 0)
        .map((i) => ({
          key: i.key, // Save the sheet key
          label: i.label,
          needed: i.orderQty,
          unit: i.unit,
        })),
      totalNeeded: totalToOrder,
    };

    const updatedHistory = [newPO, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("rsi_po_history", JSON.stringify(updatedHistory));

    alert(`✅ PO untuk daerah "${region}" berhasil disimpan!`);

    // Clear inputs
    setRegion("");
    setQuantities({
      "cup 130 ml": 0,
      "cup 175 ml": 0,
    });
  };

  const deleteHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("rsi_po_history", JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col gap-6">
      <style jsx global>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primaryText flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-mainColor" />
            Purchase Planning
          </h2>
          <p className="text-secondaryText text-sm mt-1">
            Input langsung jumlah cup yang ingin dipesan per daerah.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
            <Input
              placeholder="Ketik Nama Daerah..."
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={`pl-10 w-[200px] lg:w-[300px] h-11 border-2 bg-primaryBg transition-all ${
                !region && totalToOrder > 0
                  ? "border-amber-500/50 animate-pulse"
                  : "border-mainBorder"
              }`}
            />
          </div>
          <Button
            className={`gap-2 font-bold h-11 px-6 shadow-lg transition-all ${
              totalToOrder > 0 && region
                ? "bg-mainColor hover:bg-mainColor/90 text-black scale-105"
                : "bg-mainBorder text-secondaryText opacity-70 grayscale cursor-not-allowed"
            }`}
            onClick={handleGeneratePO}
          >
            <CheckCircle2 className="w-4 h-4" />
            Simpan PO
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {poItems.map((item) => (
          <Card
            key={item.key}
            className={`${item.orderQty > 0 ? "border-mainColor/30 bg-mainColor/5" : "border-mainBorder bg-primaryBg/50"} shadow-sm overflow-hidden`}
          >
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${item.orderQty > 0 ? "bg-mainColor/10" : "bg-primaryBg"}`}
                  >
                    <ShoppingCart
                      className={`w-6 h-6 ${item.orderQty > 0 ? "text-mainColor" : "text-secondaryText"}`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primaryText">
                      {item.label}
                    </p>
                    <p className="text-2xl font-black mt-0.5">
                      {item.orderQty > 0
                        ? `+${format.number(item.orderQty)}`
                        : "0"}
                      <span className="text-xs font-normal text-secondaryText ml-1">
                        To Order
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-secondaryText">Stock saat ini:</p>
                  <p className="font-bold text-primaryText">
                    {format.number(item.currentStock)} Pcs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <Card className="shadow-sm border-mainBorder overflow-hidden">
            <div className="px-6 py-4 border-b border-mainBorder bg-primaryBg/50">
              <h3 className="font-bold text-primaryText">Input Pesanan</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-tableHeaderBg text-secondaryText uppercase text-[10px] font-bold tracking-widest border-b border-mainBorder">
                  <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Current Stock</th>
                    <th className="px-6 py-4 bg-mainColor/5">
                      Jumlah Pesanan (Pcs)
                    </th>
                    <th className="px-6 py-4 text-mainColor text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mainBorder">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-secondaryText italic"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : (
                    poItems.map((item) => (
                      <tr
                        key={item.key}
                        className="hover:bg-primaryBg/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-primaryText">
                          {item.label}
                        </td>
                        <td className="px-6 py-4 text-secondaryText">
                          {format.number(item.currentStock)} Pcs
                        </td>
                        <td className="px-6 py-4 bg-mainColor/5">
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={item.orderQty === 0 ? "" : item.orderQty}
                            placeholder="Masukkan jumlah..."
                            onChange={(e) =>
                              handleQtyChange(item.key, e.target.value)
                            }
                            className="h-10 text-base font-bold bg-white dark:bg-primaryBg border-mainColor/30 focus:border-mainColor w-full shadow-inner"
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              item.orderQty > 0
                                ? "bg-mainColor/10 text-mainColor"
                                : "bg-primaryBg text-secondaryText opacity-50"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="shadow-sm border-mainBorder h-full flex flex-col">
            <div className="px-6 py-4 border-b border-mainBorder bg-primaryBg/50 flex items-center justify-between">
              <h3 className="font-bold text-primaryText flex items-center gap-2">
                <History className="w-4 h-4 text-mainColor" />
                Daftar Riwayat PO
              </h3>
              <span className="text-[10px] font-bold bg-mainColor/10 text-mainColor px-2 py-0.5 rounded-full uppercase">
                {history.length} Record
              </span>
            </div>
            <CardContent className="p-0 flex-grow overflow-y-auto max-h-[600px]">
              {history.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <ShoppingCart className="w-12 h-12 text-mainBorder" />
                  <p className="text-secondaryText text-sm italic">
                    Belum ada PO.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-mainBorder">
                  {history.map((po) => (
                    <div
                      key={po.id}
                      className="p-5 hover:bg-primaryBg/30 transition-colors group relative"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-mainColor" />
                          <p className="font-black text-primaryText uppercase text-sm tracking-tight">
                            {po.region}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteHistory(po.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-all text-secondaryText"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2 mb-3">
                        {po.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-xs bg-primaryBg/40 px-3 py-2 rounded-lg"
                          >
                            <span className="text-secondaryText font-medium">
                              {item.label}
                            </span>
                            <span className="font-black text-mainColor">
                              +{format.number(item.needed)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-end border-t border-dashed border-mainBorder pt-3">
                        <p className="text-[9px] text-secondaryText font-bold uppercase">
                          {po.date}
                        </p>
                        <p className="text-sm font-black text-primaryText">
                          {format.number(po.totalNeeded)} Pcs
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
