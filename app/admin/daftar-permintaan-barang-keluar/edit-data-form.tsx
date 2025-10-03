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
import { createDpb, editDpb } from "@/lib/actions/actDpb"


const fetcher = (url: any) => axios.get(url).then(res => res.data.data)

interface Barang {
    id: string;
    nama: string;
}

interface User {
    id: string;
    nama: string;
}

export default function DaftarPermintaanBarang({ dpb }: { dpb?: any }) {
    const router = useRouter()
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition()
    const { data: listBarang } = useSWR<Barang[]>('/api/barang', fetcher)
    const { data: listUser } = useSWR<User[]>('/api/users', fetcher)


    const formSchema = z.object({
        tanggal: z.string().min(1, "Tanggal is required"),
        barang_id: z.coerce.number().min(1, "Minimal Stok harus lebih dari 0"),
        user_id: z.coerce.number().min(1, "Minimal Stok harus lebih dari 0"),
        qty: z.coerce.number().min(1, "Harga Jual harus lebih dari 0"),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues:
        {
            tanggal: dpb?.tanggal ? new Date(dpb.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            barang_id: dpb?.barang_id ?? "", // Pastikan ini adalah `id` (string)
            user_id: dpb?.user_id ?? "",
            qty: dpb?.qty ?? "",
        },

    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const formData = serialize(values)
            console.log(formData)
            const data = await editDpb(dpb.id, formData)
            if (data.success) {
                toast({
                    variant: "default",
                    description: "Data Daftar Penerimaan Barang berhasil disimpan!",
                })
                router.push("/admin/daftar-permintaan-barang")
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

                <FormField control={form.control} name="tanggal" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tanggal</FormLabel>
                        <FormControl>
                            <Input type="date" placeholder="Tanggal" {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="barang_id" render={({ field }) => {
                    return (
                        <FormItem>
                            <FormLabel>Nama Barang</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Barang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {listBarang?.map((barang) => (
                                                <SelectItem key={barang.id} value={barang.id.toString()}>{barang.nama}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )
                }} />

                <FormField control={form.control} name="user_id" render={({ field }) => {
                    return (
                        <FormItem>
                            <FormLabel>Nama User</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih User" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {listUser?.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>{user.nama}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
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



                <div className="flex justify-end">
                    <Button type="submit" disabled={isPending}  >{isPending ? "Menyimpan..." : "Submit"}</Button>
                </div>
            </form>
        </Form>
    )
}