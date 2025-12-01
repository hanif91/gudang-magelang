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
import { mutate } from "swr"
import { createUserParaf, editUserParaf } from "@/lib/actions/actUserParaf"

export default function UserParafForm({ userParaf }: { userParaf?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const formSchema = z.object({
    nama: z.string().min(1, "Nama is required"),
    jabatan: z.string().min(1, "Jabatan is required"),
    nik: z.string().min(1, "NIK is required"),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: userParaf?.nama ?? "",
      jabatan: userParaf?.jabatan ?? "",
      nik: userParaf?.nik ?? "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      // const formData = serialize(values)
      const data = userParaf ? await editUserParaf(userParaf.id, values) : await createUserParaf(values)

      if (data.success) {
        toast({
          variant: "default",
          description: "Data User Paraf berhasil disimpan!",
        })
        router.push("/admin/user-paraf")
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField control={form.control} name="nama" render={({ field }) => (
          <FormItem>
            <FormLabel>Nama</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Nama" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="jabatan" render={({ field }) => (
          <FormItem>
            <FormLabel>Jabatan</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Nama Jabatan" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="nik" render={({ field }) => (
          <FormItem>
            <FormLabel>NIK</FormLabel>
            <FormControl>
              <Input type="text" placeholder="NIK" {...field} />
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
