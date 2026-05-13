"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Download,
  Edit,
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import * as XLSX from "xlsx";

import { ArrowDownIcon } from "@/assets/icons/ArrowDownIcon";
import { ArrowUpIcon } from "@/assets/icons/ArrowUpIcon";
import { AddDialog } from "@/components/common/dialogs/AddDialog";
import { DeleteDialog } from "@/components/common/dialogs/DeleteDialog";
import { EditDialog } from "@/components/common/dialogs/EditDialog";
import { Button } from "@/components/common/shadcn/button";
import { Card, CardContent } from "@/components/common/shadcn/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/common/shadcn/pagination";
import { useSheetData } from "@/lib/data";

export interface InventoryRow {
  row: number;
  Tgl: string;
  In: number;
  Out: number;
  Net: number;
  Keterangan: string;
  "Request By": string;
  "No. SJ": string;
  [key: string]: number | string;
}

interface RSIInventoryViewProps {
  sheetKey: string;
  sheetLabel: string;
  sheetUnit: string;
}

const SortingArrow = ({ isSorted }: { isSorted: false | "asc" | "desc" }) => {
  if (!isSorted)
    return <div className="inline-flex w-4 h-4 ml-1 flex-shrink-0" />;
  return (
    <div className="inline-flex w-4 h-4 text-mainColor ml-1 flex-shrink-0">
      {isSorted === "desc" ? (
        <ArrowDownIcon width={16} height={16} />
      ) : (
        <ArrowUpIcon width={16} height={16} />
      )}
    </div>
  );
};

