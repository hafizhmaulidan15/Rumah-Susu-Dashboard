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
import { invalidateRelatedCaches } from "@/lib/data";

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

  const handleDelete = async () => {
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

      const response = await fetch("/api/gsheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          action: "delete",
          sheet: sheetKey,
          row: row.row,
        }),
      });

      const result = await response.json();
      if (!response.ok || result?.success === false || result?.error) {
        if (response.status === 401) {
          safeSet("rsi_admin_key", "");
          throw new Error("PIN Admin salah!");
        }
        throw new Error(result?.error || "Gagal menghapus data");
      }

      invalidateRelatedCaches(sheetKey);
      onSuccess();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Gagal menghapus data. Silakan coba lagi.");
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
