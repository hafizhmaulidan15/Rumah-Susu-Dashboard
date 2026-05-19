"use client";

import { useState } from "react";

import { Button } from "@/components/common/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/common/shadcn/dialog";
import { Input } from "@/components/common/shadcn/input";
import { Label } from "@/components/common/shadcn/label";
import { invalidateRelatedCaches } from "@/lib/data";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: Record<string, unknown>;
  sheetKey: string;
  prevStock: number; // stock of the row BEFORE this one
  onSuccess: () => void;
}

const TIPE_OPTIONS = [
  { value: "masuk", label: "📦 Masuk (In)", dir: "in" },
  { value: "keluar", label: "🚚 Keluar (Out)", dir: "out" },
];

function parseDateLocal(val: unknown): string {
  if (!val) return "";
  if (val instanceof Date) return val.toISOString().slice(0, 16);
  if (typeof val === "string") {
    try {
      return new Date(val).toISOString().slice(0, 16);
    } catch {
      return val;
    }
  }
  return "";
}

export const EditDialog = ({
  open,
  onOpenChange,
  row,
  sheetKey,
  prevStock,
  onSuccess,
}: EditDialogProps) => {
  // Determine initial tipe from row
  const initIn = Number(row["In"]) || 0;
  const initOut = Number(row["Out"]) || 0;
  const initTipe: "masuk" | "keluar" = initOut > 0 ? "keluar" : "masuk";
  const initJumlah =
    initOut > 0 ? String(initOut) : initIn > 0 ? String(initIn) : "";

  const [tipe, setTipe] = useState<"masuk" | "keluar">(initTipe);
  const [formData, setFormData] = useState<Record<string, string>>({
    Tgl: parseDateLocal(row["Tgl"]),
    Jumlah: initJumlah,
    Keterangan: String(row["Keterangan"] ?? ""),
    "Request By": String(row["Request By"] ?? ""),
    "No. SJ": String(row["No. SJ"] ?? ""),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jumlah = Number(formData.Jumlah) || 0;
  const projectedStock =
    tipe === "masuk" ? prevStock + jumlah : prevStock - jumlah;
  const isNegativeStock = projectedStock < 0;

  const isValid = !!formData.Tgl && jumlah > 0;

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  function safeGet(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  function safeSet(key: string, val: string) {
    try {
      localStorage.setItem(key, val);
    } catch {
      /* noop */
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let apiKey = safeGet("rsi_admin_key");
      if (!apiKey) {
        apiKey = window.prompt("Masukkan PIN Admin untuk melakukan perubahan:");
        if (apiKey) safeSet("rsi_admin_key", apiKey);
        else {
          setIsSubmitting(false);
          return;
        }
      }

      const inVal = tipe === "masuk" ? jumlah : 0;
      const outVal = tipe === "keluar" ? jumlah : 0;

      const response = await fetch("/api/gsheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          action: "edit",
          sheet: sheetKey,
          row: row.row,
          date: new Date(formData.Tgl).toISOString(),
          in: inVal,
          out: outVal,
          net: projectedStock,
          keterangan: formData.Keterangan || "-",
          requestBy: formData["Request By"] || "-",
          no_sj: formData["No. SJ"] || "-",
        }),
      });

      const result = await response.json();
      if (!response.ok || result?.success === false || result?.error) {
        if (response.status === 401) {
          safeSet("rsi_admin_key", "");
          throw new Error("PIN Admin salah!");
        }
        throw new Error(result?.error || "Gagal mengupdate data");
      }

      invalidateRelatedCaches(sheetKey);
      onSuccess();
    } catch (err) {
      console.error("Edit failed:", err);
      alert("Gagal mengubah data. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Data</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
          {/* Tipe Transaksi */}
          <div className="flex flex-col gap-2">
            <Label className="text-primaryText font-semibold">
              Tipe Transaksi
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {TIPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTipe(opt.value as "masuk" | "keluar")}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    tipe === opt.value
                      ? opt.value === "masuk"
                        ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                        : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                      : "border-mainBorder bg-primaryBg text-secondaryText hover:border-mainColor/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tanggal */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-tgl" className="text-primaryText">
              Tanggal
            </Label>
            <Input
              id="edit-tgl"
              type="datetime-local"
              value={formData.Tgl}
              onChange={(e) => handleChange("Tgl", e.target.value)}
            />
          </div>

          {/* Jumlah */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-jumlah" className="text-primaryText">
              Jumlah{" "}
              <span
                className={`text-xs font-bold ml-1 ${tipe === "masuk" ? "text-green-500" : "text-red-500"}`}
              >
                ({tipe === "masuk" ? "+ Masuk" : "− Keluar"})
              </span>
            </Label>
            <Input
              id="edit-jumlah"
              type="number"
              min="0"
              value={formData.Jumlah}
              onChange={(e) => handleChange("Jumlah", e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Stock Preview */}
          <div
            className={`rounded-xl px-4 py-3 flex items-center justify-between border-2 transition-all ${
              isNegativeStock
                ? "border-red-500/50 bg-red-500/5"
                : "border-mainColor/30 bg-mainColor/5"
            }`}
          >
            <div>
              <p className="text-xs text-secondaryText font-medium">
                Stock Sebelumnya
              </p>
              <p className="text-lg font-black text-primaryText">
                {prevStock.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="text-2xl font-black">→</div>
            <div className="text-right">
              <p className="text-xs text-secondaryText font-medium">
                Stock Baris Ini
              </p>
              <p
                className={`text-lg font-black ${isNegativeStock ? "text-red-500" : "text-mainColor"}`}
              >
                {projectedStock.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          {isNegativeStock && (
            <p className="text-xs text-red-500 font-medium -mt-2">
              ⚠️ Stock akan minus!
            </p>
          )}

          {/* Keterangan */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-ket" className="text-primaryText">
              Keterangan
            </Label>
            <Input
              id="edit-ket"
              type="text"
              value={formData.Keterangan}
              onChange={(e) => handleChange("Keterangan", e.target.value)}
              placeholder="-"
            />
          </div>

          {/* Request By */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-reqby" className="text-primaryText">
              Request By
            </Label>
            <Input
              id="edit-reqby"
              type="text"
              value={formData["Request By"]}
              onChange={(e) => handleChange("Request By", e.target.value)}
              placeholder="-"
            />
          </div>

          {/* No. SJ */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-sj" className="text-primaryText">
              No. SJ
            </Label>
            <Input
              id="edit-sj"
              type="text"
              value={formData["No. SJ"]}
              onChange={(e) => handleChange("No. SJ", e.target.value)}
              placeholder="-"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isValid}
            className="bg-mainColor hover:bg-mainColor/90 text-black"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
