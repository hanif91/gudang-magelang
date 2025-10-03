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
import { serialize } from "object-to-formdata"
import { createMerek, editMerek } from "@/lib/actions/actMerek"
import useSWR, { mutate } from "swr"
import { createJenis, editJenis } from "@/lib/actions/actJenis"
import axios from "axios"
import { Combobox } from "@/components/ui/combobox"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"


interface Kategori {
  id: string;
  nama: string;
}

const fetcher = (url: any) => axios.get(url).then(res => res.data)



export default function JenisForm({ jenis }: { jenis?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const { data: listKategori, isLoading: isLoadingKategori, error: errorKategori } = useSWR('/api/kategori', fetcher)


  const formSchema = z.object({
    kategori_id: z.coerce.number().min(1, "Kategori is required"),
    nama: z.string().min(1, "Nama is required"),
    aktif: z.union([z.literal("1"), z.literal("0")]),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kategori_id: jenis?.kategori_id ?? "",
      nama: jenis?.nama ?? "",
      aktif: jenis?.aktif?.toString() ?? "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = serialize(values)
      const data = jenis ? await editJenis(jenis.id, formData) : await createJenis(formData)

      if (data.success) {
        toast({
          variant: "default",
          description: "Data Jenis berhasil disimpan!",
        })
        router.push("/admin/jenis")
        // mutate('/api/merek')
        router.refresh

      } else {
        toast({
          variant: "destructive",
          description: data.message,
        })
      }
    })
  }

  if (errorKategori) return (
    <main className="flex flex-col gap-5 justify-center content-center p-5">
      <Card className="w-full">
        <CardHeader />
        <CardContent className="space-y-4">
          {/* Skeleton untuk Kategori */}
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

  if (isLoadingKategori) return (
    <main className="flex flex-col gap-5 justify-center content-center p-5">
      <Card className="w-full">
        <CardHeader />
        <CardContent className="space-y-4">
          {/* Skeleton untuk Kategori */}
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
        <FormField control={form.control} name="kategori_id" render={({ field }) => {
          return (
            <FormItem>
              <FormLabel>Jenis</FormLabel>
              <FormControl>
                {/* <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {listKategori && listKategori?.map((kategori) => (
                        <SelectItem key={kategori.id} value={kategori.id.toString()}>{kategori.nama}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select> */}
                <Combobox
                  emptyText={isLoadingKategori ? "Loading" : "Tidak ada data"}
                  options={
                    listKategori?.data?.map((kategori: any) => ({
                      value: kategori.id.toString(),
                      label: kategori.nama,
                    })) || []
                  }
                  value={field.value?.toString() || ""}
                  onChange={(value) => field.onChange(Number(value))}
                  placeholder="Pilih Supplier"
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
              <Input type="text" placeholder="Nama Barang" {...field} />
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
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
