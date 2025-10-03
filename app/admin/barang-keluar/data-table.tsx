import { useEffect, useState } from "react"
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
  ColumnFiltersState,
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
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react"
import { Combobox } from "@/components/ui/combobox"
import { DatePickerWithRange } from "@/components/ui/date-picker"
import { DateRange } from "react-day-picker"
import useSWR, { mutate } from "swr"
import axios from "axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/router"

interface JenisBarang {
  id: number,
  nama: string
}

interface JenisAsset {
  id: number,
  nama: string
}

interface DataTableProps<TData, TValue> {
  data: TData[],
  columns: ColumnDef<TData, TValue>[]
  jenis_barang: JenisBarang[]
  jenis_asset: JenisAsset[]
}

const fetcher = (url: string) => axios.get(url).then(res => res.data.data) // Akses `res.data.data`
const tanggal = {
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
}

export function DataTable<TData extends { tanggal: string }, TValue>({
  data,
  columns,
  jenis_barang,
  jenis_asset
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  // const router = useRouter();

  // useEffect(() => {
  //   window.history.pushState(null, "", `?fromTanggal=${dateRange.from}&toTanggal=${dateRange.to}`)
  // }, [dateRange]);


  const handleDateChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
    }
  };


  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      columnFilters,
      sorting,
      pagination,
      globalFilter,
    },
  });

  const jenisBarangOptions = [
    { label: "Semua", value: "" },
    ...(jenis_barang?.map((item) => ({
      label: item.nama,
      value: item.nama,
    })) || []),
  ];

  const jenisAssetOptions = [
    { label: "Semua", value: "" },
    ...(jenis_asset?.map((item) => ({
      label: item.nama,
      value: item.nama,
    })) || []),
  ];

  const handleReset = () => {
    table.getColumn("nama_jenis_bk")?.setFilterValue("")
    table.getColumn("nama_asset_perpipaan")?.setFilterValue("")
    table.getColumn("kodekeper")?.setFilterValue("")
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-2 px-1 pb-1 pt-3 overflow-auto">
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
        <div className="sm:ml-auto flex items-center gap-2">
          <Button onClick={() => setOpenFilter(!openFilter)} variant={"secondary"}>{openFilter ? <ArrowDownNarrowWide /> : <ArrowUpNarrowWide />}</Button>
          <div className="flex items-center text-sm">
            <Input
              placeholder="Search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="ml-2 w-full sm:w-64"
            />
          </div>
        </div>
      </div>
      <div className={` ${!openFilter && "hidden"} w-full flex flex-row justify-between gap-4 pt-5 pb-2`}>
        {/* <DatePickerWithRange
          initialDateRange={dateRange}
          onDateChange={handleDateChange}
        /> */}
        <Combobox
          options={jenisBarangOptions}
          value={(table.getColumn("nama_jenis_bk")?.getFilterValue() as string) ?? ""}
          onChange={(value) => table.getColumn("nama_jenis_bk")?.setFilterValue(value)}
          placeholder="Filter Jenis Barang Keluar"
        />
        <Combobox
          options={jenisAssetOptions}
          value={(table.getColumn("nama_asset_perpipaan")?.getFilterValue() as string) ?? ""}
          onChange={(value) => table.getColumn("nama_asset_perpipaan")?.setFilterValue(value)}
          placeholder="Filter Asset"
        />
        <Combobox
          options={[
            { label: "Semua", value: "" },
            { label: "Sudah Diverifikasi", value: "sudah" },
            { label: "Belum Diverifikasi", value: "Belum Diverifikasi" },
          ]}
          value={(table.getColumn("kodekeper")?.getFilterValue() as string) ?? ""}
          onChange={(value) => table.getColumn("kodekeper")?.setFilterValue(value)}
          placeholder="Filter Verifikasi"
        />
        <Button type="button" onClick={handleReset} variant={"secondary"}>Reset Filter</Button>
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