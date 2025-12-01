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

import { createAssetWilayah, editAssetWilayah } from "@/lib/actions/actAssetWilayah"
import { Combobox } from "@/components/ui/combobox"


export default function AssetWilayahForm({ asset_wilayah }: { asset_wilayah?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const formSchema = z.object({
    nama: z.string().min(1, "Date is required"),
    aktif: z.union([z.literal("1"), z.literal("0")]),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: asset_wilayah?.nama ?? "",
      aktif: asset_wilayah?.aktif?.toString() ?? "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      // const formData = serialize(values)
      const data = asset_wilayah ? await editAssetWilayah(asset_wilayah.id, values) : await createAssetWilayah(values)

      if (data.success) {
        toast({
          variant: "default",
          description: "Data Asset Wilayah berhasil disimpan!",
        })
        router.push("/admin/asset-wilayah")
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          description: data.message,
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

        <FormField control={form.control} name="nama" render={({ field }) => (
          <FormItem>
            <FormLabel>Nama Asset</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Nama Asset Wilayah" {...field} />
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