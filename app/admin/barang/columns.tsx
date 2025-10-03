"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/datatable-header-column"
import Actions from "./actions"

// define data
interface Barang {
  id: string,
  nama: string,
  jenis: string,
  merek: string,
  satuan: string,
  stok_barang: string,
  min_stok: string,
  status: string,
}

export const columns: ColumnDef<Barang>[] = [
  {
    id: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No." />
    ),
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "nama",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama" />
    ),
  },
  {
    accessorKey: "jenis",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jenis Barang" />
    ),
  },
  {
    accessorKey: "merek",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Merek" />
    ),
  },
  {
    accessorKey: "satuan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Satuan" />
    ),
  },
  {
    accessorKey: "stok_barang",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stok Barang" />
    ),
  },
  {
    accessorKey: "min_stok",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Minimal Stok" />
    ),
  },
  // {
  //   accessorKey: "harga_jual",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Harga Jual" />
  //   ),
  //   cell: ({ row }) => {
  //     const harga = Number(row.getValue("harga_jual"));

  //     const formattedHarga = new Intl.NumberFormat("id-ID", {
  //       style: "currency",
  //       currency: "IDR",
  //       minimumFractionDigits: 0,
  //     }).format(harga);
  //     return <div className="text-left">{formattedHarga}</div>;
  //   }
  // },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
  {
    id: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <Actions id={row.original.id} />
      </div>
    ),
  },
]