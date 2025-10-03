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
import { createStock, editStock } from "@/lib/actions/actStock"
import useSWR from "swr"
import axios from "axios"
import { createSupplier, editSupplier } from "@/lib/actions/actSupplier"
import { Combobox } from "@/components/ui/combobox"


export default function SupplierForm({ supplier }: { supplier?: any }) {
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
      nama: supplier?.nama ?? "",
      aktif: supplier?.aktif?.toString() ?? "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = serialize(values)
      const data = supplier ? await editSupplier(supplier.id, formData) : await createSupplier(formData)

      if (data.success) {
        toast({
          variant: "default",
          description: "Data Supplier berhasil disimpan!",
        })
        router.push("/admin/supplier")
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
            <FormLabel>Nama Supplier</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Nama Supplier" {...field} />
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