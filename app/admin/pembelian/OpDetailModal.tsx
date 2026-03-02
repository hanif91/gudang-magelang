"use client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
import formatRupiah from "@/lib/format-harga"
import { Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import AxiosClient from "@/lib/AxiosClient"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { mutate } from "swr"

interface OpItem {
    id_op: number
    dpb_id: number
    nodpb: string
    id_barang: number
    nama_barang: string
    qty: number
    qty_proses: number
    status: number
    harga_beli: number
    subtotal: number
    nama_supplier: string | null
    nama_user: string
    satuan_barang: string
    minimal_stok_barang: number
    harga_jual_barang: string
    foto_barang: string
    nama_jenis: string
    nama_kategori: string
    nama_merek: string
}

interface OpDetailModalProps {
    items: OpItem[]
    noOp: string
}

export default function OpDetailModal({ items, noOp }: OpDetailModalProps) {
    const { toast } = useToast()
    const [openDelete, setOpenDelete] = useState<number | null>(null)
    const [openDialog, setOpenDialog] = useState(false)
    const [isPending, setIsPending] = useState(false)

    useEffect(() => {
        if (!openDialog) {
            setOpenDelete(null)
        }
    }, [openDialog])

    const deleteItemAction = async (idOp: number) => {
        setIsPending(true)
        try {
            console.log('Deleting item with id:', idOp)
            const response = await AxiosClient.post('/api/gudang/pembelian-item/delete-op', {
                id: idOp
            })
            console.log('Delete response:', response.data)
            
            if (response.data.success) {
                toast({
                    variant: "default",
                    description: "Item berhasil dihapus!",
                })
                
                setOpenDelete(null)
                
                mutate('/api/gudang/dpb/by-no-op')
            } else {
                toast({
                    variant: "destructive",
                    description: response.data.message || "Gagal menghapus item",
                })
                setOpenDelete(null)
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                description: error.response?.data?.message || "Terjadi kesalahan saat menghapus item",
            })
            setOpenDelete(null)
        } finally {
            setIsPending(false)
        }
    }

    const handleDeleteItem = async () => {
        if (openDelete !== null) {
            console.log('handleDeleteItem called with:', openDelete)
            await deleteItemAction(openDelete)
        } else {
            console.log('openDelete is null')
        }
    }

    return (
        <>
            <Dialog 
                open={openDialog} 
                onOpenChange={(open) => {
                    if (openDelete === null) {
                        setOpenDialog(open)
                    }
                }}
            >
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detail Pembelian - {noOp}</DialogTitle>
                        <DialogDescription>
                            Daftar barang dalam pesanan pembelian ini.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No DPB</TableHead>
                                    <TableHead>Barang</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Satuan</TableHead>
                                    <TableHead>Harga Beli</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium whitespace-nowrap">{item.nodpb}</TableCell>
                                        <TableCell>{item.nama_barang}</TableCell>
                                        <TableCell>{item.qty}</TableCell>
                                        <TableCell>{item.satuan_barang}</TableCell>
                                        <TableCell>{formatRupiah(item.harga_beli)}</TableCell>
                                        <TableCell>{formatRupiah(item.subtotal)}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setOpenDelete(item.id_op)}
                                                disabled={item.status !== 0}
                                                className="h-8 w-8"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog 
                open={openDelete !== null} 
                onOpenChange={(open) => {
                    if (!open) {
                        setOpenDelete(null)
                    }
                }}
            >
                <AlertDialogContent onClose={() => setOpenDelete(null)}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Yakin ingin menghapus item ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak bisa dibatalkan. Item akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel 
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setOpenDelete(null)
                            }}
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async (e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                console.log('Delete button clicked')
                                if (openDelete !== null) {
                                    await deleteItemAction(openDelete)
                                }
                            }}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {isPending ? "Menghapus..." : "Hapus"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
