"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTransition, useState } from "react";
import { NotebookTabs, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardTitle } from "@/components/ui/card";
import CustomModal from "./custom-modal";

export default function DetailActions({ data }: { data: any }) {
  const [openDetail, setOpenDetail] = useState(false);

  const totalHargaBeli = data.barang.reduce((total: number, barang: any) => {
    return total + barang.qty * barang.harga_beli;
  }, 0);

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
        title="Detail Pembelian"
        description="Informasi lengkap tentang pembelian"
      >
        <div className="space-y-4">
          <div className="flex">
            <div className="text-left">
              <p>No Pembelian</p>
              <p>Tanggal</p>
              <p>No Voucher</p>
              <p>Supplier</p>
            </div>
            <div className="ml-5 text-left">
              <p>: {data.no_pembelian}</p>
              <p>
                :{" "}
                {new Date(data.tanggal).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p>: {data.no_voucher}</p>
              <p>: {data.supplier}</p>
            </div>
          </div>
          <div>
            <CardTitle className="text-left text-lg font-semibold">
              Daftar Barang
            </CardTitle>
            <div className="max-h-80 overflow-y-auto">
              <Table>
                {/* <TableCaption>Daftar semua informasi barang</TableCaption> */}
                <TableHeader>
                  <TableRow>
                    <TableHead>No DPB</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>QtyF</TableHead>
                    {/* <TableHead>Jenis</TableHead> */}
                    {/* <TableHead>Kategori</TableHead> */}
                    {/* <TableHead>Merek</TableHead> */}
                    <TableHead>Satuan Barang</TableHead>
                    <TableHead>Harga Beli</TableHead>
                    <TableHead>Total Harga</TableHead>

                    {/* <TableHead>Foto Barang</TableHead> */}
                    {/* <TableHead>Minimal Stock</TableHead> */}
                    {/* <TableHead>Foto</TableHead> */}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.barang.map((barang: any) => (
                    <TableRow key={barang.id_pembelian_item}>
                      <TableCell className="font-medium">
                        {barang.nodpb}
                      </TableCell>
                      <TableCell className="font-medium min-w-48 text-left">
                        {barang.nama_barang}
                      </TableCell>
                      <TableCell className="font-medium">
                        {barang.qty}
                      </TableCell>
                      <TableCell className="font-medium">
                        {barang.qtyfifo}
                      </TableCell>
                      {/* <TableCell className="font-medium">{barang.jenis}</TableCell> */}
                      {/* <TableCell className="font-medium">{barang.kategori}</TableCell> */}
                      {/* <TableCell className="font-medium">{barang.merek}</TableCell> */}
                      <TableCell className="font-medium">
                        {barang.satuan}
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(barang.harga_beli)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(barang.harga_beli * barang.qty)}
                      </TableCell>
                      {/* <TableCell className="font-medium">{barang.satuan}</TableCell> */}
                      {/* <TableCell className="font-medium">{barang.satuan}</TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>

                <TableFooter>
                  <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell colSpan={5} className="text-right">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(totalHargaBeli)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </div>
      </CustomModal>
    </>
  );
}
