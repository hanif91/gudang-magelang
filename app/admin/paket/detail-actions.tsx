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



export default function DetailActions({ data }: { data: Paket }) {
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
        title="Detail Paket"
        description="Informasi lengkap tentang paket"
      >
        <div className="space-y-4">
          <div className="flex">
            <div className="text-left">
              <p>Nama</p>
            </div>
            <div className="ml-5 text-left">
              <p>: {data.nama_paket}</p>
            </div>

          </div>
            <CardTitle className="text-left text-lg font-semibold">Daftar Barang</CardTitle>
          <div>
            <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableCaption>Daftar semua informasi barang</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Stok Barang</TableHead>
                  {/* <TableHead>Jenis</TableHead> */}
                  {/* <TableHead>Kategori</TableHead> */}
                  {/* <TableHead>Merek</TableHead> */}
          
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
                    <TableCell className="font-medium">{barang.stok_barang}</TableCell>
                    {/* <TableCell className="font-medium">{barang.jenis}</TableCell> */}
                    {/* <TableCell className="font-medium">{barang.kategori}</TableCell> */}
                    {/* <TableCell className="font-medium">{barang.merek}</TableCell> */}
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