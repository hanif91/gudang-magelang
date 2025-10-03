"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/datatable-header-column"
import Actions from "./actions"

// define data
export type Stock = {
  id: string,
  nama_barang: string,
  qty: number,
  tanggal_masuk: string
  harga_masuk: number
}

export const columns: ColumnDef<Stock>[] = [
  {
    id: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No." />
    ),
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "nama_barang",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Barang" />
    ),
  },
  {
    accessorKey: "qty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jumlah" />
    ),
  },
  {
    accessorKey: "tanggal_masuk",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => {
      const rawDate = row.getValue("tanggal_masuk");

      // Pastikan rawDate bertipe string atau number
      const dateValue =
        typeof rawDate === "string" || typeof rawDate === "number"
          ? new Date(rawDate)
          : null;

      const formattedDate = dateValue
        ? dateValue.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
        : "-";

      return <div className="text-left">{formattedDate}</div>;
    },
    accessorFn: (row) => {
      const rawDate = row.tanggal_masuk;

      // Pastikan rawDate bertipe string atau number
      const dateValue =
        typeof rawDate === "string" || typeof rawDate === "number"
          ? new Date(rawDate)
          : null;

      const formattedDate = dateValue
        ? dateValue.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
        : "-";
      return formattedDate;
    },
  },
  {
    accessorKey: "harga_masuk",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Harga Masuk" />
    ),
    // cell: ({ row }) => {
    //   const harga = Number(row.getValue("harga_masuk"));

    //   const formattedHarga = new Intl.NumberFormat("id-ID", {
    //     style: "currency",
    //     currency: "IDR",
    //     minimumFractionDigits: 0,
    //   }).format(harga);
    //   return <div className="text-left">{formattedHarga}</div>;
    // },
    accessorFn: (row) => {
      const harga = row.harga_masuk;
      const formattedHarga = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(harga);
      return formattedHarga;
    },
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