"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
// import { serialize } from "object-to-formdata"
import { createStock, editStock } from "@/lib/actions/actStock"
import useSWR from "swr"
import AxiosClient from "@/lib/AxiosClient"
import { Combobox } from "@/components/ui/combobox"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Barang {
  id: string;
  nama: string;
}

const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data.data)

export default function StockForm({ stock }: { stock?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const { data: listBarang, isLoading: isLoadingBarang } = useSWR<Barang[]>('/api/gudang/barang', fetcher)

  const formSchema = z.object({
    barang_id: z.coerce.number().min(1, "Kategori is required"),
    qty: z.coerce.number().min(1, "Qty is required"),
    tanggal_masuk: z.string().min(1, "Date is required"),
    harga_masuk: z.coerce.number().min(1, "Harga masuk is required"),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      barang_id: stock?.barang_id ?? "",
      qty: stock?.qty ?? 1,
      tanggal_masuk: stock?.tanggal_masuk ? new Date(stock.tanggal_masuk).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      harga_masuk: stock?.harga_masuk ?? 0
    },
  })

  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(harga)
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      // const formData = serialize(values)
      const data = stock ? await editStock(stock.id, values) : await createStock(values)

      if (data.success) {
        toast({
          variant: "default",
          description: "Data Stock berhasil disimpan!",
        })
        router.push("/admin/stock")
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          description: data.message,
        })
      }
    })
  }

  if (!listBarang) return (
    <main className="flex flex-col gap-5 justify-center content-center p-5">
      <Card className="w-full">
        <CardHeader />
        <CardContent className="space-y-4">
          {/* Skeleton untuk Nama Barang */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Skeleton untuk Qty */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Skeleton untuk Tanggal Masuk */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Skeleton untuk Harga Masuk */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Skeleton untuk Tombol Submit */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </CardContent>
        <CardFooter />
      </Card>
    </main>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField control={form.control} name="barang_id" render={({ field }) => {
          return (
            <FormItem>
              <FormLabel>Nama Barang</FormLabel>
              <FormControl>
                {/* <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Barang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {listBarang && listBarang?.map((barang) => (
                        <SelectItem key={barang.id} value={barang.id.toString()}>{barang.nama}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select> */}

                <Combobox
                  emptyText={isLoadingBarang ? 'Loading' : "Tidak ada data"}
                  options={
                    listBarang?.map((barang) => ({
                      value: barang.id.toString(),
                      label: barang.nama,
                    }))
                  }
                  value={field.value?.toString() || ""}
                  onChange={(value) => field.onChange(Number(value))}
                  placeholder="Pilih Barang"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }} />
        <FormField control={form.control} name="qty" render={({ field }) => (
          <FormItem>
            <FormLabel>Qty</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Qty" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="tanggal_masuk" render={({ field }) => (
          <FormItem>
            <FormLabel>Tanggal Masuk</FormLabel>
            <FormControl>
              <Input type="date" placeholder="Tanggal Masuk" {...field} value={field.value as string} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="harga_masuk" render={({ field }) => {
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            // Hapus karakter yang bukan angka
            const rawValue = e.target.value.replace(/[^0-9]/g, "")
            // Konversi ke number
            const numericValue = Number(rawValue)
            field.onChange(numericValue)
          }
          return (
            <FormItem>
              <FormLabel>Harga</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Harga Jual"
                  // Tampilkan nilai yang diformat ke rupiah
                  value={field.value ? formatHarga(field.value) : ""}
                  onChange={handleChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }} />


        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}  >{isPending ? "Menyimpan..." : "Submit"}</Button>
        </div>
      </form>
    </Form>
  )
}