export const RSIInventoryView = ({
  sheetKey,
  sheetLabel,
  sheetUnit,
}: RSIInventoryViewProps) => {
  const { data, isLoading, mutate } = useSheetData(sheetKey);
  const [editRow, setEditRow] = useState<InventoryRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<InventoryRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "row", desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const t = useTranslations("pagination");

  const handleExportXLSX = useCallback(() => {
    if (!data || !Array.isArray(data) || !data.length) return;
    const exportRows = data.map((r: Record<string, unknown>, idx: number) => ({
      No: r.row != null ? Number(r.row) : idx + 1,
      Tanggal: r.Tgl ? String(r.Tgl) : "",
      Masuk: Number(r.In ?? 0),
      Keluar: Number(r.Out ?? 0),
      Stock: Number(r.Net ?? 0),
      Keterangan: String(r.Keterangan ?? "-"),
      "Request By": String(r["Request By"] ?? "-"),
      "No. SJ": String(r["No. SJ"] ?? "-"),
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 14 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetLabel);
    XLSX.writeFile(
      workbook,
      `RSI-${sheetLabel.replace(/ /g, "-")}-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  }, [data, sheetLabel]);

  const handleExportPDF = useCallback(async () => {
    if (!data || !Array.isArray(data) || !data.length) return;
    setIsExporting(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { InventoryPDF } =
        await import("@/components/common/pdf/InventoryPDF");
      const exportDate = new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const exportRows: InventoryRow[] = data.map(
        (r: Record<string, unknown>, idx: number): InventoryRow => ({
          row: r.row != null ? Number(r.row) : idx + 1,
          Tgl: String(r.Tgl ?? ""),
          In: Number(r.In ?? 0),
          Out: Number(r.Out ?? 0),
          Net: Number(r.Net ?? 0),
          Keterangan: String(r.Keterangan ?? ""),
          "Request By": String(r["Request By"] ?? "-"),
          "No. SJ": String(r["No. SJ"] ?? "-"),
        }),
      );
      const blob = await pdf(
        <InventoryPDF
          data={{
            rows: exportRows,
            sheetLabel,
            sheetUnit,
            exportDate,
          }}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `RSI-${sheetLabel.replace(/ /g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, [data, sheetLabel, sheetUnit]);

  const columns: ColumnDef<InventoryRow>[] = [
    {
      accessorKey: "row",
      header: "No",
      sortingFn: "basic",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.row}</span>
      ),
    },
    {
      accessorKey: "Tgl",
      header: "Tanggal",
      cell: ({ row }) => {
        const val = row.getValue<string>("Tgl");
        if (!val) return <span className="text-secondaryText">-</span>;
        try {
          const date = new Date(val);
          return (
            <span className="text-primaryText">
              {date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        } catch {
          return <span className="text-primaryText">{val}</span>;
        }
      },
    },
    {
      accessorKey: "In",
      header: "Masuk",
      cell: ({ row }) => {
        const val = row.original.In;
        if (!val && val !== 0)
          return <span className="text-secondaryText">-</span>;
        return (
          <span className="font-medium text-green-500">
            {Number(val).toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "Out",
      header: "Keluar",
      cell: ({ row }) => {
        const val = row.original.Out;
        if (!val && val !== 0)
          return <span className="text-secondaryText">-</span>;
        return (
          <span className="font-medium text-red-500">
            {Number(val).toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "Net",
      header: "Stock",
      cell: ({ row }) => {
        const val = row.original.Net;
        if (val === undefined || val === null)
          return <span className="text-secondaryText">-</span>;
        return (
          <span className="font-bold text-primaryText">
            {Number(val).toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "Keterangan",
      header: "Keterangan",
      cell: ({ row }) => (
        <span className="text-primaryText text-sm">
          {row.original.Keterangan || "-"}
        </span>
      ),
    },
    {
      accessorKey: "Request By",
      header: "Request By",
      cell: ({ row }) => (
        <span className="text-primaryText text-sm">
          {String(row.original["Request By"] || "-")}
        </span>
      ),
    },
    {
      accessorKey: "No. SJ",
      header: "No. SJ",
      cell: ({ row }) => (
        <span className="text-primaryText text-sm font-mono">
          {String(row.original["No. SJ"] || "-")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-mainColor"
            onClick={() => setEditRow(row.original)}
            aria-label="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-red-500"
            onClick={() => setDeleteRow(row.original)}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  const rawData: InventoryRow[] = Array.isArray(data)
    ? data.map((r: Record<string, unknown>, idx: number): InventoryRow => {
        const rowNum = r.row != null ? Number(r.row) : idx + 1;
        return {
          row: rowNum,
          Tgl: String(r.Tgl ?? ""),
          In: Number(r.In ?? 0),
          Out: Number(r.Out ?? 0),
          Net: Number(r.Net ?? 0),
          Keterangan: String(r.Keterangan ?? ""),
          "Request By": String(r["Request By"] ?? "-"),
          "No. SJ": String(r["No. SJ"] ?? "-"),
        };
      })
    : [];

  const filteredData = searchQuery
    ? rawData.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    : rawData;

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-primaryText">
            {sheetLabel}
          </h2>
          <p className="text-sm text-secondaryText mt-1">Unit: {sheetUnit}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportXLSX}
            className="gap-2"
            title="Export ke Excel"
            disabled={!data || !Array.isArray(data) || !data.length}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export XLSX
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="gap-2"
            title="Export ke PDF"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Memuat..." : "Export PDF"}
          </Button>
          <Button
            onClick={() => setAddOpen(true)}
            className="gap-2 bg-mainColor hover:bg-mainColor/90 text-black"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondaryText" />
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-primaryBg border border-inputBorder rounded-lg text-primaryText placeholder:text-secondaryText focus:outline-none focus:ring-1 focus:ring-mainColor w-64"
            />
          </div>
          <div className="text-sm text-secondaryText">
            {filteredData.length} data
          </div>
        </div>

        <CardContent className="px-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-mainColor border-t-transparent" />
                <span className="text-secondaryText text-sm">
                  Memuat data...
                </span>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-secondaryText">
              {searchQuery ? "Tidak ada hasil pencarian" : "Tidak ada data"}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table
                  className="w-full min-w-[800px]"
                  style={{ tableLayout: "fixed" }}
                >
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header, index) => (
                          <th
                            key={header.id}
                            scope="col"
                            className={`text-secondaryText font-medium text-left text-sm px-4 py-3 whitespace-nowrap border-t border-b border-inputBorder bg-tableHeaderBg ${
                              index === 0 ? "border-l" : ""
                            } ${
                              index === headerGroup.headers.length - 1
                                ? "border-r"
                                : ""
                            } ${
                              header.column.getCanSort()
                                ? "cursor-pointer select-none hover:bg-tableHeaderBgHover"
                                : ""
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <div className="flex items-center">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              <SortingArrow
                                isSorted={header.column.getIsSorted()}
                              />
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-tableRowBgHover">
                        {row.getVisibleCells().map((cell, cellIndex) => (
                          <td
                            key={cell.id}
                            className={`px-4 py-3 text-primaryText text-sm border-b border-mainBorder ${
                              cellIndex === 0 ? "border-l" : ""
                            } ${
                              cellIndex === row.getVisibleCells().length - 1
                                ? "border-r"
                                : ""
                            }`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between max-sm:flex-col max-sm:items-center max-sm:gap-6 px-4 mt-6">
                <div className="text-sm text-secondaryText whitespace-nowrap">
                  {t("showing")}{" "}
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}{" "}
                  {t("to")}{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    filteredData.length,
                  )}{" "}
                  {t("of")} {filteredData.length} {t("results")}
                </div>
                <Pagination className="m-0 justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        label={t("previous")}
                      />
                    </PaginationItem>
                    {Array.from(
                      { length: table.getPageCount() },
                      (_, i) => i,
                    ).map((pageIndex) => {
                      const currentPage = table.getState().pagination.pageIndex;
                      const totalPages = table.getPageCount();
                      if (
                        pageIndex === 0 ||
                        pageIndex === totalPages - 1 ||
                        (pageIndex >= currentPage - 1 &&
                          pageIndex <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={pageIndex}>
                            <PaginationLink
                              onClick={() => table.setPageIndex(pageIndex)}
                              isActive={pageIndex === currentPage}
                            >
                              {pageIndex + 1}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        pageIndex === currentPage - 2 ||
                        pageIndex === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={pageIndex}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        label={t("next")}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {editRow && (
        <EditDialog
          open={!!editRow}
          onOpenChange={(open) => !open && setEditRow(null)}
          row={editRow}
          sheetKey={sheetKey}
          onSuccess={() => {
            setEditRow(null);
            mutate();
          }}
        />
      )}

      {deleteRow && (
        <DeleteDialog
          open={!!deleteRow}
          onOpenChange={(open) => !open && setDeleteRow(null)}
          row={deleteRow}
          sheetKey={sheetKey}
          onSuccess={() => {
            setDeleteRow(null);
            mutate();
          }}
        />
      )}

      {addOpen && (
        <AddDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          sheetKey={sheetKey}
          sheetLabel={sheetLabel}
          sheetUnit={sheetUnit}
          onSuccess={() => {
            setAddOpen(false);
            mutate();
          }}
        />
      )}
    </div>
  );
};
