"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/datatable-header-column"
import Actions from "./actions"

// define data
export type Users = {
  id: string,
  email: string,
  image: string,
  name: string,
  status: number,
}

export const columns: ColumnDef<Users>[] = [
  {
    id: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No." />
    ),
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "nama",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    // cell: ({ row }) => {
    //   const status = row.getValue("status") == 1 ? "Aktif" : "Tidak Aktif";


    //   return <div className="text-left">{status}</div>;
    // },
    accessorFn: (row) => {
      const status = row.status == 1 ? "Aktif" : "Tidak Aktif";
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