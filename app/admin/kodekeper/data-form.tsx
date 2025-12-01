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
import { createKodekeper, editKodekeper } from "@/lib/actions/actKodekeper"
import { Combobox } from "@/components/ui/combobox"


export default function KodekeperForm({ kodekeper }: { kodekeper?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const formSchema = z.object({
    nama: z.string().min(1, "Date is required"),
    kode: z.string().min(1, "Date is required"),

  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: kodekeper?.nama ?? "",
      kode: kodekeper?.kode ?? "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      // const formData = serialize(values)
      const data = kodekeper ? await editKodekeper(kodekeper.id, values) : await createKodekeper(values)

      if (data.success) {
        toast({
          variant: "default",
          description: "Data Kodekeper berhasil disimpan!",
        })
        router.push("/admin/kodekeper")
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
              <Input type="text" placeholder="Nama Kode Keperluan" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="kode" render={({ field }) => (
          <FormItem>
            <FormLabel>Kode</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Kode Keperluan" {...field} />
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