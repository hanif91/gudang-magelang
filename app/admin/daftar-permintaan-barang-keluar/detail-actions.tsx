"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTransition, useState } from "react"
import { NotebookTabs, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CardTitle } from "@/components/ui/card"
import CustomModal from "./custom-modal"
import Dpbk from "./models/models"




export default function DetailActions({ data }: { data: Dpbk }) {
  const [openDetail, setOpenDetail] = useState(false)

  return (
    <>
      <Button onClick={() => setOpenDetail(true)} variant="ghost" className="">
        <NotebookTabs className="h-4 w-4" />
        {/* <Settings className="h-4 w-4" /> */}
      </Button>

      {/* Modal for Detail Pembelian */}
      <CustomModal
        isOpen={openDetail}
        onClose={() => setOpenDetail(false)}
        title="Detail Permintaan Barang Keluar"
        description="Informasi lengkap tentang permintaan barang keluar"
      >
        <div className="space-y-4">
          <div className="flex">
            <div className="text-left">
              <p>No DPBK</p>
              <p>Tanggal</p>
              <p>Unit</p>
              <p>Keterangan</p>
            </div>
            <div className="ml-5 text-left flex justify-center space-x-2">
              <div className="flex flex-col">
                <span>:</span>
                <span>:</span>
                <span>:</span>
                <span>:</span>
              </div>
              <div>
                <p>{data.nodpbk}</p>
                <p>{new Date(data.tanggal).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}</p>
                <p>{data.nama_unit}</p>
                <p className="whitespace-normal">{data.keterangan}</p>
              </div>
            </div>

          </div>
          <div>
            <CardTitle className="text-left text-lg font-semibold">Daftar Barang</CardTitle>
            <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableCaption>Daftar semua informasi barang</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Qty</TableHead>
                  {/* <TableHead>Jenis</TableHead> */}
                  {/* <TableHead>Kategori</TableHead> */}
                  {/* <TableHead>Merek</TableHead> */}
                  <TableHead>Satuan Barang</TableHead>
                  <TableHead>Stok Barang</TableHead>
                  {/* <TableHead>Foto Barang</TableHead> */}
                  {/* <TableHead>Minimal Stock</TableHead> */}
                  {/* <TableHead>Foto</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.barang.map((barang, index: any) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium min-w-48 text-left">{barang.nama_barang}</TableCell>
                    <TableCell className="font-medium">{barang.qty}</TableCell>
                    {/* <TableCell className="font-medium">{barang.jenis}</TableCell> */}
                    {/* <TableCell className="font-medium">{barang.kategori}</TableCell> */}
                    {/* <TableCell className="font-medium">{barang.merek}</TableCell> */}
                    <TableCell className="font-medium">{barang.satuan_barang}</TableCell>
                    <TableCell className="font-medium">{barang.stok_barang}</TableCell>

                    {/* <TableCell className="font-medium">{barang.satuan}</TableCell> */}
                    {/* <TableCell className="font-medium">{barang.satuan}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        </div>
      </CustomModal>
    </>
  )
}