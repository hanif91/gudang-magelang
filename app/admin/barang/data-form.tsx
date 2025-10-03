"use client"

import { useRouter } from "next/navigation"
import { useTransition, useState, useEffect } from "react"
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
import { serialize } from "object-to-formdata"
import { createBarang, editBarang } from "@/lib/actions/actBarang"
import useSWR from "swr"
import axios from "axios"
import { Combobox } from "@/components/ui/combobox"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"


const fetcher = (url: any) => axios.get(url).then(res => res.data.data)

interface Jenis {
  id: string;
  jenis_nama: string;
}

interface Merek {
  id: string;
  nama: string;
}

export default function BarangForm({ barang }: { barang?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const { data: listJenis, isLoading: isLoadingJenis } = useSWR<Jenis[]>('/api/jenis', fetcher)
  const { data: listMerek, isLoading: isLoadingMerek } = useSWR<Merek[]>('/api/merek', fetcher)


  const formSchema = z.object({
    jenis: z.coerce.number().min(1, "Jenis tidak boleh kosong"),
    merek: z.coerce.number().min(1, "Merek tidak boleh kosong"),
    nama: z.string().min(1, "Nama tidak boleh kosong"),
    satuan: z.string().min(1, "Satuan tidak boleh kosong"),
    minimalStok: z.coerce.number(),
    hargaJual: z.coerce.number(),
    aktif: z.union([z.literal("1"), z.literal("0")]),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:
    {
      jenis: barang?.jenis ?? "", // Pastikan ini adalah `id` (string)
      merek: barang?.merek ?? "", // Pastikan ini adalah `id` (string)
      nama: barang?.nama ?? "",
      satuan: barang?.satuan ?? "",
      minimalStok: barang?.min_stok ?? 0, // Default ke 1, bukan 0
      hargaJual: barang ? Number(barang.harga_jual) : 0, // Default ke 1, bukan 0
      aktif: barang?.status?.toString() ?? "",
    },

  });


  useEffect(() => {
    const selectedJenisId = form.watch("jenis"); // Ambil nilai jenis yang dipilih
    if (selectedJenisId && !barang) {
      // Cari jenis yang sesuai dari listJenis
      const selectedJenis = listJenis?.find((jenis) => jenis.id == selectedJenisId.toString());
      if (selectedJenis != undefined) {
        form.setValue("nama", selectedJenis.jenis_nama);
      }
    }
  }, [barang,listJenis,form]); // Jalankan efek ini setiap kali nilai jenis berubah




  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(harga)
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = serialize(values)
      // console.log(formData)
      const data = barang ? await editBarang(barang.id, formData) : await createBarang(formData)
      if (data.success) {
        toast({
          variant: "default",
          description: "Data barang berhasil disimpan!",
        })
        router.push("/admin/barang")
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          description: data.message,
        })
      }
    })
  }


  if (!listJenis || !listMerek || isLoadingJenis || isLoadingMerek) return (
    <main className="flex flex-col gap-5 justify-center content-center p-5">
      <Card className="w-full">
        <CardHeader />
        <CardContent className="space-y-4">
          {/* Skeleton untuk Jenis */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Skeleton untuk Merek */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Skeleton untuk Nama */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Skeleton untuk Satuan */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Skeleton untuk Minimal Stok */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Skeleton untuk Harga Jual */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Skeleton untuk Status */}
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
        <FormField control={form.control} name="jenis" render={({ field }) => {
          return (
            <FormItem>
              <FormLabel>Jenis</FormLabel>
              <FormControl>
                {/* <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {listJenis && listJenis?.map((jenis) => (
                        <SelectItem key={jenis.id} value={jenis.id.toString()}>{jenis.jenis_nama}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select> */}
                <Combobox
                  options={

                    listJenis.map((jenis) => ({
                      value: jenis.id.toString(),
                      label: jenis.jenis_nama,
                    }))
                  }
                  value={field.value?.toString() || ""}
                  onChange={(value) => field.onChange(Number(value))}
                  placeholder="Pilih Jenis"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }} />

        <FormField control={form.control} name="merek" render={({ field }) => (
          <FormItem>
            <FormLabel>Merek</FormLabel>
            <FormControl>
              {/* <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Merek" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {listMerek && listMerek?.map((merek) => (
                      <SelectItem key={merek.id} value={merek.id.toString()}>{merek.nama}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select> */}
              <Combobox
                options={
                  listMerek.map((merek) => ({
                    value: merek.id.toString(),
                    label: merek.nama.toString(),
                  }))
                }
                value={field.value?.toString() || ""}
                onChange={(value) => field.onChange(value)}
                placeholder="Pilih Merek"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="nama" render={({ field }) => (
          <FormItem>
            <FormLabel>Nama</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Nama Barang" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="satuan" render={({ field }) => (
          <FormItem>
            <FormLabel>Satuan</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Satuan" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="minimalStok" render={({ field }) => (
          <FormItem>
            <FormLabel>Minimal Stok</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Minimal Stok" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="hargaJual" render={({ field }) => {
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            // Hapus karakter yang bukan angka
            const rawValue = e.target.value.replace(/[^0-9]/g, "")
            // Konversi ke number
            const numericValue = Number(rawValue)
            field.onChange(numericValue)
          }
          return (
            <FormItem>
              <FormLabel>Harga Jual</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Harga Jual"
                  value={formatHarga(field.value)}
                  // value={field.value && !isNaN(field.value) ? formatHarga(field.value) : ""}
                  onChange={handleChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }} />

        <FormField control={form.control} name="aktif" render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value} >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">Aktif</SelectItem>
                    <SelectItem value="0">Tidak Aktif</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}  >{isPending ? "Menyimpan..." : "Submit"}</Button>
        </div>
      </form>
    </Form>
  )
}
