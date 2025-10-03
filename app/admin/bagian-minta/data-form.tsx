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
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { serialize } from "object-to-formdata"
import { createStock, editStock } from "@/lib/actions/actStock"
import { createBagianMinta, editBagianMinta } from "@/lib/actions/actBagianMinta"


export default function BagianMintaForm({ bagian_minta }: { bagian_minta?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const formSchema = z.object({
    nama: z.string().min(1, "Nama is required"),
    namattd: z.string().min(1, "Namattd is required"),
    jabatanttd: z.string().min(1, "Jabatan is required"),
    nikttd: z.string().min(1, "Nik is required"),

  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: bagian_minta?.nama ?? "",
      namattd: bagian_minta?.namattd ?? "",
      jabatanttd: bagian_minta?.jabatanttd ?? "",
      nikttd: bagian_minta?.nikttd ?? "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = serialize(values)
      const data = bagian_minta ? await editBagianMinta(bagian_minta.id, formData) : await createBagianMinta(formData)

      if (data.success) {
        toast({
          variant: "default",
          description: "Data BagianMinta berhasil disimpan!",
        })
        router.push("/admin/bagian-minta")
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
            <FormLabel>Nama</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Nama Bagian" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="namattd" render={({ field }) => (
          <FormItem>
            <FormLabel>Nama TTD</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Nama yang bertanda tangan" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="jabatanttd" render={({ field }) => (
          <FormItem>
            <FormLabel>Jabatan TTD</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Jabatan yang bertanda tangan" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="nikttd" render={({ field }) => (
          <FormItem>
            <FormLabel>NIK TTD</FormLabel>
            <FormControl>
              <Input type="text" placeholder="NIK yang bertanda tangan" {...field} />
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