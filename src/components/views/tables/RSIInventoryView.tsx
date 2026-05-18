"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Edit,
  History,
  MapPin,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

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

// Extend PO type with status
interface POHistoryItem {
  id: string;
  date: string;
  region: string;
  items: {
    key: string;
    label: string;
    needed: number;
    unit: string;
    settled?: boolean;
  }[];
  totalNeeded: number;
  status?: "active" | "settled";
}

export const RSIInventoryView = ({
  sheetKey,
  sheetLabel,
  sheetUnit,
}: RSIInventoryViewProps) => {
  const format = useFormatter();
  const displayUnit = sheetKey.startsWith("cup") ? "cp" : sheetUnit;
  const { data, isLoading, mutate } = useSheetData(sheetKey);
  const [poHistory, setPoHistory] = useState<POHistoryItem[]>([]);

  // Load PO history — only active POs with unsettled items for this sheet
  useEffect(() => {
    const loadPO = () => {
      const saved = localStorage.getItem("rsi_po_history");
      if (saved) {
        try {
          const allPO: POHistoryItem[] = JSON.parse(saved);
          const relevant = allPO.filter(
            (po) =>
              po.status !== "settled" &&
              po.items.some(
                (item) => item.key === sheetKey || item.label === sheetLabel,
              ),
          );
          setPoHistory(relevant);
        } catch (e) {
          console.error("Failed to load PO history", e);
        }
      }
    };
    loadPO();
    // Sync across tabs/windows
    window.addEventListener("storage", loadPO);
    return () => window.removeEventListener("storage", loadPO);
  }, [sheetKey, sheetLabel]);

  // Settle a PO (mark as settled and remove from active list)
  const settlePO = (id: string) => {
    const saved = localStorage.getItem("rsi_po_history");
    if (!saved) return;
    try {
      const allPO: POHistoryItem[] = JSON.parse(saved);
      const updated = allPO.map((po) =>
        po.id === id ? { ...po, status: "settled" } : po,
      );
      localStorage.setItem("rsi_po_history", JSON.stringify(updated));
      // Trigger storage event manually for same tab
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "rsi_po_history",
          newValue: JSON.stringify(updated),
        }),
      );
      setPoHistory((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error("Failed to settle PO", e);
    }
  };

  const [editRow, setEditRow] = useState<InventoryRow | null>(null);

  const [deleteRow, setDeleteRow] = useState<InventoryRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "rowNum", desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations("pagination");

  const columns: ColumnDef<InventoryRow>[] = [
    {
      id: "rowNum",
      accessorFn: (originalRow) => originalRow.row,
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
              {format.dateTime(date, {
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
            {format.number(Number(val))}
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
            {format.number(Number(val))}
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
            {format.number(Number(val))}
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

  const rawData: InventoryRow[] = useMemo(
    () =>
      Array.isArray(data)
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
        : [],
    [data],
  );

  // Latest stock = Net of last row in rawData (sorted by row asc)
  const currentStock = useMemo(() => {
    if (rawData.length === 0) return 0;
    const sorted = [...rawData].sort((a, b) => a.row - b.row);
    return sorted[sorted.length - 1].Net ?? 0;
  }, [rawData]);

  // For EditDialog: find the Net of the row immediately before the edited row
  const getPrevStock = (editedRow: InventoryRow): number => {
    const sorted = [...rawData].sort((a, b) => a.row - b.row);
    const idx = sorted.findIndex((r) => r.row === editedRow.row);
    if (idx <= 0) return 0;
    return sorted[idx - 1].Net ?? 0;
  };

  const filteredData = useMemo(
    () =>
      searchQuery
        ? rawData.filter((row) =>
            Object.values(row).some((val) =>
              String(val).toLowerCase().includes(searchQuery.toLowerCase()),
            ),
          )
        : rawData,
    [rawData, searchQuery],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* PO HISTORY AT THE TOP FOR BETTER VISIBILITY */}
      {(sheetKey === "cup 130 ml" || sheetKey === "cup 175 ml") &&
        poHistory.length > 0 && (
          <div className="flex flex-col gap-4 mb-2">
            <div className="flex items-center gap-2 px-1">
              <History className="w-5 h-5 text-mainColor" />
              <h3 className="font-bold text-primaryText">
                Riwayat Perencanaan PO ({sheetLabel})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {poHistory.map((po: POHistoryItem) => {
                const itemInPO = po.items.find(
                  (i) => i.key === sheetKey || i.label === sheetLabel,
                );
                return (
                  <Card
                    key={po.id}
                    className="border-mainColor/20 bg-mainColor/5 shadow-sm"
                  >
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-mainColor" />
                          <span className="text-xs font-bold text-primaryText uppercase">
                            {po.region}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-secondaryText font-medium">
                            {po.date}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => settlePO(po.id)}
                          >
                            Lunasi
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-secondaryText uppercase font-bold tracking-wider">
                            Jumlah Pesanan
                          </p>
                          <p className="text-xl font-black text-mainColor">
                            +{format.number(itemInPO?.needed || 0)}{" "}
                            <span className="text-xs font-normal text-secondaryText">
                              {displayUnit}
                            </span>
                          </p>
                        </div>
                        <ShoppingCart className="w-8 h-8 text-mainColor/20" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-secondaryText font-medium">
            Unit: {displayUnit}
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="gap-2 bg-mainColor hover:bg-mainColor/90 text-black"
        >
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
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
          prevStock={getPrevStock(editRow)}
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
          currentStock={currentStock}
          onSuccess={() => {
            setAddOpen(false);
            mutate();
          }}
        />
      )}
    </div>
  );
};
