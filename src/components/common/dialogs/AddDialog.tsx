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

interface AddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheetKey: string;
  sheetLabel: string;
  sheetUnit: string;
  onSuccess: () => void;
}

const ADD_FIELDS = [
  { key: "Tgl", label: "Tanggal", type: "datetime-local", required: true },
  {
    key: "In",
    label: "Masuk (In)",
    type: "number",
    required: false,
    placeholder: "0",
  },
  {
    key: "Out",
    label: "Keluar (Out)",
    type: "number",
    required: false,
    placeholder: "0",
  },
  { key: "Net", label: "Stock", type: "number", required: true },
  {
    key: "Keterangan",
    label: "Keterangan",
    type: "text",
    required: false,
    placeholder: "-",
  },
  {
    key: "Request By",
    label: "Request By",
    type: "text",
    required: false,
    placeholder: "-",
  },
  {
    key: "No. SJ",
    label: "No. SJ",
    type: "text",
    required: false,
    placeholder: "-",
  },
];

export const AddDialog = ({
  open,
  onOpenChange,
  sheetKey,
  sheetLabel,
  sheetUnit,
  onSuccess,
}: AddDialogProps) => {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const now = new Date();
    return {
      Tgl: now.toISOString().slice(0, 16),
      In: "",
      Out: "",
      Net: "",
      Keterangan: "",
      "Request By": "",
      "No. SJ": "",
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        action: "add",
        sheet: sheetKey,
        Tgl: new Date(formData.Tgl).toISOString(),
        In: formData.In === "" ? 0 : Number(formData.In),
        Out: formData.Out === "" ? 0 : Number(formData.Out),
        Net: Number(formData.Net),
        Keterangan: formData.Keterangan || "-",
        "Request By": formData["Request By"] || "-",
        "No. SJ": formData["No. SJ"] || "-",
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
        In: "",
        Out: "",
        Net: "",
        Keterangan: "",
        "Request By": "",
        "No. SJ": "",
      });
      invalidateRelatedCaches(sheetKey);
      onSuccess();
    } catch (err) {
      console.error("Add failed:", err);
      alert("Gagal menambahkan data. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid =
    !!formData.Tgl && formData.Net !== undefined && formData.Net !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah {sheetLabel}</DialogTitle>
          <p className="text-sm text-secondaryText">Unit: {sheetUnit}</p>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {ADD_FIELDS.map(({ key, label, type, placeholder }) => (
            <div key={key} className="flex flex-col gap-2">
              <Label htmlFor={key} className="text-primaryText">
                {label}
              </Label>
              <Input
                id={key}
                type={type}
                value={formData[key] ?? ""}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
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
