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
import { GOOGLE_SCRIPT_URL } from "@/lib/data";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: Record<string, unknown>;
  sheetKey: string;
  onSuccess: () => void;
}

export const DeleteDialog = ({
  open,
  onOpenChange,
  row,
  sheetKey,
  onSuccess,
}: DeleteDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          sheet: sheetKey,
          row: row.row,
        }),
      });
      onSuccess();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Hapus Data</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-primaryText">
            Apakah Anda yakin ingin menghapus data ini?
          </p>
          <div className="mt-3 p-3 bg-primaryBg rounded-lg border border-inputBorder">
            <div className="text-sm space-y-1">
              <p>
                <span className="text-secondaryText">No: </span>
                <span className="font-mono font-medium">
                  {String(row.row ?? "-")}
                </span>
              </p>
              {!!row.Tgl && (
                <p>
                  <span className="text-secondaryText">Tanggal: </span>
                  <span>{String(row.Tgl)}</span>
                </p>
              )}
              {row.Net !== undefined && (
                <p>
                  <span className="text-secondaryText">Stock: </span>
                  <span className="font-medium">{String(row.Net)}</span>
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isSubmitting ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
