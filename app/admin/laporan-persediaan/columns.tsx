"use client"

import { ColumnDef } from "@tanstack/react-table"
import formatHarga from "@/lib/format-harga"

export type LaporanPersediaanItem = {
    id: string
    kategori: string
    jenis: string
    nama: string
    satuan: string
    harga: number
    qtyawal: number
    saldoawal: number
    qtymasuk: number
    saldomasuk: number
    qtykeluar: number
    saldokeluar: number
    qtyakhir: number
    saldoakhir: number
}

export const columns: ColumnDef<LaporanPersediaanItem>[] = [
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
        accessorKey: "harga",
        header: "Harga",
        cell: ({ row }) => formatHarga(row.getValue("harga")),
    },
    {
        accessorKey: "qtyawal",
        header: "Qty Awal",
    },
    {
        accessorKey: "saldoawal",
        header: "Saldo Awal",
        cell: ({ row }) => formatHarga(row.getValue("saldoawal")),
    },
    {
        accessorKey: "qtymasuk",
        header: "Qty Masuk",
    },
    {
        accessorKey: "saldomasuk",
        header: "Saldo Masuk",
        cell: ({ row }) => formatHarga(row.getValue("saldomasuk")),
    },
    {
        accessorKey: "qtykeluar",
        header: "Qty Keluar",
    },
    {
        accessorKey: "saldokeluar",
        header: "Saldo Keluar",
        cell: ({ row }) => formatHarga(row.getValue("saldokeluar")),
    },
    {
        accessorKey: "qtyakhir",
        header: "Qty Akhir",
    },
    {
        accessorKey: "saldoakhir",
        header: "Saldo Akhir",
        cell: ({ row }) => formatHarga(row.getValue("saldoakhir")),
    },
]
