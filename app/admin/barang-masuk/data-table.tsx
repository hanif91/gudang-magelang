"use client"

import { useState, useMemo } from "react"
import {
  ColumnDef,
  SortingState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTablePagination } from "@/components/datatable-pagination"
import { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
  mutate?: () => void
  dateRange?: DateRange | undefined
  onDateRangeChange?: (dateRange: DateRange | undefined) => void
  selectedSupplier?: string
  onSupplierChange?: (supplier: string) => void
}

// Custom filter function untuk search no_pembelian dan no_voucher
const customFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const searchValue = filterValue.toLowerCase()
  const noPembelian = String(row.original.no_pembelian || "").toLowerCase()
  const noVoucher = String(row.original.no_voucher || "").toLowerCase()
  return noPembelian.includes(searchValue) || noVoucher.includes(searchValue)
}

export function DataTable<TData, TValue>({
  columns,
  data,
  mutate,
  dateRange,
  onDateRangeChange,
  selectedSupplier = "all",
  onSupplierChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  })
  const [globalFilter, setGlobalFilter] = useState("")

  // Filter data berdasarkan supplier dan date range (client-side)
  const filteredData = useMemo(() => {
    let filtered = data

    // Filter by supplier (text search)
    if (selectedSupplier && selectedSupplier !== "all" && selectedSupplier.trim() !== "") {
      const supplierSearch = selectedSupplier.toLowerCase().trim()
      filtered = filtered.filter((item: any) => {
        const itemSupplier = String(item.supplier || "").toLowerCase()
        return itemSupplier.includes(supplierSearch)
      })
    }

    // Filter by date range
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((item: any) => {
        const itemDate = new Date(item.tanggal)
        const fromDate = new Date(dateRange.from!)
        const toDate = new Date(dateRange.to!)
        fromDate.setHours(0, 0, 0, 0)
        toDate.setHours(23, 59, 59, 999)
        itemDate.setHours(0, 0, 0, 0)
        return itemDate >= fromDate && itemDate <= toDate
      })
    }

    return filtered
  }, [data, selectedSupplier, dateRange])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: customFilterFn,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    meta: {
      mutate: mutate
    },
    state: {
      sorting,
      pagination,
      globalFilter,
    },
  })

  return (
    <div>
      {/* Filter Section */}
      <div className="flex flex-col gap-4 px-1 pb-3 pt-3 border-b">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Supplier</Label>
            <Input
              placeholder="Cari Supplier"
              value={selectedSupplier === "all" ? "" : selectedSupplier}
              onChange={(e) => onSupplierChange?.(e.target.value || "all")}
              className="w-full sm:w-[200px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Tanggal</Label>
            <DatePickerWithRange
              initialDateRange={dateRange}
              onDateChange={onDateRangeChange}
              placeholder="Pilih Range Tanggal"
              buttonClassName="w-full sm:w-[250px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Search (No. Pembelian / No. Voucher)</Label>
            <Input
              placeholder="Cari No. Pembelian atau No. Voucher"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full sm:w-[350px]"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-start items-center gap-2 px-1 pb-1 pt-3 overflow-auto">
        <div className="flex items-center gap-2 text-sm">
          <p>Show</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[75px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="bottom">
              {[10, 25, 50, 100, "All"].map((pageSize) => {
                const pageSizeNumber =
                  pageSize == "All" ? table.getTotalSize() : pageSize

                return (
                  <SelectItem key={pageSizeNumber} value={`${pageSizeNumber}`}>
                    {pageSize}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <p>entries</p>
        </div>
      </div>
      <div className="rounded-md border mt-2 mb-3">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}