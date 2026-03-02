"use client"
import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DatePickerWithRange } from "@/components/ui/date-picker"
import { DateRange } from "react-day-picker"
import { Label } from "@/components/ui/label"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
    const [statusFilter, setStatusFilter] = React.useState<string>("all")
    const [statusVcFilter, setStatusVcFilter] = React.useState<string>("all")
    const [ppnFilter, setPpnFilter] = React.useState<string>("all")

    // Filter data berdasarkan tanggal, status, status VC, dan PPN (client-side)
    const filteredData = React.useMemo(() => {
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

        // Filter by status
        if (statusFilter && statusFilter !== "all") {
            filtered = filtered.filter((item: any) => item.status.toString() === statusFilter)
        }

        // Filter by status VC
        if (statusVcFilter && statusVcFilter !== "all") {
            filtered = filtered.filter((item: any) => item.flagvoucher?.toString() === statusVcFilter)
        }

        // Filter by PPN
        if (ppnFilter && ppnFilter !== "all") {
            filtered = filtered.filter((item: any) => {
                const isppn = item.isppn
                const isoverwriteppn = item.isoverwriteppn
                if (ppnFilter === "0") return isppn === 0
                if (ppnFilter === "1_0") return isppn === 1 && isoverwriteppn === 0
                if (ppnFilter === "1_1") return isppn === 1 && isoverwriteppn === 1
                return true
            })
        }

        return filtered
    }, [data, dateRange, statusFilter, statusVcFilter, ppnFilter])

    const table = useReactTable({
        data: filteredData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full">
            {/* Filter Section */}
            <div className="flex flex-col gap-4 px-1 pb-3 pt-3 border-b">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm">Tanggal OP</Label>
                        <DatePickerWithRange
                            initialDateRange={dateRange}
                            onDateChange={setDateRange}
                            placeholder="Pilih Range Tanggal"
                            buttonClassName="w-full sm:w-[250px]"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="0">Belum proses</SelectItem>
                                <SelectItem value="1">Sudah proses sebagian</SelectItem>
                                <SelectItem value="2">Sudah proses</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm">Status VC</Label>
                        <Select value={statusVcFilter} onValueChange={setStatusVcFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Semua Status VC" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status VC</SelectItem>
                                <SelectItem value="1">Ya</SelectItem>
                                <SelectItem value="0">Tidak</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm">PPN</Label>
                        <Select value={ppnFilter} onValueChange={setPpnFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Semua PPN" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua PPN</SelectItem>
                                <SelectItem value="0">Tidak ada PPN</SelectItem>
                                <SelectItem value="1_0">Harga excl. PPN</SelectItem>
                                <SelectItem value="1_1">Harga incl. PPN</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2 justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setDateRange(undefined)
                                setStatusFilter("all")
                                setStatusVcFilter("all")
                                setPpnFilter("all")
                                table.getColumn("no_op")?.setFilterValue("")
                            }}
                            className="w-full sm:w-auto"
                        >
                            Reset Filter
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter No OP..."
                    value={(table.getColumn("no_op")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("no_op")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
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
                                        <TableCell key={cell.id}>
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
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
