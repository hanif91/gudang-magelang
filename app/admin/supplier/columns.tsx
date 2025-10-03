"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/datatable-header-column"
import Actions from "./actions"

// define data
export type Supplier = {
  id: string,
  nama: string,
  aktif: number,
}

export const columns: ColumnDef<Supplier>[] = [
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
      <DataTableColumnHeader column={column} title="Nama Supplier" />
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