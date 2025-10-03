import { CardTitle } from "@/components/ui/card";
import { TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Table } from "lucide-react";

interface Barang {
    id: number,
    nama_barang: string,
    satuan_barang: string,
    qty: number,
    nama_jenis: string,
    nama_kategori: string,
    nama_merek: string,
}
// app/components/DpbkTable.tsx (Server Component)
export default function DetailTable({ barang }: { barang: Barang[] }) {
    console.log(barang)
    return (
        <>
            <CardTitle className="text-left text-lg font-semibold">Daftar Barang</CardTitle>
            <Table>
                <TableCaption>Daftar semua informasi barang</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Merek</TableHead>
                        <TableHead>Satuan Barang</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {barang.map((barang, index: any) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium min-w-48 text-left">{barang.nama_barang}</TableCell>
                            <TableCell className="font-medium">{barang.qty}</TableCell>
                            <TableCell className="font-medium">{barang.nama_jenis}</TableCell>
                            <TableCell className="font-medium">{barang.nama_kategori}</TableCell>
                            <TableCell className="font-medium">{barang.nama_merek}</TableCell>
                            <TableCell className="font-medium">{barang.satuan_barang}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}
