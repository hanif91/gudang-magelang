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
import { createMerek, editMerek } from "@/lib/actions/actMerek"
import useSWR, { mutate } from "swr"
import { createAssetPerpipaan, editAssetPerpipaan } from "@/lib/actions/actAssetPerpipaan"
import AxiosClient from "@/lib/AxiosClient"
import { Combobox } from "@/components/ui/combobox"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"


interface Lokasi {
  id: string;
  nama: string;
}

const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data.data)



export default function AssetPerpipaanForm({ asset_perpipaan }: { asset_perpipaan?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const { data: listLokasi, isLoading: isLoadingLokasi } = useSWR<Lokasi[]>('/api/gudang/asset-lokasi', fetcher)


  const formSchema = z.object({
    tanggal: z.string().min(1, "Tanggal is required"),
    nama: z.string().min(1, "Nama is required"),
    alamat: z.string().min(1, "Alamat is required"),
    nilai: z.coerce.number().min(1, "Nilai harus lebih dari 0"),
    lokasi_id: z.coerce.number().min(1, "Lokasi is required"),
    aktif: z.union([z.literal("1"), z.literal("0")]),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lokasi_id: asset_perpipaan?.lokasi_id ?? "",
      alamat: asset_perpipaan?.alamat ?? "",
      tanggal: asset_perpipaan?.tanggal ? new Date(asset_perpipaan.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      nilai: asset_perpipaan?.nilai ?? "",
      nama: asset_perpipaan?.nama ?? "",
      aktif: asset_perpipaan?.aktif?.toString() ?? "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      // const formData = serialize(values)
      const data = asset_perpipaan ? await editAssetPerpipaan(asset_perpipaan.id, values) : await createAssetPerpipaan(values)

      if (data.success) {
        toast({
          variant: "default",
          description: "Data Asset Perpipaan berhasil disimpan!",
        })
        router.push("/admin/asset-perpipaan")
        // mutate('/api/gudang/merek')
        router.refresh

      } else {
        toast({
          variant: "destructive",
          description: data.message,
        })
      }
    })
  }

  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(harga)
  }


  if (!listLokasi || isLoadingLokasi) return (
    <main className="flex flex-col gap-5 justify-center content-center p-5">
      <Card className="w-full">
        <CardHeader />
        <CardContent className="space-y-4">
          {/* Skeleton untuk Lokasi */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Skeleton untuk Nama */}
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
        <FormField control={form.control} name="tanggal" render={({ field }) => (
          <FormItem>
            <FormLabel>Tanggal</FormLabel>
            <FormControl>
              <Input type="date" placeholder="Tanggal" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="nama" render={({ field }) => (
          <FormItem>
            <FormLabel>Nama</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Nama" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="alamat" render={({ field }) => (
          <FormItem>
            <FormLabel>Alamat</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Alamat" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="nilai" render={({ field }) => {
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            // Hapus karakter yang bukan angka
            const rawValue = e.target.value.replace(/[^0-9]/g, "")
            // Konversi ke number
            const numericValue = Number(rawValue)
            field.onChange(numericValue)
          }
          return (
            <FormItem>
              <FormLabel>Nilai</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Nilai"
                  // Tampilkan nilai yang diformat ke rupiah
                  value={field.value ? formatHarga(field.value) : ""}
                  onChange={handleChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }} />

        <FormField control={form.control} name="lokasi_id" render={({ field }) => {
          return (
            <FormItem>
              <FormLabel>Lokasi</FormLabel>
              <FormControl>
                {/* <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Lokasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {listLokasi && listLokasi?.map((kategori) => (
                        <SelectItem key={kategori.id} value={kategori.id.toString()}>{kategori.nama}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select> */}
                <Combobox
                  emptyText={isLoadingLokasi ? "Loading" : "Tidak ada data"}
                  options={
                    listLokasi.map((kategori) => ({
                      value: kategori.id.toString(),
                      label: kategori.nama,
                    }))
                  }
                  value={field.value?.toString() || ""}
                  onChange={(value) => field.onChange(Number(value))}
                  placeholder="Pilih Lokasi"
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
              {/* <Select onValueChange={field.onChange} value={field.value} >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">Aktif</SelectItem>
                    <SelectItem value="0">Tidak Aktif</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select> */}

              <Combobox
                options={[{ label: "Aktif", value: "1" }, { label: "Tidak Aktif", value: "0" }]}
                value={field.value?.toString() || ""}
                onChange={(value) => field.onChange(value)}
                placeholder="Pilih Status"
              />
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
