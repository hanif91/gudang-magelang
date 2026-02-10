"use client"

import { useState } from "react"
import { NotebookTabs } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CardTitle } from "@/components/ui/card"
import CustomModal from "./custom-modal"
import { CircleCheck, CircleX } from "lucide-react"


import { Dpb } from "./columns"

export default function DetailActions({ data }: { data: Dpb }) {
  const [openDetail, setOpenDetail] = useState(false)

  return (
    <>
      <Button onClick={() => setOpenDetail(true)} variant="ghost">
        <NotebookTabs className="h-4 w-4" />
      </Button>

      {/* Modal untuk Detail Permintaan Barang */}
      <CustomModal
        isOpen={openDetail}
        onClose={() => setOpenDetail(false)}
        title="Detail Permintaan Barang"
        description="Informasi lengkap tentang permintaan barang"
      >
        <div className="space-y-4">
          {/* Informasi No DPB dan Tanggal */}
          <div className="flex">
            <div className="text-left">
              <p>No DPB</p>
              <p>Tanggal</p>
            </div>
            <div className="ml-5 text-left">
              <p>: {data.nodpb}</p>
              <p>
                :{" "}
                {new Date(data.tanggal).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Daftar Barang dengan Scroll */}
          <div>
            <CardTitle className="text-left text-lg font-semibold">Daftar Barang</CardTitle>

            {/* Wrapper dengan Scroll */}
            <div className="max-h-80 overflow-y-auto border rounded-md mt-2">
              <Table>
                <TableCaption>Daftar semua informasi barang</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Merek</TableHead>
                    <TableHead>Satuan Barang</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="max-h-80 overflow-y-auto">
                  {data.barang.map((barang, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium Text-left">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium min-w-45 text-left">
                        {barang.nama_barang}
                      </TableCell>
                      <TableCell className="font-medium Text-left">
                        {barang.flagproses === 1 ? <CircleCheck className="h-4 w-4 text-green-500" /> : <CircleX className="h-4 w-4 text-red-500" />}
                      </TableCell>
                      <TableCell className="font-medium">{barang.qty}</TableCell>
                      <TableCell className="font-medium">{barang.nama_jenis}</TableCell>
                      <TableCell className="font-medium">{barang.nama_kategori}</TableCell>
                      <TableCell className="font-medium">{barang.nama_merek}</TableCell>
                      <TableCell className="font-medium">{barang.satuan_barang}</TableCell>
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
