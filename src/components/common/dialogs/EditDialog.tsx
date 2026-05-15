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
  onSuccess: () => void;
}

const EDITABLE_FIELDS = [
  { key: "Tgl", label: "Tanggal", type: "datetime-local" },
  { key: "In", label: "Masuk", type: "number" },
  { key: "Out", label: "Keluar", type: "number" },
  { key: "Net", label: "Stock", type: "number" },
  { key: "Keterangan", label: "Keterangan", type: "text" },
  { key: "Request By", label: "Request By", type: "text" },
  { key: "No. SJ", label: "No. SJ", type: "text" },
];

export const EditDialog = ({
  open,
  onOpenChange,
  row,
  sheetKey,
  onSuccess,
}: EditDialogProps) => {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const result: Record<string, string> = {};
    EDITABLE_FIELDS.forEach(({ key, type }) => {
      const val = row[key];
      if (val === undefined || val === null) {
        result[key] = "";
      } else if (type === "datetime-local" && val instanceof Date) {
        result[key] = val.toISOString().slice(0, 16);
      } else if (type === "datetime-local" && typeof val === "string") {
        try {
          const d = new Date(val);
          result[key] = d.toISOString().slice(0, 16);
        } catch {
          result[key] = val;
        }
      } else {
        result[key] = String(val);
      }
    });
    return result;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isValid = !!formData.Tgl && formData.Net !== "";

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/gsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          sheet: sheetKey,
          row: row.row,
          Tgl: new Date(formData.Tgl).toISOString(),
          In: formData.In === "" ? 0 : Number(formData.In),
          Out: formData.Out === "" ? 0 : Number(formData.Out),
          Net: Number(formData.Net),
          Keterangan: formData.Keterangan || "-",
          "Request By": formData["Request By"] || "-",
          "No. SJ": formData["No. SJ"] || "-",
        }),
      });

      const result = await response.json();
      if (!response.ok || result?.success === false || result?.error) {
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
        <div className="flex flex-col gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {EDITABLE_FIELDS.map(({ key, label, type }) => (
            <div key={key} className="flex flex-col gap-2">
              <Label htmlFor={key} className="text-primaryText">
                {label}
              </Label>
              <Input
                id={key}
                type={type}
                value={formData[key] ?? ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          ))}
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
