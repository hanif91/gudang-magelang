// import React, { useState } from "react";
// import {
//   ColumnDef,
//   SortingState,
//   PaginationState,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   getExpandedRowModel,
//   useReactTable,
//   ExpandedState,
// } from "@tanstack/react-table";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { DataTablePagination } from "@/components/datatable-pagination";
// import { Barang, DPB } from "./columns";

// // Define props dengan constraint
// interface DataTableProps<TData extends DPB | Barang, TValue> {
//   columns: ColumnDef<TData, TValue>[];
//   data: TData[];
// }

// export function DataTable<TData extends DPB | Barang, TValue>({
//   columns,
//   data,
// }: DataTableProps<TData, TValue>) {
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [pagination, setPagination] = useState<PaginationState>({
//     pageIndex: 0,
//     pageSize: 10,
//   });
//   const [globalFilter, setGlobalFilter] = useState("");
//   const [expanded, setExpanded] = useState<ExpandedState>({});

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getExpandedRowModel: getExpandedRowModel(),
//     getSubRows: (row) => {
//       if ("barang" in row) {
//         return (row as DPB).barang as TData[];
//       }
//       return undefined;
//     },
//     onPaginationChange: setPagination,
//     onSortingChange: setSorting,
//     onGlobalFilterChange: setGlobalFilter,
//     state: {
//       sorting,
//       pagination,
//       globalFilter,
//       expanded,
//     },
//     onExpandedChange: setExpanded,
//     autoResetExpanded: false,
//     filterFromLeafRows: true,
//   });

//   return (
//     <div>
//       {/* Filter and Page Size Controls */}
//       <div className="flex flex-col sm:flex-row justify-center items-center gap-2 px-1 pb-1 pt-3 overflow-auto">
//         <div className="flex items-center gap-2 text-sm">
//           <p>Show</p>
//           <Select
//             value={`${table.getState().pagination.pageSize}`}
//             onValueChange={(value) => {
//               table.setPageSize(Number(value));
//             }}
//           >
//             <SelectTrigger className="h-8 w-[75px]">
//               <SelectValue placeholder={table.getState().pagination.pageSize} />
//             </SelectTrigger>
//             <SelectContent side="bottom">
//               {[10, 25, 50, 100, "All"].map((pageSize) => {
//                 const pageSizeNumber =
//                   pageSize == "All" ? table.getTotalSize() : pageSize;

//                 return (
//                   <SelectItem key={pageSizeNumber} value={`${pageSizeNumber}`}>
//                     {pageSize}
//                   </SelectItem>
//                 );
//               })}
//             </SelectContent>
//           </Select>
//           <p>entries</p>
//         </div>
//         <div className="sm:ml-auto flex items-center text-sm">
//           <p>Search</p>
//           <Input
//             placeholder="Search..."
//             value={globalFilter}
//             onChange={(e) => setGlobalFilter(e.target.value)}
//             className="ml-2 w-full sm:w-64"
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <div className="rounded-md border mt-2 mb-3">
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => {
//                   // Sembunyikan kolom detail jika baris tidak di-expand
//                   const isDetailColumn = header.column.columnDef.meta?.isVisibleWhenExpanded;
//                   if (isDetailColumn && !Object.keys(expanded).length) {
//                     return null;
//                   }
//                   return (
//                     <TableHead key={header.id}>
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )}
//                     </TableHead>
//                   );
//                 })}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows?.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <React.Fragment key={row.id}>
//                   <TableRow
//                     key={row.id}
//                     data-state={row.getIsSelected() && "selected"}
//                   >
//                     {row.getVisibleCells().map((cell) => {
//                       // Sembunyikan kolom detail jika baris tidak di-expand
//                       const isDetailColumn = cell.column.columnDef.meta?.isVisibleWhenExpanded;
//                       if (isDetailColumn && !row.getIsExpanded()) {
//                         return null;
//                       }
//                       return (
//                         <TableCell key={cell.id} className="p-3">
//                           {flexRender(
//                             cell.column.columnDef.cell,
//                             cell.getContext()
//                           )}
//                         </TableCell>
//                       );
//                     })}
//                   </TableRow>
//                   {/* Tampilkan sub-rows jika baris di-expand */}
//                   {row.getIsExpanded() && row.subRows.map((subRow) => (
//                     <TableRow key={subRow.id}>
//                       {subRow.getVisibleCells().map((cell) => (
//                         <TableCell key={cell.id} className="p-3">
//                           {flexRender(
//                             cell.column.columnDef.cell,
//                             cell.getContext()
//                           )}
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))}
//                 </React.Fragment>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center"
//                 >
//                   No results.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Pagination */}
//       <DataTablePagination table={table} />
//     </div>
//   );
// }


"use client"

import { useState } from "react"
import {
  ColumnDef,
  SortingState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTablePagination } from "@/components/datatable-pagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  })
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      pagination,
      globalFilter,
    },
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-2 px-1 pb-1 pt-3 overflow-auto">
        <div className="flex items-center gap-2 text-sm">
          <p>Show</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[75px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="bottom">
              {[10, 25, 50, 100, "All"].map((pageSize) => {
                const pageSizeNumber =
                  pageSize == "All" ? table.getTotalSize() : pageSize

                return (
                  <SelectItem key={pageSizeNumber} value={`${pageSizeNumber}`}>
                    {pageSize}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <p>entries</p>
        </div>
        <div className="sm:ml-auto flex items-center text-sm">
          <p>Search</p>
          <Input
            placeholder=""
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="ml-2 w-full sm:w-64"
          />
        </div>
      </div>
      <div className="rounded-md border mt-2 mb-3">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}