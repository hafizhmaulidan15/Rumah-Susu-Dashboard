"use client";

import { useEffect, useState } from "react";

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

interface AddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheetKey: string;
  sheetLabel: string;
  sheetUnit: string;
  currentStock: number;
  onSuccess: () => void;
}

const TIPE_OPTIONS = [
  { value: "masuk", label: "📦 Masuk (In)", dir: "in" },
  { value: "keluar", label: "🚚 Keluar (Out)", dir: "out" },
];

export const AddDialog = ({
  open,
  onOpenChange,
  sheetKey,
  sheetLabel,
  sheetUnit,
  currentStock,
  onSuccess,
}: AddDialogProps) => {
  const displayUnit = sheetKey.startsWith("cup") ? "cp" : sheetUnit;
  const [tipe, setTipe] = useState<"masuk" | "keluar">("masuk");
  const [formData, setFormData] = useState<Record<string, string>>({
    Tgl: "",
    Jumlah: "",
    Keterangan: "",
    "Request By": "",
    "No. SJ": "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTipe("masuk");
    setFormData({
      Tgl: new Date().toISOString().slice(0, 16),
      Jumlah: "",
      Keterangan: "",
      "Request By": "",
      "No. SJ": "",
    });
  }, [open]);

  // Auto-calculate projected stock
  const jumlah = Number(formData.Jumlah) || 0;
  const projectedStock =
    tipe === "masuk" ? currentStock + jumlah : currentStock - jumlah;

  // Reset jumlah when type changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, Jumlah: "" }));
  }, [tipe]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const inVal = tipe === "masuk" ? jumlah : 0;
      const outVal = tipe === "keluar" ? jumlah : 0;

      const payload: Record<string, unknown> = {
        action: "add",
        sheet: sheetKey,
        date: new Date(formData.Tgl).toISOString(),
        in: inVal,
        out: outVal,
        net: projectedStock,
        keterangan: formData.Keterangan || "-",
        requestBy: formData["Request By"] || "-",
        no_sj: formData["No. SJ"] || "-",
      };

      const response = await fetch("/api/gsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || result?.success === false || result?.error) {
        throw new Error(result?.error || "Gagal menyimpan data");
      }

      setFormData({
        Tgl: new Date().toISOString().slice(0, 16),
        Jumlah: "",
        Keterangan: "",
        "Request By": "",
        "No. SJ": "",
      });
      setTipe("masuk");
      invalidateRelatedCaches(sheetKey);
      onSuccess();
    } catch (err) {
      console.error("Add failed:", err);
      alert("Gagal menambahkan data. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = !!formData.Tgl && jumlah > 0;
  const isNegativeStock = projectedStock < 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah {sheetLabel}</DialogTitle>
          <p className="text-sm text-secondaryText">Unit: {displayUnit}</p>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
          {/* Tipe Transaksi dropdown */}
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
            <Label htmlFor="add-tgl" className="text-primaryText">
              Tanggal
            </Label>
            <Input
              id="add-tgl"
              type="datetime-local"
              value={formData.Tgl}
              onChange={(e) => handleChange("Tgl", e.target.value)}
            />
          </div>

          {/* Jumlah */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="add-jumlah" className="text-primaryText">
              Jumlah{" "}
              <span
                className={`text-xs font-bold ml-1 ${tipe === "masuk" ? "text-green-500" : "text-red-500"}`}
              >
                ({tipe === "masuk" ? "+ Masuk" : "− Keluar"})
              </span>
            </Label>
            <Input
              id="add-jumlah"
              type="number"
              min="0"
              value={formData.Jumlah}
              onChange={(e) => handleChange("Jumlah", e.target.value)}
              placeholder="0"
              className={jumlah > 0 ? "border-mainColor/50" : ""}
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
                Stock Sekarang
              </p>
              <p className="text-lg font-black text-primaryText">
                {currentStock.toLocaleString("id-ID")}{" "}
                <span className="text-xs font-normal">{displayUnit}</span>
              </p>
            </div>
            <div className="text-2xl font-black">→</div>
            <div className="text-right">
              <p className="text-xs text-secondaryText font-medium">
                Stock Setelah
              </p>
              <p
                className={`text-lg font-black ${isNegativeStock ? "text-red-500" : "text-mainColor"}`}
              >
                {projectedStock.toLocaleString("id-ID")}{" "}
                <span className="text-xs font-normal">{displayUnit}</span>
              </p>
            </div>
          </div>
          {isNegativeStock && (
            <p className="text-xs text-red-500 font-medium -mt-2">
              ⚠️ Stock akan minus! Pastikan jumlah keluar tidak melebihi stock
              saat ini.
            </p>
          )}

          {/* Keterangan */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="add-ket" className="text-primaryText">
              Keterangan
            </Label>
            <Input
              id="add-ket"
              type="text"
              value={formData.Keterangan}
              onChange={(e) => handleChange("Keterangan", e.target.value)}
              placeholder="-"
            />
          </div>

          {/* Request By */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="add-reqby" className="text-primaryText">
              Request By
            </Label>
            <Input
              id="add-reqby"
              type="text"
              value={formData["Request By"]}
              onChange={(e) => handleChange("Request By", e.target.value)}
              placeholder="-"
            />
          </div>

          {/* No. SJ */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="add-sj" className="text-primaryText">
              No. SJ
            </Label>
            <Input
              id="add-sj"
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
