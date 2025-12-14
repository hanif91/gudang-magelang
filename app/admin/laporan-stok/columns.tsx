"use client"

import { ColumnDef } from "@tanstack/react-table"

export type LaporanStokItem = {
    id: string
    kategori: string
    jenis: string
    nama: string
    satuan: string
    qtyawal: number
    qtymasuk: number
    qtykeluar: number
    qtyakhir: number
}

export const columns: ColumnDef<LaporanStokItem>[] = [
    {
        accessorKey: "kategori",
        header: "Kategori",
    },
    {
        accessorKey: "jenis",
        header: "Jenis",
    },
    {
        accessorKey: "nama",
        header: "Nama Barang",
    },
    {
        accessorKey: "satuan",
        header: "Satuan",
    },
    {
        accessorKey: "qtyawal",
        header: "Qty Awal",
    },
    {
        accessorKey: "qtymasuk",
        header: "Qty Masuk",
    },
    {
        accessorKey: "qtykeluar",
        header: "Qty Keluar",
    },
    {
        accessorKey: "qtyakhir",
        header: "Qty Akhir",
    },
]
