"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/datatable-header-column"
import Actions from "./actions"

// define data
export type AssetPerpipaan = {
  id: string,
  nama: string,
  tanggal: string,
  alamat: string,
  nilai: number,
  lokasi: number,
  aktif: number,
}

export const columns: ColumnDef<AssetPerpipaan>[] = [
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
    accessorKey: "nilai",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nilai" />
    ),
    // cell: ({ row }) => {
    //   const harga = Number(row.getValue("nilai"));

    //   const formattedHarga = new Intl.NumberFormat("id-ID", {
    //     style: "currency",
    //     currency: "IDR",
    //     minimumFractionDigits: 0,
    //   }).format(harga);
    //   return <div className="text-left">{formattedHarga}</div>;
    // },
    accessorFn: (row) => {
      const harga = row.nilai;
      const formattedHarga = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(harga);
      return formattedHarga;
    },

  },
  {
    accessorKey: "tanggal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => {
      const rawDate = row.getValue("tanggal");

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
      const rawDate = row.tanggal;

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
    accessorKey: "alamat",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alamat" />
    ),
  },
  
  {
    accessorKey: "lokasi",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lokasi" />
    ),
  },
  {
    accessorKey: "aktif",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    // cell: ({ row }) => {
    //   const status = row.getValue("aktif") == 1 ? "Aktif" : "Tidak Aktif";

    //   return <div className="text-left">{status}</div>;
    // },
    accessorFn: (row) => {
      const status = row.aktif == 1 ? "Aktif" : "Tidak Aktif";
      return status;
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