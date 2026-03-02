"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/datatable-header-column"
import Actions from "./actions"
import DetailActions from "./detail-actions"

// define data
import { ReturBarang, ReturBarangItem } from "./types"
export type { ReturBarang, ReturBarangItem }

export const columns: ColumnDef<ReturBarang>[] = [
    {
        id: "index",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="No." />
        ),
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    },
    {
        accessorKey: "noop",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="No OP" />
        ),
    },
    {
        accessorKey: "tanggal",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tanggal" />
        ),
        accessorFn: (row) => {
            const rawDate = row.tanggal;

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
        id: "supplier",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Supplier" />
        ),
        cell: ({ row }) => {
            const supplier = row.original.items?.[0]?.nama_supplier || "-";
            return <div className="text-center">{supplier}</div>;
        },
    },
    {
        id: "action",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Actions" />
        ),
        cell: ({ row }) => (
            <div className="text-center">
                <DetailActions data={row.original} />
                <Actions id={row.original.items?.[0]?.id_op?.toString() || ""} editId={row.original.items?.[0]?.id_op?.toString() || ""} />
            </div>
        ),
    },
]
