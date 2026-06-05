"use client";

import {
  CheckCircle2,
  ClipboardList,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import { useFormatter } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/common/shadcn/button";
import { Card, CardContent } from "@/components/common/shadcn/card";
import { Input } from "@/components/common/shadcn/input";
import { type CupPOKey, useActivePO } from "@/context/ActivePOContext";
import { SHEETS, useLatestSheetStocksMap } from "@/lib/data";

export const PurchaseOrderView = () => {
  const format = useFormatter();
  const { stockMap, isLoading, isError } = useLatestSheetStocksMap();
  const { setCupPO } = useActivePO();
  const [region, setRegion] = useState("");
  const [poFromManagement, setPoFromManagement] = useState<
    Record<CupPOKey, string>
  >({
    "cup 130 ml": "",
    "cup 175 ml": "",
  });

  const cupSheets = useMemo(
    () =>
      SHEETS.filter(
        (s): s is typeof s & { key: CupPOKey } =>
          s.key === "cup 130 ml" || s.key === "cup 175 ml",
      ),
    [],
  );

  const poItems = useMemo(() => {
    return cupSheets.map((sheet) => {
      const currentStock = stockMap[sheet.key] ?? 0;
      const mgmtPO = Number(poFromManagement[sheet.key]) || 0;
      return { ...sheet, currentStock, mgmtPO };
    });
  }, [stockMap, cupSheets, poFromManagement]);

  const handlePoChange = (key: CupPOKey, value: string) =>
    setPoFromManagement((prev) => ({
      ...prev,
      [key]: value.replace(/[^0-9]/g, ""),
    }));

  const handleApplyPO = () => {
    const itemsWithQty = poItems.filter((i) => i.mgmtPO > 0);
    if (itemsWithQty.length === 0) {
      toast.error("Isi jumlah PO dulu", {
        description:
          "Masukkan jumlah pesanan untuk Cup 130 ml atau Cup 175 ml.",
      });
      return;
    }

    const regionLabel = region.trim() || undefined;
    itemsWithQty.forEach((item) => {
      setCupPO(item.key, {
        quantity: item.mgmtPO,
        region: regionLabel,
      });
    });

    const label = itemsWithQty.map((i) => i.label).join(" & ");
    toast.success(
      <span>
        PO <span className="font-bold">{label}</span> ditambahkan
      </span>,
      {
        description: regionLabel
          ? `Target: ${regionLabel} — ${itemsWithQty[0].mgmtPO.toLocaleString("id-ID")} pcs`
          : `${itemsWithQty[0].mgmtPO.toLocaleString("id-ID")} pcs — lihat di halaman ${label}`,
      },
    );
    setRegion("");
    setPoFromManagement({ "cup 130 ml": "", "cup 175 ml": "" });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primaryText flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-mainColor" />
            Purchase Planning
          </h2>
          <p className="text-secondaryText text-sm mt-1">
            Input PO dari management. Angka ditampilkan di halaman Cup dan tetap
            ada setelah refresh tab (session browser, bukan spreadsheet).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondaryText" />
            <Input
              placeholder="Nama Daerah (opsional)..."
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="pl-10 w-[200px] lg:w-[240px] h-11 border-2 bg-primaryBg border-mainBorder"
            />
          </div>
          <Button
            onClick={handleApplyPO}
            className="gap-2 font-bold h-11 px-6 bg-mainColor hover:bg-mainColor/90 text-black"
          >
            <CheckCircle2 className="w-4 h-4" />
            Tampilkan di Halaman Cup
          </Button>
        </div>
      </div>

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
              <div className="bg-mainColor/10 rounded-lg px-3 py-3 text-center">
                <p className="text-[10px] text-mainColor uppercase font-bold">
                  PO ke Halaman Cup
                </p>
                <p className="text-xl font-black text-mainColor">
                  {item.mgmtPO > 0 ? format.number(item.mgmtPO) : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                <th className="px-6 py-3 bg-mainColor/5">PO dari Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mainBorder">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-secondaryText italic"
                  >
                    Loading...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-secondaryText"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-red-500 font-semibold text-sm">
                        Gagal memuat data stok
                      </span>
                      <span className="text-xs">
                        Coba refresh halaman atau periksa koneksi.
                      </span>
                    </div>
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
                        value={poFromManagement[item.key] ?? ""}
                        placeholder="Contoh: 22200"
                        onChange={(e) =>
                          handlePoChange(item.key, e.target.value)
                        }
                        className="h-10 text-base font-bold bg-white dark:bg-primaryBg border-mainColor/30 focus:border-mainColor w-full"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
