import * as XLSX from "xlsx";

import type { InventoryRow } from "@/components/views/tables/RSIInventoryView";

export function exportToCSV(data: InventoryRow[], filename: string) {
  const headers = [
    "No",
    "Tanggal",
    "Masuk",
    "Keluar",
    "Stock",
    "Keterangan",
    "Request By",
    "No. SJ",
  ];
  const rows = data.map((row) => [
    row.row,
    row.Tgl,
    row.In ?? 0,
    row.Out ?? 0,
    row.Net ?? 0,
    row.Keterangan || "-",
    row["Request By"] || "-",
    row["No. SJ"] || "-",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((r) =>
      r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToExcel(data: InventoryRow[], filename: string) {
  const headers = [
    "No",
    "Tanggal",
    "Masuk",
    "Keluar",
    "Stock",
    "Keterangan",
    "Request By",
    "No. SJ",
  ];
  const rows = data.map((row) => [
    row.row,
    row.Tgl,
    row.In ?? 0,
    row.Out ?? 0,
    row.Net ?? 0,
    row.Keterangan || "-",
    row["Request By"] || "-",
    row["No. SJ"] || "-",
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
