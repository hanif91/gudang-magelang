// import { ColumnDef, SortingFn } from "@tanstack/react-table";
// import { Button } from "@/components/ui/button";
// import { ArrowUpDown } from "lucide-react";
// import Actions from "./actions";
// import { ColumnMeta } from "@tanstack/react-table";

// declare module "@tanstack/react-table" {
//   interface ColumnMeta<TData extends unknown, TValue> {
//     isVisibleWhenExpanded?: boolean; // Tambahkan properti kustom
//   }
// }

// // const hierarchicalSortingFn: SortingFn<DPB | Barang> = (rowA, rowB, columnId) => {
// //   const valueA = rowA.original;
// //   const valueB = rowB.original;

// //   // Jika rowA adalah DPB, ambil nilai dari sub-rows (barang)
// //   if ("barang" in valueA) {
// //     const subRowsA = valueA.barang;
// //     const subRowsB = "barang" in valueB ? valueB.barang : [];

// //     // Ambil nilai pertama dari sub-rows untuk perbandingan
// //     const firstSubRowA = subRowsA[0]?.[columnId as keyof Barang];
// //     const firstSubRowB = subRowsB[0]?.[columnId as keyof Barang];

// //     if (firstSubRowA && firstSubRowB) {
// //       return String(firstSubRowA).localeCompare(String(firstSubRowB));
// //     }
// //   }

// //   // Jika rowA adalah Barang, bandingkan langsung
// //   const cellValueA = (valueA as Barang)[columnId as keyof Barang];
// //   const cellValueB = (valueB as Barang)[columnId as keyof Barang];

// //   return String(cellValueA).localeCompare(String(cellValueB));
// // };
// // Define tipe data untuk Barang
// export type Barang = {
//   id: string;
//   id_nodpb: string;
//   nama_barang: string;
//   // tanggal: string;
//   qty: number;
//   nama_user: string;
//   satuan_barang: string;
//   minimal_stok_barang: number;
//   harga_jual_barang: number;
//   foto_barang: string;
//   nama_jenis: string;
//   nama_kategori: string;
//   nama_merek: string;
// };

// // Define tipe data untuk DPB
// export type DPB = {
//   nodpb: string;
//   tanggal: string;
//   barang: Barang[];
// };



// // Define columns
// export const columns: ColumnDef<DPB | Barang>[] = [
//   {
//     accessorKey: "nodpb", // Tambahkan accessorKey
//     header: "No DPB",
//     cell: ({ row }) => {
//       if (row.original && "barang" in row.original) {
//         return (
//           <div
//             onClick={() => row.toggleExpanded()}
//             style={{ cursor: "pointer" }}
//             className="flex items-center gap-2"
//           >
//             {row.original.nodpb}
//           </div>
//         );
//       }
//       return null;
//     },
//   },
//   {
//     accessorKey: "tanggal", // Tambahkan accessorKey
//     header: "Tanggal",
//     cell: ({ row }) => {
//       if (row.original && "barang" in row.original) {
//         const rawDate = row.original.tanggal;
//         const dateValue = new Date(rawDate);
//         const formattedDate = dateValue.toLocaleDateString("id-ID", {
//           day: "2-digit",
//           month: "long",
//           year: "numeric",
//         });
//         return (
//           <div
//             onClick={() => row.toggleExpanded()}
//             style={{ cursor: "pointer" }}
//             className="flex items-center gap-2"
//           >
//             {formattedDate}
//           </div>
//         );
//       }
//       return null;
//     },
//   },
//   {
//     accessorKey: "nama_barang", // Tambahkan accessorKey
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Nama Barang
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </Button>
//       );
//     },
//     cell: ({ row }) => {
//       if (row.original && !("barang" in row.original)) {
//         return row.original.nama_barang;
//       }
//       return null;
//     },
//     meta: { isVisibleWhenExpanded: true }, // Hanya tampilkan saat baris di-expand
//     // sortingFn: hierarchicalSortingFn,
//   },

