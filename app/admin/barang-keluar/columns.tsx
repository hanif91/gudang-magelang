"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/datatable-header-column";
import Actions from "./actions";
import DetailActions from "./detail-actions";
import { Button } from "@/components/ui/button";
import KodeAction from "./kode-action";
import CetakAction from "./cetak-action";
import formatHarga from "@/lib/format-harga";

// define data
interface BarangKeluarItems {
  id_fifo: number;
	id_barang_keluar: number;
	id_barang: number;
	nama_barang: string;
	qty: number;
	qty_minta: number;
	id_dpbk: number;
	harga: number;
	total : number;
	nodpb: string;
	nodpbk: string;
	stock: number;
	satuan: string;
}

interface BarangKeluar {
  id: number;
  nobpp: string;
  tanggal: string;
  keterangan: string;
  id_jenis_bk: number;
  nama_jenis_bk: string;
  id_kodekeper: string;
  kodekeper: string;
  nama_kodekeper: string;
  id_asset_perpipaan: number;
  nama_asset_perpipaan: string;
  id_bagminta: number;
  total: number;
  nama_bagminta: string;
  barang_keluar_items: BarangKeluarItems[];
}
export const createColumns = (mutate?: () => void): ColumnDef<BarangKeluar>[] => [
  {
    id: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No." />
    ),
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "nobpp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No BPP" />
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
      const date = new Date(row.tanggal);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    },
  },
  // {
  //   accessorKey: "keterangan",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Keterangan" />
  //   ),
  // },
  {
    accessorKey: "nama_jenis_bk",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jenis Barang Keluar" />
    ),
  },
  {
    accessorKey: "kodekeper",
    enableSorting: false,
    enableResizing: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode Ak" />
    ),
    cell: ({ row }) => {
      const id_kodekeper = row.original.id_kodekeper ?? "";
      return (
        <div>
          <KodeAction
            kodekeper={row.original.kodekeper}
            id_kodekeper={id_kodekeper}
            id_barang_keluar={row.original.id.toString()}
            mutate={mutate}
          />
        </div>
      );
    },
    accessorFn: (row) => (row.kodekeper ? row.kodekeper : "Belum Diverifikasi"),
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true; // Jika filter kosong, tampilkan semua
      if (filterValue === "sudah")
        return row.getValue(columnId) !== "Belum Diverifikasi";
      if (filterValue === "Belum Diverifikasi")
        return row.getValue(columnId) === "Belum Diverifikasi";
      return true;
    },
  },

  {
    accessorKey: "nama_asset_perpipaan",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Asset" />
    ),
  },
  {
    accessorKey: "total",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      // const total = row.getValue("Total");
      const totalNumber = Number(row.original.total);
      return <div className="text-right">{totalNumber.toLocaleString("id-ID", { style: "currency", currency: "IDR",minimumFractionDigits: 0 })}</div>;
    },
  },
  {
    accessorKey: "nama_bagminta",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Bagian" />
    ),
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
        {/* <DetailActions data={row.original} />
        <CetakAction data={row.original} />
        
        <CetakAction data={row.original} /> */}
        {/* <Actions id={row.original.nobpp} /> */}
        <DetailActions data={row.original} mutate={mutate} />
        <CetakAction data={row.original} />
        <Actions id={row.original.id.toString()} mutate={mutate} />
      </div>
    ),
  },
];

// Untuk backward compatibility
export const columns: ColumnDef<BarangKeluar>[] = createColumns();
