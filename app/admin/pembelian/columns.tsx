"use client"
import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import moment from "moment"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import formatRupiah from "@/lib/format-harga"
import OpDetailModal from "./OpDetailModal"

export const columns: ColumnDef<any>[] = [
    {
        id: "index",
        header: "No",
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: "no_op",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    No OP
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "tanggal",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tanggal OP
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("tanggal");
            return date ? moment(date).format("DD MMMM YYYY") : "-";
        },
    },
    {
        accessorKey: "total_qty",
        header: "Total Qty",
        cell: ({ row }) => {
            return <div className="text-center">{row.getValue("total_qty")}</div>
        }
    },
    {
        accessorKey: "total_harga",
        header: "Total Harga",
        cell: ({ row }) => {
            return formatRupiah(row.getValue("total_harga"))
        }
    },
    {
        id: "detail",
        header: "Items",
        cell: ({ row }) => {
            const data = row.original
            return <OpDetailModal items={data.items || []} noOp={data.no_op} />
        }
    },
    // {
    //     id: "actions",
    //     enableHiding: false,
    //     cell: ({ row }) => {
    //         const data = row.original

    //         return (
    //             <DropdownMenu>
    //                 <DropdownMenuTrigger asChild>
    //                     <Button variant="ghost" className="h-8 w-8 p-0">
    //                         <span className="sr-only">Open menu</span>
    //                         <MoreHorizontal className="h-4 w-4" />
    //                     </Button>
    //                 </DropdownMenuTrigger>
    //                 <DropdownMenuContent align="end">
    //                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //                     <DropdownMenuSeparator />
    //                     {/* <DropdownMenuItem
    //                         onClick={() => navigator.clipboard.writeText(JSON.stringify(data))}
    //                     >
    //                         Copy Data
    //                     </DropdownMenuItem> */}
    //                     {/* <Link href={`/admin/pembelian/edit/${data.no_op}`}>
    //                          <DropdownMenuItem>Edit</DropdownMenuItem>
    //                     </Link> */}
    //                 </DropdownMenuContent>
    //             </DropdownMenu>
    //         )
    //     },
    // },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const data = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href={`/admin/pembelian/edit/${encodeURIComponent(data.no_op)}`}>
                             <DropdownMenuItem>Edit</DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
