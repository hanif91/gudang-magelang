"use client"

import { useState } from "react"
import { NotebookTabs } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CardTitle } from "@/components/ui/card"
import CustomModal from "./custom-modal"

import { ReturBarang } from "./types"

export default function DetailActions({ data }: { data: ReturBarang }) {
    const [openDetail, setOpenDetail] = useState(false)

    const formatHarga = (harga: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(harga);
    };

    return (
        <>
            <Button onClick={() => setOpenDetail(true)} variant="ghost">
                <NotebookTabs className="h-4 w-4" />
            </Button>

            {/* Modal untuk Detail Retur Barang */}
            <CustomModal
                isOpen={openDetail}
                onClose={() => setOpenDetail(false)}
                title="Detail Retur Barang"
                description="Informasi lengkap tentang retur barang"
            >
                <div className="space-y-4">
                    {/* Informasi No OP, Tanggal, Supplier */}
                    <div className="flex">
                        <div className="text-left">
                            <p>No OP</p>
                            <p>Tanggal</p>
                            <p>Supplier</p>
                        </div>
                        <div className="ml-5 text-left">
                            <p>: {data.noop}</p>
                            <p>
                                :{" "}
                                {new Date(data.tanggal).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                            <p>: {data.items?.[0]?.nama_supplier || "-"}</p>
                        </div>
                    </div>

                    {/* Daftar Barang dengan Scroll */}
                    <div>
                        <CardTitle className="text-left text-lg font-semibold">Daftar Barang</CardTitle>

                        {/* Wrapper dengan Scroll */}
                        <div className="max-h-80 overflow-y-auto border rounded-md mt-2">
                            <Table>
                                <TableCaption>Daftar semua barang</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No</TableHead>
                                        <TableHead>Nama Barang</TableHead>
                                        <TableHead>Qty OP</TableHead>
                                        <TableHead>Qty Proses</TableHead>
                                        <TableHead>Sisa Qty</TableHead>
                                        <TableHead>Harga Beli</TableHead>
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="max-h-80 overflow-y-auto">
                                    {data.items?.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium text-left">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium min-w-45 text-left">
                                                {item.nama_barang}
                                            </TableCell>
                                            <TableCell className="font-medium">{item.qty_op}</TableCell>
                                            <TableCell className="font-medium">{item.qty_proses}</TableCell>
                                            <TableCell className="font-medium">{item.sisa_qty}</TableCell>
                                            <TableCell className="font-medium">{formatHarga(parseFloat(item.harga_beli))}</TableCell>
                                            <TableCell className="font-medium">{formatHarga(parseFloat(item.qty_op) * parseFloat(item.harga_beli))}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </CustomModal>
        </>
    )
}
