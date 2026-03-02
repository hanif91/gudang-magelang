"use client"
import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react"
import moment from "moment"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import formatRupiah from "@/lib/format-harga"
import OpDetailModal from "./OpDetailModal"
import CetakAction from "./components/cetak-action"
import AxiosClient from "@/lib/AxiosClient"
import { useToast } from "@/hooks/use-toast"
import { useTransition, useState } from "react"
import { mutate } from "swr"
import { useRouter } from "next/navigation"

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
        accessorKey: "total_harga",
        header: "Total Harga",
        cell: ({ row }) => {
            return formatRupiah(row.getValue("total_harga"))
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as number;
            let text = "";
            let color = "";

            if (status === 0) {
                text = "Belum proses";
                color = "text-red-600";
            } else if (status === 1) {
                text = "Sudah proses sebagian";
                color = "text-yellow-600";
            } else if (status === 2) {
                text = "Sudah proses";
                color = "text-green-600";
            }

            return <div className={`text-center font-medium ${color}`}>{text}</div>;
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue === "") return true;
            const status = row.getValue(columnId) as number;
            return status.toString() === filterValue;
        },
    },
    {
        id: "status_vc",
        header: "Status VC",
        accessorFn: (row) => row.flagvoucher,
        cell: ({ row }) => {
            const data = row.original;
            const flagvoucher = data.flagvoucher;

            return (
                <div className="flex justify-center">
                    {flagvoucher === 1 ? (
                        <Check className="h-5 w-5 text-green-600" />
                    ) : (
                        <X className="h-5 w-5 text-red-600" />
                    )}
                </div>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue === "") return true;
            const flagvoucher = row.original.flagvoucher;
            return flagvoucher.toString() === filterValue;
        },
    },
    {
        id: "ppn",
        header: "PPN",
        accessorFn: (row) => {
            const isppn = row.isppn;
            const isoverwriteppn = row.isoverwriteppn;
            if (isppn === 0) return "0";
            if (isppn === 1 && isoverwriteppn === 0) return "1_0";
            if (isppn === 1 && isoverwriteppn === 1) return "1_1";
            return "";
        },
        cell: ({ row }) => {
            const data = row.original;
            const isppn = data.isppn;
            const isoverwriteppn = data.isoverwriteppn;

            let text = "";
            if (isppn === 0) {
                text = "Tidak ada PPN";
            } else if (isppn === 1 && isoverwriteppn === 0) {
                text = "Harga excl. PPN";
            } else if (isppn === 1 && isoverwriteppn === 1) {
                text = "Harga incl. PPN";
            }

            return (
                <div className="text-center text-sm" title={isppn === 0 ? "Tidak ada PPN" : isoverwriteppn === 0 ? "Harga tidak termasuk PPN" : "Harga termasuk PPN"}>
                    {text}
                </div>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue === "") return true;
            const isppn = row.original.isppn;
            const isoverwriteppn = row.original.isoverwriteppn;

            if (filterValue === "0") return isppn === 0;
            if (filterValue === "1_0") return isppn === 1 && isoverwriteppn === 0;
            if (filterValue === "1_1") return isppn === 1 && isoverwriteppn === 1;
            return true;
        },
    },
    {
        id: "detail",
        header: "Items",
        cell: ({ row }) => {
            const data = row.original
            return <ItemsCell data={data} />
        }
    },
]

function ItemsCell({ data }: { data: any }) {
    const { toast } = useToast()
    const [openDelete, setOpenDelete] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const deleteAction = async (noop: string) => {
        try {
            const response = await AxiosClient.post('/api/gudang/pembelian-item/delete-op', {
                noop: noop
            })

            if (response.data.success) {
                toast({
                    variant: "default",
                    description: "Data berhasil dihapus!",
                })
                mutate('/api/gudang/dpb/by-no-op')
                setOpenDelete(false)
                router.refresh()
            } else {
                toast({
                    variant: "destructive",
                    description: response.data.message || "Gagal menghapus data",
                })
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                description: error.response?.data?.message || "Terjadi kesalahan saat menghapus data",
            })
        }
    }

    const handleDelete = () => {
        startTransition(() => {
            deleteAction(data.no_op)
        })
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <OpDetailModal items={data.items || []} noOp={data.no_op} />
                <CetakAction data={data} />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild disabled={data.status === 1 || data.status === 2}>
                            <Link
                                href={`/admin/pembelian/edit/${encodeURIComponent(data.no_op)}`}
                                className={data.status === 1 || data.status === 2 ? "pointer-events-none opacity-50" : ""}
                            >
                                <Pencil className="h-4 w-4 mr-2" /> Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="focus:bg-destructive focus:text-white"
                            onClick={() => setOpenDelete(true)}
                            disabled={data.status === 1 || data.status === 2}
                        >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <AlertDialog open={openDelete} onOpenChange={(open) => {
                if (!open) {
                    setOpenDelete(false)
                }
            }}>
                <AlertDialogContent onClose={() => setOpenDelete(false)}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak bisa dibatalkan. Data Order Pembelian dengan No. {data.no_op} akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setOpenDelete(false)}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
