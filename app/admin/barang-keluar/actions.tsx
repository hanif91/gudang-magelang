"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTransition, useState } from "react"
import { Check, CircleAlert, Pencil, Settings, Trash2, ListChecks } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { encrypt } from "@/lib/crypto"
import { mutate } from "swr"
import { deleteBarangKeluar, verifyAllBarangKeluar } from "@/lib/actions/actBarangKeluar"
import CustomModal from "./custom-modal"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Combobox } from "@/components/ui/combobox"
import useSWR from "swr"
import AxiosClient from "@/lib/AxiosClient"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => AxiosClient.get(url).then((res) => res.data.data);

const formSchema = z.object({
  id_kodekeper: z.string().min(1, "Kode Keperluan harus diisi"),
});


export default function Actions({ id, nobpp, mutate: externalMutate, disabled, isAllVerified }: { id: string; nobpp?: string; mutate?: () => void; disabled?: boolean; isAllVerified?: boolean }) {
  const { toast } = useToast()
  const [openDelete, setOpenDelete] = useState(false)
  const [openVerifyAll, setOpenVerifyAll] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter();

  const { data: kodeKeperluanData, isLoading: isLoadingKode } = useSWR<any[]>("/api/gudang/kodekeper", fetcher)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_kodekeper: "",
    },
  });

  const verifyAction = async (values: z.infer<typeof formSchema>) => {
    if (!nobpp) return;
    startTransition(async () => {
      const result = await verifyAllBarangKeluar(nobpp, values);
      setOpenVerifyAll(false);
      form.reset();
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
  }

  const handleCloseVerifyAll = () => {
    setOpenVerifyAll(false);
    form.reset();
  }

  const deleteAction = (id: string) => {
    startTransition(async () => {
      const result = await deleteBarangKeluar(id)
      if (result.success) {
        toast({
          variant: "default",
          description: (
            <div className="flex gap-2 items-start">
              <div className="flex flex-col justify-start ">
                <Check className="w-10 h-10" />
              </div>
              <div>
                <p className="font-bold text-lg">Success</p>
                <p>{result.message}</p>
              </div>
            </div>
          ),
        })

        // Use external mutate if available, otherwise use router.refresh and SWR mutate
        if (externalMutate) {
          externalMutate();
        } else {
          mutate('/api/gudang/barang-keluar');
          router.refresh();
        }
        setOpenDelete(false)
      } else {
        toast({
          variant: "destructive",
          description: (
            <div className="flex gap-2 items-center">
              <div className="flex flex-col justify-start ">
                <CircleAlert className="w-8 h-8" />
              </div>
              <div>
                <p className="font-bold text-lg">{result.message}</p>
              </div>
            </div>
          ),
        })
      }
    })
  }


  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setOpenVerifyAll(true)} disabled={isAllVerified}>
            <ListChecks className="h-4 w-4 mr-2" /> Verifikasi Semua Barang
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/admin/barang-keluar/edit-keterangan?id=${encodeURIComponent(
                encrypt(id)
              )}`}
            >
              <Pencil className="h-4 w-4 mr-2" /> Edit Keterangan
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="focus:bg-destructive focus:text-white"
            onClick={() => setOpenDelete(true)}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Hapus Transaksi
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal for Delete Confirmation */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAction(id)}
              disabled={isPending || disabled}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Verifikasi Semua Barang */}
      {kodeKeperluanData ? (
        <CustomModal
          isOpen={openVerifyAll}
          onClose={handleCloseVerifyAll}
          title="Verifikasi Semua Barang"
          description={`Anda akan memverifikasi semua barang untuk transaksi ${nobpp}. Pilih Kode Keperluan untuk melanjutkan.`}
          footer={
            <>
              <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleCloseVerifyAll}>
                Close
              </Button>
              <Button type="button" onClick={form.handleSubmit(verifyAction)} disabled={isPending}>
                {isPending ? "Menyimpan..." : "Verifikasi"}
              </Button>
            </>
          }
        >
          <div className="mb-4 bg-yellow-50 p-3 rounded-md border border-yellow-200 text-yellow-800 text-sm flex gap-2 items-start">
            <CircleAlert className="w-5 h-5 shrink-0" />
            <p className="mt-0.5">Peringatan: Aksi ini akan mengubah kode keperluan semua barang pada transaksi ini secara massal.</p>
          </div>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="id_kodekeper"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Keperluan</FormLabel>
                    <FormControl>
                      <Combobox
                        emptyText={isLoadingKode ? "Loading..." : "Tidak ada data"}
                        options={kodeKeperluanData.map((kode: any) => ({
                          value: kode.id.toString(),
                          label: kode.kode + " - " + kode.nama,
                        }))}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder="Pilih Kode Keperluan"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CustomModal>
      ) : (
        <CustomModal
          isOpen={openVerifyAll}
          onClose={handleCloseVerifyAll}
          title="Verifikasi Semua Barang"
          description="Loading data..."
          footer={
            <Button variant="outline" onClick={handleCloseVerifyAll}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4 bg-gray-300" />
              <Skeleton className="h-10 w-full bg-gray-300" />
            </div>
          </div>
        </CustomModal>
      )}
    </>
  )
}
