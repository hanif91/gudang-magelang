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
import { DatePickerWithRange } from "@/components/ui/date-picker"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [globalFilter, setGlobalFilter] = useState("")
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

    // Filter data berdasarkan tanggal (client-side)
    const filteredData = useMemo(() => {
        let filtered = data

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
    }, [data, dateRange])

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
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
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <DatePickerWithRange
                        initialDateRange={dateRange}
                        onDateChange={setDateRange}
                        placeholder="Pilih Range Tanggal"
                        buttonClassName="w-full sm:w-[250px]"
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            setDateRange(undefined)
                            setGlobalFilter("")
                        }}
                        className="w-full sm:w-auto"
                    >
                        Reset Filter
                    </Button>
                    <div className="sm:ml-auto">
                        <Link href="/admin/retur-barang/create">
                            <Button variant="default" className="w-full sm:w-auto">
                                <Plus className="w-4 h-4 mr-1" /> Create
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

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
                <div className="sm:ml-auto flex items-center text-sm">
                    <p>Search</p>
                    <Input
                        placeholder=""
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="ml-2 w-full sm:w-64"
                    />
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
