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
import formatRupiah from "@/lib/format-harga"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OpItem {
    id_op: number
    dpb_id: number
    nodpb: string
    id_barang: number
    nama_barang: string
    qty: number
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
    return (
        <Dialog>
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}
