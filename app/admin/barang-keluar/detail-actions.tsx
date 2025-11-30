"use client";

import { useState, startTransition } from "react";
import { mutate } from "swr";
import { Check, CircleAlert, NotebookTabs, Trash2 } from "lucide-react";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import CustomModal from "./custom-modal";
import { deleteBarangKeluarItem } from "@/lib/actions/actBarangKeluar";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface BarangKeluarItems {
  id_fifo: number;
  id_barang_keluar: number;
  id_barang: number;
  nama_barang: string;
  qty: number;
  qty_minta: number;
  id_dpbk: number;
  harga: number;
  total: number;
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
  kodekeper: string;
  nama_kodekeper: string;
  id_asset_perpipaan: number;
  nama_asset_perpipaan: string;
  id_bagminta: number;
  nama_bagminta: string;
  barang_keluar_items: BarangKeluarItems[];
}

export default function DetailActions({ data, mutate: externalMutate }: { data: BarangKeluar; mutate?: () => void }) {
  const [openDetail, setOpenDetail] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter()

  const deleteAction = async (id: number) => {
    // console.log("id",id)
    setIsPending(true);
    startTransition(async () => {
      const result = await deleteBarangKeluarItem(String(id));
      setIsPending(false);
      setOpenDelete(false);
      if (result.success) {
        toast({
          variant: "default",
          description: (
            <div className="flex gap-2 items-start">
              <Check className="w-10 h-10" />
              <div>
                <p className="font-bold text-lg">Success</p>
                <p>{result.message}</p>
              </div>
            </div>
          ),
        });

        // Use external mutate if available, otherwise use SWR mutate and router.refresh
        if (externalMutate) {
          externalMutate();
        } else {
          mutate('/api/gudang/barang-keluar');
          router.refresh();
        }
      } else {
        toast({
          variant: "destructive",
          description: (
            <div className="flex gap-2 items-center">
              <CircleAlert className="w-8 h-8" />
              <div>
                <p className="font-bold text-lg">{result.message}</p>
              </div>
            </div>
          ),
        });
      }
    });
  };
  // console.log(data)

  return (
    <>
      <Button onClick={() => setOpenDetail(true)} variant="ghost">
        <NotebookTabs className="h-4 w-4" />
      </Button>

      {/* Modal Detail */}
      <CustomModal
        isOpen={openDetail}
        onClose={() => setOpenDetail(false)}
        title="BPP"
        description="Informasi lengkap BPP"
        footer={
          <Button
            variant="outline"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setOpenDetail(false)}
          >
            Close
          </Button>
        }
      >
        <Card className="w-full m-0 p-1">
          <CardHeader className="py-4">
            <div className="space-y-4">
              <div className="flex">
                <div className="text-left space-y-2">
                  <p>No BPP</p>
                  <p>Tanggal</p>
                  <p>Keterangan</p>
                  <p>Jenis Barang Keluar</p>
                  <p>Kode Keperluan</p>
                  <p>Asset</p>
                  <p>Nama Bagian</p>
                </div>
                <div className="ml-5 text-left space-y-2">
                  <p>: {data.nobpp}</p>
                  <p>
                    :{" "}
                    {new Date(data.tanggal).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p>: {data.keterangan}</p>
                  <p>: {data.nama_jenis_bk}</p>
                  <p>: {`${data.nama_kodekeper} (${data.kodekeper})`}</p>
                  <p>: {data.nama_asset_perpipaan}</p>
                  <p>: {data.nama_bagminta}</p>
                </div>
              </div>

            </div>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            <CardTitle className="text-left text-lg font-semibold"> Daftar Barang</CardTitle>

            <div className="">
              <Table>

                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>No DPB</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.barang_keluar_items.map((barang, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center py-1">{index + 1}</TableCell>
                      {/* <TableCell className="text-center py-1">{barang.id_fifo}</TableCell> */}
                      <TableCell className="text-left py-1">{barang.nodpbk}</TableCell>
                      <TableCell className="text-left py-1">{barang.nama_barang}</TableCell>
                      <TableCell className="text-center py-1">{barang.qty}</TableCell>
                      <TableCell className="text-right py-1">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(barang.harga)}
                      </TableCell>
                      <TableCell className="text-right py-1">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(barang.total)}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={data.barang_keluar_items.length <= 1}
                          onClick={() => {
                            // console.log("id",barang.id_barang_keluar)
                            setSelectedDeleteId(barang.id_fifo);
                            // console.log("id",selectedDeleteId)
                            setOpenDelete(true);
                          }}
                        >
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end">
            <Table>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell colSpan={6} className="text-right">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(data.barang_keluar_items.reduce((acc, item) => acc + item.total, 0))}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>

          </CardFooter>
        </Card>
      </CustomModal>

      {/* Modal Konfirmasi Hapus */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Data akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedDeleteId !== null) {
                  deleteAction(selectedDeleteId);
                }
              }}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
