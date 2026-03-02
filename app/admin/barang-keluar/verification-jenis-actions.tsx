"use client";

import { useState, startTransition } from "react";
import useSWR, { useSWRConfig } from "swr";
import { Check, CircleAlert, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomModal from "./custom-modal";
import { verifyBarangKeluarJenis } from "@/lib/actions/actBarangKeluar";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Combobox } from "@/components/ui/combobox";
import AxiosClient from "@/lib/AxiosClient";
import { Skeleton } from "@/components/ui/skeleton";

interface JenisBk {
    id: number;
    nama: string;
}

interface KodeKeperluan {
    id: number;
    kode: string;
    nama: string;
}

const fetcher = (url: string) =>
    AxiosClient.get(url).then((res) => {
        const d = res.data;
        return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
    });

const formSchema = z.object({
    jenis_bk_id: z.string().min(1, "Jenis Barang Keluar harus diisi"),
    id_kodekeper: z.string().min(1, "Kode Keperluan harus diisi"),
});

export default function VerificationJenisActions() {
    const [openVerify, setOpenVerify] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();
    const { mutate: globalMutate } = useSWRConfig();

    const { data: jenisBkData, isLoading: isLoadingJenis, mutate } = useSWR<JenisBk[]>(
        "/api/gudang/jenis-bk",
        fetcher
    );

    const { data: kodeKeperluanData, isLoading: isLoadingKode } = useSWR<
        KodeKeperluan[]
    >("/api/gudang/kodekeper", fetcher);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            jenis_bk_id: "",
            id_kodekeper: "",
        },
    });

    const verifyAction = async (values: z.infer<typeof formSchema>) => {
        setIsPending(true);
        startTransition(async () => {
            const result = await verifyBarangKeluarJenis(values.jenis_bk_id, {
                id_kodekeper: Number(values.id_kodekeper),
            });
            setIsPending(false);
            setOpenVerify(false);
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

                mutate();
                globalMutate(
                    (key: string) => typeof key === 'string' && key.startsWith('/api/gudang/barang-keluar'),
                    undefined,
                    { revalidate: true }
                );
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    description: (
                        <div className="flex gap-2 items-center">
                            <CircleAlert className="w-8 h-8" />
                            <div>
                                <p className="font-bold text-lg">
                                    {result.message}
                                </p>
                            </div>
                        </div>
                    ),
                });
            }
        });
    };

    const handleCloseVerify = () => {
        setOpenVerify(false);
        form.reset();
    };

    const jenisList = Array.isArray(jenisBkData) ? jenisBkData : [];
    const kodeList = Array.isArray(kodeKeperluanData) ? kodeKeperluanData : [];
    const isDataLoaded = jenisList.length > 0 && kodeList.length > 0;

    return (
        <>
            <Button
                onClick={() => setOpenVerify(true)}
                variant="outline"
                className="w-52"
            >
                <ListChecks className="w-4 h-4 mr-1" /> Verifikasi Jenis
            </Button>

            {/* Modal Verifikasi Jenis */}
            {isDataLoaded ? (
                <CustomModal
                    isOpen={openVerify}
                    onClose={handleCloseVerify}
                    title="Verifikasi Jenis"
                    description="Pilih Jenis Barang Keluar dan Kode Keperluan untuk memverifikasi."
                    footer={
                        <>
                            <Button
                                variant="outline"
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                onClick={handleCloseVerify}
                            >
                                Close
                            </Button>
                            <Button
                                type="button"
                                onClick={form.handleSubmit(verifyAction)}
                                disabled={isPending}
                            >
                                {isPending ? "Menyimpan..." : "Verifikasi"}
                            </Button>
                        </>
                    }
                >
                    <Form {...form}>
                        <form className="space-y-4">
                            <FormField
                                control={form.control}
                                name="jenis_bk_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Jenis Barang Keluar
                                        </FormLabel>
                                        <FormControl>
                                            <Combobox
                                                emptyText={
                                                    isLoadingJenis
                                                        ? "Loading..."
                                                        : "Tidak ada data"
                                                }
                                                options={jenisList.map(
                                                    (jenis) => ({
                                                        value: jenis.id.toString(),
                                                        label: jenis.nama,
                                                    })
                                                )}
                                                value={field.value}
                                                onChange={(value) =>
                                                    field.onChange(value)
                                                }
                                                placeholder="Pilih Jenis Barang Keluar"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="id_kodekeper"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kode Keperluan</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                emptyText={
                                                    isLoadingKode
                                                        ? "Loading..."
                                                        : "Tidak ada data"
                                                }
                                                options={kodeList.map(
                                                    (kode) => ({
                                                        value: kode.id.toString(),
                                                        label:
                                                            kode.kode +
                                                            " - " +
                                                            kode.nama,
                                                    })
                                                )}
                                                value={field.value}
                                                onChange={(value) =>
                                                    field.onChange(value)
                                                }
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
                    isOpen={openVerify}
                    onClose={handleCloseVerify}
                    title="Verifikasi Jenis"
                    description="Loading data..."
                    footer={
                        <Button variant="outline" onClick={handleCloseVerify}>
                            Close
                        </Button>
                    }
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4 bg-gray-300" />
                            <Skeleton className="h-10 w-full bg-gray-300" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4 bg-gray-300" />
                            <Skeleton className="h-10 w-full bg-gray-300" />
                        </div>
                    </div>
                </CustomModal>
            )}
        </>
    );
}
