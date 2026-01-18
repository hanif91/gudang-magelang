"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/datatable-header-column"
import Actions from "./actions"
import DetailActions from "./detail-actions"

// define data
interface Pembelian {
  no_pembelian: string,
  supplier: string,
  tanggal: string,
  no_voucher: string,
  status: string,
  id_pembelian: string,
  total : string
}

export const columns: ColumnDef<Pembelian>[] = [
  {
    id: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No." />
    ),
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "no_pembelian",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No Pembelian" />
    ),
  },

  {
    accessorKey: "supplier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supplier" />
    ),
  },

  {
    accessorKey: "tanggal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    // cell: ({ row }) => {
    //   const rawDate = row.getValue("tanggal");

    //   // Pastikan rawDate bertipe string atau number
    //   const dateValue =
    //     typeof rawDate === "string" || typeof rawDate === "number"
    //       ? new Date(rawDate)
    //       : null;

    //   const formattedDate = dateValue
    //     ? dateValue.toLocaleDateString("id-ID", {
    //       day: "2-digit",
    //       month: "long",
    //       year: "numeric",
    //     })
    //     : "-";

    //   return <div className="text-left">{formattedDate}</div>;
    // },
    accessorFn: (row) => {
      const rawDate = row.tanggal
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
    accessorKey: "no_voucher",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No Voucher" />
    ),
  },

  {
    accessorKey: "Total",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" className="" />
    ),
    cell: ({ row }) => {
      // const total = row.getValue("Total");
      const totalNumber = Number(row.original.total);
      return <div className="text-center">{totalNumber.toLocaleString("id-ID", { style: "currency", currency: "IDR",minimumFractionDigits: 0 })}</div>;
    },
  },
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
        <Actions id={row.original.id_pembelian} />

      </div>
    ),
  },
]