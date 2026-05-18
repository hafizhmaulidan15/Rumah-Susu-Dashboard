"use client";

import {
  CheckCheck,
  CheckCircle2,
  ClipboardList,
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

interface POItem {
  key: string;
  label: string;
  needed: number;
  actual: number;
  spare: number;
  unit: string;
  settled: boolean;
}

interface POHistoryItem {
  id: string;
  date: string;
  region: string;
  status: "active" | "settled";
  settledAt?: string;
  items: POItem[];
  totalNeeded: number;
}

const STORAGE_KEY = "rsi_po_history_v2";

function saveHistory(history: POHistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  // Backward compat for RSIInventoryView (only active, non-settled items)
  localStorage.setItem(
    "rsi_po_history",
    JSON.stringify(
      history
        .filter((po) => po.status === "active")
        .map((po) => ({
          ...po,
          items: po.items
            .filter((i) => !i.settled)
            .map((i) => ({
              key: i.key,
              label: i.label,
              needed: i.needed,
              unit: i.unit,
            })),
        })),
    ),
  );
}

export const PurchaseOrderView = () => {
  const format = useFormatter();
  const { stockMap, isLoading } = useLatestSheetStocksMap();
  const [region, setRegion] = useState("");
  const [history, setHistory] = useState<POHistoryItem[]>([]);
  const [showSettled, setShowSettled] = useState(false);
  const [poFromManagement, setPoFromManagement] = useState<
    Record<string, string>
  >({
    "cup 130 ml": "",
    "cup 175 ml": "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const cupSheets = useMemo(
    () =>
      SHEETS.filter((s) => s.key === "cup 130 ml" || s.key === "cup 175 ml"),
    [],
  );

  // Spare dari PO aktif terakhir per item
  const lastSpareMap = useMemo(() => {
    const map: Record<string, number> = {};
    cupSheets.forEach((s) => {
      for (const po of history) {
        if (po.status !== "active") continue;
        const item = po.items.find((i) => i.key === s.key && !i.settled);
        if (item) {
          map[s.key] = item.spare ?? 0;
          break;
        }
      }
    });
    return map;
  }, [history, cupSheets]);

  const poItems = useMemo(() => {
    return cupSheets.map((sheet) => {
      const currentStock = stockMap[sheet.key] ?? 0;
      const mgmtPO = Number(poFromManagement[sheet.key]) || 0;
      const lastSpare = lastSpareMap[sheet.key] ?? 0;
      const netNeeded = Math.max(0, mgmtPO - lastSpare);
      const newSpare = mgmtPO > 0 ? Math.max(0, mgmtPO - netNeeded) : 0;
      return { ...sheet, currentStock, mgmtPO, lastSpare, netNeeded, newSpare };
    });
  }, [stockMap, cupSheets, poFromManagement, lastSpareMap]);

  const activePOs = useMemo(
    () => history.filter((p) => p.status === "active"),
    [history],
  );
  const settledPOs = useMemo(
    () => history.filter((p) => p.status === "settled"),
    [history],
  );

  const handlePoChange = (key: string, value: string) =>
    setPoFromManagement((prev) => ({
      ...prev,
      [key]: value.replace(/[^0-9]/g, ""),
    }));

  const handleSavePO = () => {
    if (!region.trim()) {
      alert("⚠️ Nama Daerah harus diisi!");
      return;
    }
    if (poItems.every((i) => i.mgmtPO === 0)) {
      alert("⚠️ Masukkan jumlah PO dari management.");
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
      status: "active",
      items: poItems
        .filter((i) => i.mgmtPO > 0)
        .map((i) => ({
          key: i.key,
          label: i.label,
          needed: i.netNeeded,
          actual: i.mgmtPO,
          spare: i.newSpare,
          unit: i.unit,
          settled: false,
        })),
      totalNeeded: poItems.reduce((a, i) => a + i.netNeeded, 0),
    };
    const updated = [newPO, ...history];
    setHistory(updated);
    saveHistory(updated);
    alert(`✅ PO untuk "${region}" berhasil disimpan!`);
    setRegion("");
    setPoFromManagement({ "cup 130 ml": "", "cup 175 ml": "" });
  };

  // Lunasi satu item dalam PO
  const handleSettleItem = (poId: string, itemKey: string) => {
    const updated = history.map((po) => {
      if (po.id !== poId) return po;
      const newItems = po.items.map((i) =>
        i.key === itemKey ? { ...i, settled: true } : i,
      );
      const allSettled = newItems.every((i) => i.settled);
      return {
        ...po,
        items: newItems,
        status: allSettled ? ("settled" as const) : ("active" as const),
        settledAt: allSettled ? new Date().toLocaleString("id-ID") : undefined,
      };
    });
    setHistory(updated);
    saveHistory(updated);
  };

  // Lunasi semua item dalam PO
  const handleSettleAll = (poId: string) => {
    if (!confirm("Tandai semua item PO ini sebagai LUNAS?")) return;
    const updated = history.map((po) => {
      if (po.id !== poId) return po;
      return {
        ...po,
        items: po.items.map((i) => ({ ...i, settled: true })),
        status: "settled" as const,
        settledAt: new Date().toLocaleString("id-ID"),
      };
    });
    setHistory(updated);
    saveHistory(updated);
  };

  const handleDelete = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    saveHistory(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primaryText flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-mainColor" />
            Purchase Planning
          </h2>
          <p className="text-secondaryText text-sm mt-1">
            Input PO dari management. Spare order sebelumnya diperhitungkan
            otomatis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
            <Input
              placeholder="Nama Daerah..."
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="pl-10 w-[200px] lg:w-[240px] h-11 border-2 bg-primaryBg border-mainBorder"
            />
          </div>
          <Button
            onClick={handleSavePO}
            className="gap-2 font-bold h-11 px-6 bg-mainColor hover:bg-mainColor/90 text-black"
          >
            <CheckCircle2 className="w-4 h-4" />
            Simpan PO
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {poItems.map((item) => (
          <Card
            key={item.key}
            className="border-mainBorder shadow-sm overflow-hidden"
          >
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-primaryText">{item.label}</p>
                <p className="text-xs text-secondaryText">
                  Stock: {format.number(item.currentStock)} Pcs
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-primaryBg/60 rounded-lg px-2 py-2">
                  <p className="text-[10px] text-secondaryText uppercase font-bold">
                    PO Mgmt
                  </p>
                  <p className="text-base font-black text-primaryText">
                    {item.mgmtPO > 0 ? format.number(item.mgmtPO) : "-"}
                  </p>
                </div>
                <div className="bg-amber-500/10 rounded-lg px-2 py-2">
                  <p className="text-[10px] text-amber-500 uppercase font-bold">
                    Spare Lalu
                  </p>
                  <p className="text-base font-black text-amber-500">
                    {item.lastSpare > 0
                      ? `-${format.number(item.lastSpare)}`
                      : "0"}
                  </p>
                </div>
                <div className="bg-mainColor/10 rounded-lg px-2 py-2">
                  <p className="text-[10px] text-mainColor uppercase font-bold">
                    Net Order
                  </p>
                  <p className="text-base font-black text-mainColor">
                    {format.number(item.netNeeded)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Input Table */}
      <Card className="shadow-sm border-mainBorder overflow-hidden">
        <div className="px-6 py-4 border-b border-mainBorder bg-primaryBg/50 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-mainColor" />
          <h3 className="font-bold text-primaryText">
            Input PO dari Management
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-tableHeaderBg text-secondaryText uppercase text-[10px] font-bold tracking-widest border-b border-mainBorder">
              <tr>
                <th className="px-6 py-3">Item</th>
                <th className="px-6 py-3">Stock Saat Ini</th>
                <th className="px-6 py-3">Spare Lalu</th>
                <th className="px-6 py-3 bg-mainColor/5">PO dari Management</th>
                <th className="px-6 py-3 text-right">Net Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mainBorder">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-secondaryText italic"
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
                    <td className="px-6 py-4">
                      {item.lastSpare > 0 ? (
                        <span className="text-amber-500 font-bold">
                          {format.number(item.lastSpare)} Pcs
                        </span>
                      ) : (
                        <span className="text-secondaryText">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 bg-mainColor/5">
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={poFromManagement[item.key] ?? ""}
                        placeholder="Contoh: 22200"
                        onChange={(e) =>
                          handlePoChange(item.key, e.target.value)
                        }
                        className="h-10 text-base font-bold bg-white dark:bg-primaryBg border-mainColor/30 focus:border-mainColor w-full"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-base font-black text-mainColor">
                        {format.number(item.netNeeded)} Pcs
                      </p>
                      {item.mgmtPO > 0 && item.newSpare > 0 && (
                        <p className="text-[10px] text-amber-500">
                          Spare baru: +{format.number(item.newSpare)}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Active POs */}
      {activePOs.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <History className="w-5 h-5 text-mainColor" />
            <h3 className="font-bold text-primaryText">
              PO Aktif ({activePOs.length})
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {activePOs.map((po) => (
              <Card key={po.id} className="border-mainColor/20 shadow-sm">
                <CardContent className="pt-4 pb-4">
                  {/* PO Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-mainColor" />
                      <p className="font-black text-primaryText uppercase text-sm">
                        {po.region}
                      </p>
                      <span className="text-[10px] text-secondaryText">
                        {po.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSettleAll(po.id)}
                        className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Lunasi Semua
                      </Button>
                      <button
                        onClick={() => handleDelete(po.id)}
                        className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-all text-secondaryText"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-2">
                    {po.items.map((item) => (
                      <div
                        key={item.key}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${
                          item.settled
                            ? "border-green-500/30 bg-green-500/5 opacity-60"
                            : "border-mainBorder bg-primaryBg/40"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-primaryText flex items-center gap-2">
                            {item.settled && (
                              <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                            )}
                            {item.label}
                          </p>
                          <p className="text-xs text-secondaryText">
                            Net: {format.number(item.needed)} Pcs
                            {item.spare > 0 &&
                              ` · Spare: +${format.number(item.spare)}`}
                          </p>
                        </div>
                        {item.settled ? (
                          <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                            ✓ Lunas
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSettleItem(po.id, item.key)}
                            className="h-8 px-3 text-xs border-green-500/50 text-green-600 hover:bg-green-500/10 gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Lunasi
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Settled POs */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setShowSettled((v) => !v)}
          className="flex items-center gap-2 px-1 text-secondaryText hover:text-primaryText transition-colors"
        >
          <CheckCheck className="w-4 h-4 text-green-500" />
          <span className="font-bold text-sm">
            Riwayat PO Selesai ({settledPOs.length})
          </span>
          <span className="text-xs">
            {showSettled ? "▲ Sembunyikan" : "▼ Tampilkan"}
          </span>
        </button>

        {showSettled && settledPOs.length === 0 && (
          <p className="text-sm text-secondaryText italic px-2">
            Belum ada PO yang selesai.
          </p>
        )}

        {showSettled &&
          settledPOs.map((po) => (
            <Card
              key={po.id}
              className="border-green-500/20 bg-green-500/3 shadow-sm opacity-80"
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-green-500" />
                    <p className="font-black text-primaryText uppercase text-sm">
                      {po.region}
                    </p>
                    <span className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">
                      SELESAI
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-secondaryText">
                      {po.settledAt}
                    </span>
                    <button
                      onClick={() => handleDelete(po.id)}
                      className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-all text-secondaryText"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {po.items.map((item) => (
                    <div
                      key={item.key}
                      className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full font-medium"
                    >
                      {item.label}: {format.number(item.needed)} Pcs ✓
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};
