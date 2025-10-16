"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTransition, useState, startTransition } from "react"
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
import axios from "axios"
import { z } from "zod"
import useSWR, { mutate } from "swr"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Combobox } from "@/components/ui/combobox"
import { Skeleton } from "@/components/ui/skeleton"
import { serialize } from "object-to-formdata"
// import { editBarangKeluar } from "@/lib/actions/actBarangKeluar"
import { toast } from "@/hooks/use-toast"
import { updateStatus } from "@/lib/actions/actBarangKeluar"

interface KodeKeperluan {
    id: number;
    kode: string;
    nama: string;
}

const fetcher = (url: string) =>
    axios.get(url).then((res) => res.data.data);

const formSchema = z.object({
    id_kodekeper: z.string().min(1, "Kode Keperluan harus diisi"),
});

export default function KodeAction({ id_barang_keluar, kodekeper, id_kodekeper }: { id_barang_keluar: string; kodekeper: string; id_kodekeper: string; }) {
    const [openDetail, setOpenDetail] = useState(false);
    const [isPending, startTransition] = useTransition()
    const { data, isLoading, error } = useSWR<KodeKeperluan[]>("/api/kodekeper", fetcher);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id_kodekeper: id_kodekeper.toString() || "", // Pastikan default value sesuai dengan tipe string
        },
    });

    // const kode = data?.find((kode) => kode.id == Number(id_kodekeper))?.kode;
    // console.log(form.getValues('id_kodekeper'))

    async function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const formData = serialize(values); // Konversi values ke FormData
            // console.log(formData); // Untuk debugging
            // Kirim formData ke backend menggunakan axios atau fetch
            const dataResponse = await updateStatus(Number(id_barang_keluar), formData)
            if (dataResponse.success) {
                toast({
                    variant: "default",
                    description: "Data Barang Keluar berhasil disimpan!",
                });
                setOpenDetail(false)
                mutate('/api/barang-keluar')
            } else {
                toast({
                    variant: "destructive",
                    description: dataResponse.message,
                });
            }
        });
    }

    const handleClose = () => {
        setOpenDetail(false)
        form.reset()
    }

    return (
        <>
            {kodekeper ? (
                <Button onClick={() => setOpenDetail(true)} type="button" variant={"link"}>
                    {kodekeper}
                </Button>
            ) : (
                <Button onClick={() => setOpenDetail(true)} type="button" variant={"destructive"}>
                    Belum Diverifikasi
                </Button>
            )}
            {/* Modal for Detail Pembelian */}
            {
                data ? (
                    <CustomModal
                        isOpen={openDetail}
                        onClose={() => handleClose()}
                        title="Verifikasi Keperluan"
                        description="Informasi lengkap BPP"
                        footer={
                            <>
                                <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleClose()}>
                                    Close
                                </Button>
                                <Button type="button" onClick={form.handleSubmit(onSubmit)}>
                                    {isPending ? "Menyimpan" : "Submit"}
                                </Button>
                            </>
                        }
                    >
                        <Form {...form}>
                            <form>
                                <FormField
                                    control={form.control}
                                    name="id_kodekeper"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kode Keperluan</FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    emptyText={isLoading ? "Loading" : "Tidak ada data"}
                                                    options={data.map((kode) => ({
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
                        isOpen={openDetail}
                        onClose={() => setOpenDetail(false)}
                        title="Verifikasi Keperluan"
                        description="Informasi lengkap BPP"
                        footer={
                            <>
                                <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setOpenDetail(false)}>
                                    Close
                                </Button>
                                <Button type="button" disabled>
                                    Submit
                                </Button>
                            </>
                        }
                    >
                        {/* Skeleton Loading untuk Modal */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/4 bg-gray-300" /> {/* Placeholder untuk FormLabel */}
                                <Skeleton className="h-10 w-full bg-gray-300" /> {/* Placeholder untuk Combobox */}
                            </div>
                        </div>
                    </CustomModal>
                )
            }
        </>
    );
}