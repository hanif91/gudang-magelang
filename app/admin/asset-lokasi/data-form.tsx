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
import { createAssetLokasi, editAssetLokasi } from "@/lib/actions/actAssetLokasi"
import AxiosClient from "@/lib/AxiosClient"
import { Combobox } from "@/components/ui/combobox"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"


interface Wilayah {
  id: string;
  nama: string;
}

const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data.data)



export default function AssetLokasiForm({ asset_lokasi }: { asset_lokasi?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const { data: listWilayah, isLoading: isLoadingWilayah } = useSWR<Wilayah[]>('/api/gudang/asset-wilayah', fetcher)


  const formSchema = z.object({
    wilayah_id: z.coerce.number().min(1, "Wilayah is required"),
    nama: z.string().min(1, "Nama is required"),
    aktif: z.union([z.literal("1"), z.literal("0")]),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wilayah_id: asset_lokasi?.wilayah_id ?? "",
      nama: asset_lokasi?.nama ?? "",
      aktif: asset_lokasi?.aktif?.toString() ?? "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      // const formData = serialize(values)
      const data = asset_lokasi ? await editAssetLokasi(asset_lokasi.id, values) : await createAssetLokasi(values)

      if (data.success) {
        toast({
          variant: "default",
          description: "Data Asset Lokasi berhasil disimpan!",
        })
        router.push("/admin/asset-lokasi")
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

  if (!listWilayah || isLoadingWilayah) return (
    <main className="flex flex-col gap-5 justify-center content-center p-5">
      <Card className="w-full">
        <CardHeader />
        <CardContent className="space-y-4">
          {/* Skeleton untuk Wilayah */}
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
        <FormField control={form.control} name="wilayah_id" render={({ field }) => {
          return (
            <FormItem>
              <FormLabel>Wilayah</FormLabel>
              <FormControl>
                {/* <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Wilayah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {listWilayah && listWilayah?.map((wilayah) => (
                        <SelectItem key={wilayah.id} value={wilayah.id.toString()}>{wilayah.nama}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select> */}
                <Combobox
                  emptyText={isLoadingWilayah ? "Loading" : "Tidak ada data"}
                  options={
                    listWilayah.map((wilayah) => ({
                      value: wilayah.id.toString(),
                      label: wilayah.nama,
                    }))
                  }
                  value={field.value?.toString() || ""}
                  onChange={(value) => field.onChange(Number(value))}
                  placeholder="Pilih Wilayah"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }} />
        <FormField control={form.control} name="nama" render={({ field }) => (
          <FormItem>
            <FormLabel>Nama</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Nama Lokasi" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
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
