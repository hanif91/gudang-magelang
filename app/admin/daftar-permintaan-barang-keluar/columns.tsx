"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/datatable-header-column"
import Actions from "./actions"
import DetailActions from "./detail-actions"
import PrintDPB from "./components/print-dpbk"
import PrintDPBK from "./components/print-dpbk"
import Dpbk from "./models/models"
import CetakAction from "./cetak-action"

// define data

export const columns: ColumnDef<Dpbk>[] = [
  {
    id: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No." />
    ),
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "nodpbk",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No DBPK" />
    ),
  },

  {
    accessorKey: "nama_unit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unit" />
    ),
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
  },
  // {
  //   accessorKey: "no_voucher",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="No Voucher" />
  //   ),
  // },
  // {
  //   accessorKey: "user",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="User" />
  //   ),
  // },
  {
    id: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <DetailActions data={row.original} />
        <CetakAction data={row.original} />
        <Actions id={row.original.nodpbk} />
      </div>
    ),
  },
]