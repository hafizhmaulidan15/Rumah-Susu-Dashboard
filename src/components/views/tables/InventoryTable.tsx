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
import { Edit, FileText, Plus, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import { ArrowDownIcon } from "@/assets/icons/ArrowDownIcon";
import { ArrowUpIcon } from "@/assets/icons/ArrowUpIcon";
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

export interface InventoryRow {
  id: string;
  [key: string]: string | number;
}

interface InventoryTableProps {
  data?: InventoryRow[];
  columns?: ColumnDef<InventoryRow>[];
  onEdit?: (row: InventoryRow) => void;
  onDelete?: (row: InventoryRow) => void;
  onAdd?: () => void;
  isLoading?: boolean;
  sheetName?: string;
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

const defaultColumns: ColumnDef<InventoryRow>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{String(row.getValue("id"))}</span>
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
          className="h-8 w-8"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Edit"
          onClick={() => row.original.id && console.log("Edit", row.original)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:text-red-500"
          aria-label="Delete"
          onClick={() => row.original.id && console.log("Delete", row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
    enableSorting: false,
  },
];

export const InventoryTable = ({
  data,
  columns,
  onEdit,
  onDelete,
  onAdd,
  isLoading,
  sheetName,
}: InventoryTableProps) => {
  const t = useTranslations("pagination");
  const tTables = useTranslations("tables.cardTitles");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState("");

  const cols = columns ?? defaultColumns;

  const filteredData =
    searchQuery && data
      ? data.filter((row) =>
          Object.values(row).some((val) =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        )
      : (data ?? []);

  const table = useReactTable({
    data: filteredData,
    columns: cols,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-mainColor border-t-transparent" />
            <span className="text-secondaryText text-sm">Memuat data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
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
        </div>
        {onAdd && (
          <Button
            onClick={onAdd}
            className="gap-2 bg-mainColor hover:bg-mainColor/90 text-black"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        )}
      </div>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table
            className="w-full min-w-[600px]"
            style={{ tableLayout: "fixed" }}
          >
            <caption className="sr-only">
              {sheetName ?? "Inventory"} table
            </caption>
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
                        <SortingArrow isSorted={header.column.getIsSorted()} />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={cols.length}
                    className="text-center py-12 text-secondaryText"
                  >
                    {searchQuery
                      ? "Tidak ada hasil pencarian"
                      : "Tidak ada data"}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-tableRowBgHover">
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <td
                        key={cell.id}
                        className={`px-4 py-3 text-primaryText text-sm border-b border-mainBorder ${cellIndex === 0 ? "border-l" : ""} ${
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          className="flex items-center justify-between max-sm:flex-col max-sm:items-center max-sm:gap-6 px-4"
          style={{ marginTop: "2rem" }}
        >
          <div className="text-sm text-secondaryText whitespace-nowrap max-sm:text-center">
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
          <Pagination className="m-0 justify-end max-sm:justify-center">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  label={t("previous")}
                />
              </PaginationItem>
              {Array.from({ length: table.getPageCount() }, (_, i) => i).map(
                (pageIndex) => {
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
                },
              )}
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
      </CardContent>
    </Card>
  );
};