//   // {
//   //   accessorKey: "tanggal", // Tambahkan accessorKey
//   //   header: "Tanggal",
//   //   cell: ({ row }) => {
//   //     if (row.original && !("barang" in row.original)) {
//   //       const rawDate = row.original.tanggal;
//   //       const dateValue = new Date(rawDate);
//   //       const formattedDate = dateValue.toLocaleDateString("id-ID", {
//   //         day: "2-digit",
//   //         month: "long",
//   //         year: "numeric",
//   //       });
//   //       return formattedDate;
//   //     }
//   //     return null;
//   //   },
//   // },
//   {
//     accessorKey: "qty", // Tambahkan accessorKey
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           QTY
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </Button>
//       );
//     },
//     cell: ({ row }) => {
//       if (row.original && !("barang" in row.original)) {
//         return row.original.qty;
//       }
//       return null;
//     },
//     meta: { isVisibleWhenExpanded: true },
//   },
//   {
//     accessorKey: "harga_jual_barang", // Tambahkan accessorKey
//     header: "Harga Jual",
//     cell: ({ row }) => {
//       if (row.original && !("barang" in row.original)) {
//         const harga = row.original.harga_jual_barang;
//         const formattedHarga = new Intl.NumberFormat("id-ID", {
//           style: "currency",
//           currency: "IDR",
//           minimumFractionDigits: 0,
//         }).format(harga);
//         return formattedHarga;
//       }
//       return null;
//     },
//     meta: { isVisibleWhenExpanded: true },
//   },
//   {
//     accessorKey: "nama_jenis", // Tambahkan accessorKey
//     header: "Jenis",
//     cell: ({ row }) => {
//       if (row.original && !("barang" in row.original)) {
//         return row.original.nama_jenis;
//       }
//       return null;
//     },
//     meta: { isVisibleWhenExpanded: true },
//   },
//   {
//     accessorKey: "nama_kategori", // Tambahkan accessorKey
//     header: "Kategori",
//     cell: ({ row }) => {
//       if (row.original && !("barang" in row.original)) {
//         return row.original.nama_kategori;
//       }
//       return null;
//     },
//     meta: { isVisibleWhenExpanded: true },
//   },
//   {
//     accessorKey: "nama_merek", // Tambahkan accessorKey
//     header: "Merek",
//     cell: ({ row }) => {
//       if (row.original && !("barang" in row.original)) {
//         return row.original.nama_merek;
//       }
//       return null;
//     },
//     meta: { isVisibleWhenExpanded: true },
//   },
//   // {
//   //   accessorKey: "nama_user", // Tambahkan accessorKey
//   //   header: "Nama User",
//   //   cell: ({ row }) => {
//   //     if (row.original && !("barang" in row.original)) {
//   //       return row.original.nama_user;
//   //     }
//   //     return null;
//   //   },
//   // },
//   {
//     accessorKey: "satuan_barang", // Tambahkan accessorKey
//     header: "Satuan Barang",
//     cell: ({ row }) => {
//       if (row.original && !("barang" in row.original)) {
//         return row.original.satuan_barang;
//       }
//       return null;
//     },
//     meta: { isVisibleWhenExpanded: true },
//   },
//   {
//     accessorKey: "minimal_stok_barang", // Tambahkan accessorKey
//     header: "Minimal Stok",
//     cell: ({ row }) => {
//       if (row.original && !("barang" in row.original)) {
//         return row.original.minimal_stok_barang;
//       }
//       return null;
//     },
//     meta: { isVisibleWhenExpanded: true },
//   },
//   {
//     accessorKey: "foto_barang", // Tambahkan accessorKey
//     header: "Foto Barang",
//     cell: ({ row }) => {
//       if (row.original && !("barang" in row.original)) {
//         const foto = row.original.foto_barang;
//         return foto ? (
//           <img src={foto} alt="Foto Barang" className="w-10 h-10 rounded" />
//         ) : (
//           "Tidak ada foto"
//         );
//       }
//       return null;
//     },
//     meta: { isVisibleWhenExpanded: true },
//   },
//   {
//     id: "action",
//     header: "Actions",
//     cell: ({ row }) => {
//       if (row.original && !("barang" in row.original)) {
//         return (
//           <div className="text-center">
//             <Actions id={row.original.id_nodpb} />
//           </div>
//         );
//       }
//       return null;
//     },
//      meta: { isVisibleWhenExpanded: true },
//   },

// ];


"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/datatable-header-column"
import Actions from "./actions"
import DetailActions from "./detail-actions"
import CetakAction from "./cetak-action"

// define data
interface Dpb {
  id: number,
  nodpb: string,
  tanggal: string
  barang: Barang[]
}

interface Barang {
  id: number,
  nama_barang: string,
  satuan_barang: string,
  qty: number,
  nama_jenis: string,
  nama_kategori: string,
  nama_merek: string,
  stok : number,
}
export const columns: ColumnDef<Dpb>[] = [
  {
    id: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No." />
    ),
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "nodpb",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No DBP" />
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
        <Actions id={row.original.nodpb} />
      </div>
    ),
  },
]