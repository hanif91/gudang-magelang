"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateReturBarang } from "@/lib/actions/actReturBarang";
import useSWR from "swr";
import AxiosClient from "@/lib/AxiosClient";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data);

const formSchema = z.object({
    tanggal: z.string().min(1, "Tanggal is required"),
    keterangan: z.string().optional(),
    supplier_id: z.coerce.number().min(1, "Supplier harus dipilih"),
    items: z.array(
        z.object({
            barang_id: z.string().min(1, "Barang harus dipilih"),
            qty: z.coerce.number().min(1, "Qty harus lebih dari 0"),
            harga_beli: z.coerce.number().min(1, "Harga beli harus lebih dari 0"),
        })
    ).min(1, "Minimal satu barang harus dipilih"),
});

export default function EditReturBarangForm({ initialData }: { initialData: any }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const { data: barangData, isLoading: isLoadingBarang, error: errorBarang } = useSWR('/api/gudang/barang', fetcher);
    const { data: supplierData, isLoading: isLoadingSupplier, error: errorSupplier } = useSWR('/api/gudang/supplier', fetcher);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tanggal: initialData.tanggal
                ? new Date(initialData.tanggal).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            keterangan: initialData.keterangan || "",
            supplier_id: initialData.items?.[0]?.id_supplier || 0,
            items: initialData.items?.map((item: any) => ({
                barang_id: item.id_barang?.toString() || "",
                qty: parseFloat(item.qty_op) || 0,
                harga_beli: parseFloat(item.harga_beli) || 0,
            })) || [{ barang_id: "", qty: 0, harga_beli: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const formatHarga = (harga: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(harga);
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        try {
            startTransition(async () => {
                console.log("Form Data:", values);

                const payload = {
                    ...values,
                    noop: initialData.noop,
                    items: values.items.map(item => ({
                        barang_id: Number(item.barang_id),
                        qty: item.qty,
                        harga_beli: item.harga_beli,
                    })),
                };

                const data = await updateReturBarang(initialData.items?.[0]?.id_op?.toString(), payload);

                if (data.success) {
                    toast({ variant: "default", description: "Data retur barang berhasil diperbarui!" });
                    router.push("/admin/retur-barang");
                    router.refresh();
                } else {
                    toast({ variant: "destructive", description: data.message });
                }
            });
        } catch (error) {
            console.error("Error submitting form:", error);
            toast({ variant: "destructive", description: "Gagal menyimpan data. Silakan coba lagi." });
        }
    }

    if (errorBarang || errorSupplier) return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardHeader />
                <CardContent>
                    <p className="text-red-500">Gagal memuat data. Silakan coba lagi.</p>
                </CardContent>
                <CardFooter />
            </Card>
        </main>
    );

    if (isLoadingBarang || isLoadingSupplier) return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardHeader />
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4 rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4 rounded-md" />
                        <Skeleton className="h-20 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4 rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-1/3 rounded-md" />
                        <div className="flex space-x-4 items-end">
                            <div className="w-1/3 space-y-2">
                                <Skeleton className="h-4 w-1/4 rounded-md" />
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                            <div className="w-1/3 space-y-2">
                                <Skeleton className="h-4 w-1/4 rounded-md" />
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                            <div className="w-1/3 space-y-2">
                                <Skeleton className="h-4 w-1/4 rounded-md" />
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                            <Skeleton className="h-10 w-24 rounded-md" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-36 rounded-md" />
                    <div className="flex justify-end">
                        <Skeleton className="h-10 w-24 rounded-md" />
                    </div>
                </CardContent>
                <CardFooter />
            </Card>
        </main>
    );

    const onError = (errors: any) => {
        console.log("Validation Errors:", errors);
        toast({
            variant: "destructive",
            title: "Validasi Gagal",
            description: "Mohon periksa kembali inputan anda.",
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-5">
                <FormField
                    control={form.control}
                    name="tanggal"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tanggal</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Input Keterangan (Opsional) */}
                <FormField
                    control={form.control}
                    name="keterangan"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Keterangan (Opsional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Masukkan keterangan (opsional)"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Combobox Supplier */}
                <FormField
                    control={form.control}
                    name="supplier_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Supplier</FormLabel>
                            <FormControl>
                                <Combobox
                                    emptyText={isLoadingSupplier ? "Loading..." : "Tidak ada data"}
                                    options={supplierData?.data?.map((supplier: any) => ({
                                        value: supplier.id.toString(),
                                        label: supplier.nama,
                                    })) || []}
                                    value={field.value?.toString() || ""}
                                    onChange={(value) => field.onChange(Number(value))}
                                    placeholder="Pilih Supplier"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <label className="text-lg font-semibold">Detail Retur Barang</label>
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex space-x-4 items-end">
                            <FormField
                                control={form.control}
                                name={`items.${index}.barang_id`}
                                render={({ field }) => {
                                    // Ambil daftar barang_id yang sudah dipilih, kecuali untuk item saat ini
                                    const selectedBarangIds = form.getValues("items")
                                        .filter((_, i) => i !== index)
                                        .map((item) => Number(item.barang_id));

                                    // Filter daftar barang agar hanya menampilkan yang belum dipilih
                                    const availableBarang = barangData?.data?.filter((barang: any) => {
                                        return !selectedBarangIds.includes(Number(barang.id));
                                    });

                                    return (
                                        <FormItem className="w-1/3">
                                            {index === 0 && <FormLabel>Barang</FormLabel>}
                                            <FormControl>
                                                <Combobox
                                                    options={availableBarang?.map((barang: any) => ({
                                                        value: barang.id.toString(),
                                                        label: barang.nama,
                                                    })) || []}
                                                    value={field.value}
                                                    onChange={(value) => {
                                                        field.onChange(value);
                                                    }}
                                                    placeholder="Pilih Barang"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                            <FormField
                                control={form.control}
                                name={`items.${index}.qty`}
                                render={({ field }) => (
                                    <FormItem className="w-1/3">
                                        {index === 0 && <FormLabel>Qty</FormLabel>}
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Qty"
                                                {...field}
                                                value={field.value === 0 ? "" : field.value}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "") {
                                                        field.onChange(0);
                                                        return;
                                                    }
                                                    field.onChange(Number(val));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`items.${index}.harga_beli`}
                                render={({ field }) => {
                                    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                        const numericValue = Number(rawValue);
                                        field.onChange(numericValue);
                                    };
                                    return (
                                        <FormItem className="w-1/3">
                                            {index === 0 && <FormLabel>Harga Beli</FormLabel>}
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Harga Beli"
                                                    value={field.value === 0 ? "" : formatHarga(field.value)}
                                                    onChange={handleChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => remove(index)}
                                >
                                    Hapus
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                <Button
                    type="button"
                    onClick={() => append({ barang_id: "", qty: 0, harga_beli: 0 })}
                >
                    Tambah Barang
                </Button>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
