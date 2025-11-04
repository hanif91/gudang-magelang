"use client"

import { useRouter } from "next/navigation"
import { useTransition, useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { serialize } from "object-to-formdata"
import { createPembelianItem, editPembelianItem } from "@/lib/actions/actPembelianItem"
import axios from "axios"
import useSWR from "swr"
import { Combobox } from "@/components/ui/combobox"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Dpb {
  id: number
  nodpb: string
  barang: Barang[]
}

interface Supplier {
  id: number
  nama: string
}

interface User {
  id: number
  nama: string
}

interface Barang {
  id: number
  id_nodpb: number
  // dpb_id: number
  nama_barang: string
  tanggal: string
  qty: string
  nama_user: string
  satuan_barang: string
  minimal_stok_barang: number
  harga_jual_barang: string
  foto_barang: string | null
  nama_jenis: string
  nama_kategori: string
  nama_merek: string
}

const fetcher = (url: any) =>
  axios.get(url).then((res) => res.data.data)

// Karena qty tidak akan diinput, schema hanya memerlukan harga_beli untuk tiap barang
const formSchema = z.object({
  dpb_id: z.coerce.number().min(1, "Id DPB is required"),
  no_pembelian: z.string().min(1, "No Pembelian is required"),
  // no_voucher: z.string().min(1, "No Voucher is required"),
  supplier_id: z.coerce.number().min(1, "Supplier is required"),
  // tanggal : z.string().min("Tanggal required")
  // user_id: z.coerce.number().min(1, "User is required"),
  tanggal: z.string().min(1, "Tanggal is required"),
  barang: z.array(
    z.object({
      dpb_id: z.coerce.number().min(1, "DPB ID is required"),
      barang_id: z.coerce.number().min(1, "Barang is required"),
      qty: z.coerce.number().min(1, "Qty is required"),
      harga_beli: z.coerce.number().min(1, "Harga beli harus lebih dari 0"),
    })
  ).min(1, "Pilih minimal 1 barang"),
  keterangan: z.string().optional()
})

export default function PembelianForm({ pembelian }: { pembelian?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const { data, isLoading, error } = useSWR("/api/dpb/rekanan", fetcher)
  const { data: listSupplier, isLoading: isLoadingSupplier, error: errorSupplier } = useSWR("/api/supplier", fetcher)
  // const { data: listUsers } = useSWR<User[]>("/api/users", fetcher)
  const [selectedDpb, setSelectedDpb] = useState<Dpb | null>(null)
  const [grandTotal, setGrandTotal] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dpb_id: pembelian?.dpb_id ? pembelian.dpb_id : "",
      no_pembelian: pembelian?.no_pembelian ?? "",
      // no_voucher: pembelian?.no_voucher ?? "",
      supplier_id: pembelian?.supplier_id ?? "",
      tanggal: pembelian?.tanggal ? new Date(pembelian.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      // user_id: pembelian?.user_id ?? "",
      barang: pembelian?.barang
        ? pembelian.barang.map((item: { barang_id: number; qty: number; harga_beli: number, dpb_id: number }) => ({
          dpb_id: item.dpb_id,
          barang_id: item.barang_id,
          qty: item.qty,
          harga_beli: item.harga_beli,
        }))
        : [],
      keterangan: pembelian?.keterangan ?? "",
    },
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "barang",
  })

  // Fungsi untuk menghitung grand total berdasarkan input harga_beli dan qty dari data DPB
  const hitungGrandTotal = () => {
    const barangValues = form.getValues("barang")
    const total = barangValues.reduce((acc: number, item: any, index: number) => {
      // Cari barang asli untuk mendapatkan nilai qty dari data DPB
      const barangData = selectedDpb?.barang.find(b => b.id === item.barang_id)
      const qty = barangData ? Number(barangData.qty) : 0
      return acc + (Number(item.harga_beli) * qty)
    }, 0)
    setGrandTotal(total)
  }

  // Update grand total saat nilai harga_beli berubah
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("barang")) {
        hitungGrandTotal()
      }
    })
    return () => subscription.unsubscribe()
  }, [form, selectedDpb])

  if (error || errorSupplier) {
    console.log('Error loading data:', { error, errorSupplier });
    return (
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader />
          <CardContent>
            <p className="text-red-500">Gagal memuat data. Silakan coba lagi.</p>
            <p className="text-sm text-gray-500 mt-2">
              Error: {error?.message || errorSupplier?.message}
            </p>
          </CardContent>
          <CardFooter />
        </Card>
      </main>
    );
  }

  if (isLoading || isLoadingSupplier || !data || !listSupplier) {
    console.log('Loading state:', { isLoading, isLoadingSupplier, hasData: !!data, hasSupplier: !!listSupplier });
    return (
      <main className='flex flex-col gap-5 justify-center content-center p-5'>
        <Card className='w-full'>
          <CardHeader />
          <CardContent className='space-y-4'>
            {/* Skeleton untuk Tanggal */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-1/4 rounded-md' />
              <Skeleton className='h-10 w-full rounded-md' />
            </div>

            {/* Skeleton untuk No Pembelian */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-1/4 rounded-md' />
              <Skeleton className='h-10 w-full rounded-md' />
            </div>

            {/* Skeleton untuk No Voucher */}
            {/* <div className='space-y-2'>
              <Skeleton className='h-4 w-1/4 rounded-md' />
              <Skeleton className='h-10 w-full rounded-md' />
            </div> */}

            {/* Skeleton untuk Supplier */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-1/4 rounded-md' />
              <Skeleton className='h-10 w-full rounded-md' />
            </div>

            {/* Skeleton untuk Keterangan */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-1/4 rounded-md' />
              <Skeleton className='h-20 w-full rounded-md' />
            </div>

            {/* Skeleton untuk No DPB */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-1/4 rounded-md' />
              <Skeleton className='h-10 w-full rounded-md' />
            </div>

            {/* Skeleton untuk Tabel Barang */}
            <div className='space-y-2'>
              <Skeleton className='h-6 w-1/3 rounded-md' /> {/* Label */}
              <div className='space-y-2'>
                {/* Header Tabel */}
                <div className='flex space-x-2'>
                  <Skeleton className='h-4 w-1/4 rounded-md' />
                  <Skeleton className='h-4 w-1/4 rounded-md' />
                  <Skeleton className='h-4 w-1/4 rounded-md' />
                  <Skeleton className='h-4 w-1/4 rounded-md' />
                </div>
                {/* Baris Tabel */}
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className='flex space-x-2'>
                    <Skeleton className='h-10 w-1/4 rounded-md' />
                    <Skeleton className='h-10 w-1/4 rounded-md' />
                    <Skeleton className='h-10 w-1/4 rounded-md' />
                    <Skeleton className='h-10 w-1/4 rounded-md' />
                  </div>
                ))}
              </div>
            </div>

            {/* Skeleton untuk Tombol Submit */}
            <div className='flex justify-end'>
              <Skeleton className='h-10 w-24 rounded-md' />
            </div>
          </CardContent>
          <CardFooter />
        </Card>
      </main>
    );
  }

  const handleNoDPBChange = (dpbId: string) => {
    const selected = data?.find((dpb: any) => dpb.id === Number(dpbId));
    if (selected) {
      setSelectedDpb(selected);
      form.setValue('dpb_id', selected.id);
      // Setiap barang default: harga_beli = 0. Qty tidak diinput, ambil dari data DPB.
      form.setValue(
        'barang',
        selected.barang.map((barang: any) => ({
          dpb_id: barang.id_nodpb,
          barang_id: barang.id,
          harga_beli: 0,
          qty: Number(barang.qty),
        })),
      );
    } else {
      setSelectedDpb(null);
      form.setValue('dpb_id', NaN);
      form.setValue('barang', []);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('onSubmit called with values:', values);
    
    startTransition(async () => {
      try {
        console.log('Before serialize values:', values);
        const formData = serialize(values);
        console.log('After serialize formData:', formData);
        
        console.log('Calling API - pembelian exists:', !!pembelian);
        const dataResponse = pembelian
          ? await editPembelianItem(pembelian.id, formData)
          : await createPembelianItem(formData);

        console.log('API Response:', dataResponse);
        
        if (dataResponse.success) {
          toast({
            variant: 'default',
            description: 'Data Pembelian berhasil disimpan!',
          });
          const tanggal = form.getValues('tanggal');
          router.push(`/admin/pembelian?start=${tanggal}&end=${tanggal}`);
          router.refresh();
        } else {
          toast({
            variant: 'destructive',
            description: dataResponse.message || 'Terjadi kesalahan saat menyimpan data',
          });
        }
      } catch (error) {
        console.error('Error in onSubmit:', error);
        toast({
          variant: 'destructive',
          description: 'Terjadi kesalahan sistem. Silakan coba lagi.',
        });
      }
    });
  }

  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(harga);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
        <FormField
          control={form.control}
          name='tanggal'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Input No Pembelian */}
        <FormField
          control={form.control}
          name='no_pembelian'
          render={({ field }) => (
            <FormItem>
              <FormLabel>No Pembelian</FormLabel>
              <FormControl>
                <Input
                  type='text'
                  placeholder='Masukkan No Pembelian'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Input No Voucher */}
        {/* <FormField
          control={form.control}
          name='no_voucher'
          render={({ field }) => (
            <FormItem>
              <FormLabel>No Voucher</FormLabel>
              <FormControl>
                <Input
                  type='text'
                  placeholder='Masukkan No Voucher'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        {/* Combobox Supplier */}
        <FormField
          control={form.control}
          name='supplier_id'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <FormControl>
                <Combobox
                  emptyText={isLoadingSupplier ? 'Loading' : 'Tidak ada data'}
                  options={listSupplier.map((supplier: any) => ({
                    value: supplier.id.toString(),
                    label: supplier.nama,
                  }))}
                  value={field.value?.toString() || ''}
                  onChange={(value) => field.onChange(Number(value))}
                  placeholder='Pilih Supplier'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Input Keterangan */}
        <FormField
          control={form.control}
          name='keterangan'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Masukkan Keterangan (opsional)'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Combobox NoDPB */}
        <FormField
          control={form.control}
          name='dpb_id'
          render={({ field }) => (
            <FormItem>
              <FormLabel>No DPB</FormLabel>
              <FormControl>
                <Combobox
                  // emptyText={isLoading ? "Loading..." : "Tidak ada data"}
                  options={data.map((dpb: any) => ({
                    value: dpb.id.toString(),
                    label: dpb.nodpb,
                  }))}
                  value={field.value?.toString() || ''}
                  onChange={(value) => {
                    field.onChange(Number(value)); // Atur nilai dpb_id di level atas
                    handleNoDPBChange(value); // Panggil handleNoDPBChange
                  }}
                  placeholder='Pilih No DPB'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tampilkan Daftar Barang menggunakan table dari shadcn/ui */}
        {selectedDpb && (
          <div className='mt-6'>
            <h3 className='text-lg font-semibold mb-4'>Daftar Barang:</h3>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Merek</TableHead>
                    <TableHead>Harga Jual</TableHead>
                    <TableHead>Harga Beli</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Total Harga</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDpb.barang.map((barang, index) => {
                    const hargaBeli =
                      Number(form.getValues(`barang.${index}.harga_beli`)) || 0;
                    const qtyPembelian = Number(barang.qty);
                    const totalHarga = hargaBeli * qtyPembelian;

                    return (
                      <TableRow key={barang.id}>
                        <TableCell>{barang.nama_barang}</TableCell>
                        <TableCell>{barang.satuan_barang}</TableCell>
                        <TableCell>{barang.nama_kategori}</TableCell>
                        <TableCell>{barang.nama_merek}</TableCell>
                        <TableCell>
                          {formatHarga(Number(barang.harga_jual_barang))}
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`barang.${index}.harga_beli` as const}
                            render={({ field }) => {
                              const handleChange = (
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) => {
                                const rawValue = e.target.value.replace(
                                  /[^0-9]/g,
                                  '',
                                );
                                const numericValue = Number(rawValue);
                                field.onChange(numericValue);
                              };
                              return (
                                <FormItem className='m-0'>
                                  <FormControl>
                                    <Input
                                      type='text'
                                      placeholder='Harga Beli'
                                      value={formatHarga(field.value)}
                                      onChange={handleChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>{barang.qty}</TableCell>
                        <TableCell>{formatHarga(totalHarga)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Baris untuk Grand Total */}
                  <TableRow>
                    <TableCell colSpan={7} className='font-bold text-right'>
                      Grand Total:
                    </TableCell>
                    <TableCell className='font-bold'>
                      {formatHarga(grandTotal)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Tombol Submit */}
        <div className='flex justify-end'>
          <Button 
            type='submit' 
            disabled={isPending}
            onClick={() => {
              console.log('Submit button clicked');
              console.log('Form errors:', form.formState.errors);
              console.log('Form values:', form.getValues());
            }}
          >
            {isPending ? 'Menyimpan...' : 'Submit'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
