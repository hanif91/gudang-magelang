"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/datatable-header-column"
import Actions from "./actions"
import DetailActions from "./detail-actions"

// define data
type Barang = {
  barang_id: number;
  nama_barang: string;
  merek: string;
  jenis: string;
  kategori: string;
  stok_barang: number;
  qty: number;
};

// Define tipe data untuk DPB
type Paket = {
  id: string,
  nama_paket: string;
  barang: Barang[];
};


export const columns: ColumnDef<Paket>[] = [
  {
    id: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No." />
    ),
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "nama_paket",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Paket" />
    ),
  },
  {
    id: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <DetailActions data={row.original} />
        <Actions id={row.original.id} />
      </div>
    ),
  },
]