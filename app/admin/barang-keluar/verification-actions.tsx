"use client";

import { useState, startTransition } from "react";
import { mutate } from "swr";
import useSWR from "swr";
import { Check, CircleAlert, ListChecks, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import CustomModal from "./custom-modal";
import { verifyBarangKeluarItem } from "@/lib/actions/actBarangKeluar";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Combobox } from "@/components/ui/combobox";
import AxiosClient from "@/lib/AxiosClient";
import { Skeleton } from "@/components/ui/skeleton";

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
    kodekeper_kode?: string;
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

interface KodeKeperluan {
    id: number;
    kode: string;
    nama: string;
}

const fetcher = (url: string) =>
    AxiosClient.get(url).then((res) => res.data.data);

const formSchema = z.object({
    id_kodekeper: z.string().min(1, "Kode Keperluan harus diisi"),
});

export default function VerificationActions({ data, mutate: externalMutate }: { data: BarangKeluar; mutate?: () => void }) {
    const [openDetail, setOpenDetail] = useState(false);
    const [openVerify, setOpenVerify] = useState(false);
    const [selectedVerifyId, setSelectedVerifyId] = useState<number | null>(null);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter()

    const { data: kodeKeperluanData, isLoading: isLoadingKode } = useSWR<KodeKeperluan[]>("/api/gudang/kodekeper", fetcher);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id_kodekeper: "",
        },
    });

    const verifyAction = async (values: z.infer<typeof formSchema>) => {
        if (selectedVerifyId === null) return;

        setIsPending(true);
        startTransition(async () => {
            const result = await verifyBarangKeluarItem(String(selectedVerifyId), values);
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

    const handleCloseVerify = () => {
        setOpenVerify(false);
        form.reset();
    }

    return (
        <>
            <Button onClick={() => setOpenDetail(true)} variant="ghost" title="Verifikasi per item">
                <ListChecks className="h-4 w-4" />
            </Button>

            {/* Modal Detail */}
            <CustomModal
                isOpen={openDetail}
                onClose={() => {
                    if (!openVerify) setOpenDetail(false);
                }}
                title="Verifikasi Barang Keluar"
                description="Verifikasi item barang keluar"
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
                                                    variant={barang.kodekeper_kode ? "default" : "destructive"}
                                                    size="sm"
                                                    className={barang.kodekeper_kode ? "bg-green-600 hover:bg-green-700" : ""}
                                                    onClick={() => {
                                                        setSelectedVerifyId(barang.id_fifo);
                                                        setOpenVerify(true);
                                                    }}
                                                >
                                                    {barang.kodekeper_kode || "Belum Diverifikasi"}
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

            {/* Modal Verifikasi dengan Kode Keperluan */}
            {kodeKeperluanData ? (
                <CustomModal
                    isOpen={openVerify}
                    onClose={handleCloseVerify}
                    title="Verifikasi Item"
                    description="Pilih Kode Keperluan untuk memverifikasi item ini."
                    footer={
                        <>
                            <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleCloseVerify}>
                                Close
                            </Button>
                            <Button type="button" onClick={form.handleSubmit(verifyAction)} disabled={isPending}>
                                {isPending ? "Menyimpan..." : "Verifikasi"}
                            </Button>
                        </>
                    }
                >
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
                                                options={kodeKeperluanData.map((kode) => ({
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
                    isOpen={openVerify}
                    onClose={handleCloseVerify}
                    title="Verifikasi Item"
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
                    </div>
                </CustomModal>
            )}
        </>
    );
}
