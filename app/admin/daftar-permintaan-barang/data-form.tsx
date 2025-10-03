"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { serialize } from "object-to-formdata";
import { createDpb, editDpb } from "@/lib/actions/actDpb";
import useSWR from "swr";
import axios from "axios";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: any) => axios.get(url).then(res => res.data);

interface Barang {
  id: string;
  nama: string;
}

const formSchema = z.object({
  tanggal: z.string().min(1, "Tanggal is required"),
  nodpb: z.string(),
  rekanan: z.union([z.literal("1"), z.literal("0")]),
  items: z.array(
    z.object({
      barang_id: z.string().min(1, "Barang harus dipilih"),
      qty: z.coerce.number().min(1, "Qty harus lebih dari 0"),
    })
  ).min(1, "Minimal satu barang harus dipilih"),
});

export default function DaftarPermintaanBarang({ dpb }: { dpb?: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { data, isLoading, error } = useSWR('/api/barang', fetcher);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tanggal: dpb?.tanggal
        ? new Date(dpb.tanggal).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      rekanan: dpb?.flagfullrekanan?.toString() ?? "",
      nodpb: dpb?.nodpb ?? "",
      items: dpb?.barang ?? [{ barang_id: "", qty: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });



  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = serialize(values);
      console.log("Form Data:", values);

      const data = dpb
        ? await editDpb(dpb.id, formData)
        : await createDpb(formData);

      if (data.success) {
        toast({ variant: "default", description: "Data berhasil disimpan!" });
        router.push("/admin/daftar-permintaan-barang");
        router.refresh();
      } else {
        toast({ variant: "destructive", description: data.message });
      }
    });
  }

  if (error) return (
    <main className="flex flex-col gap-5 justify-center content-center p-5">
      <Card className="w-full">
        <CardHeader />
        <CardContent>
          <p className="text-red-500">Gagal memuat data barang. Silakan coba lagi.</p>
        </CardContent>
        <CardFooter />
      </Card>
    </main>
  );


  if (isLoading) return (
    <main className="flex flex-col gap-5 justify-center content-center p-5">
      <Card className="w-full">
        <CardHeader />
        <CardContent className="space-y-4">
          {/* Skeleton untuk Tanggal */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Skeleton untuk Detail Permintaan Barang */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3 rounded-md" /> {/* Label */}
            <div className="flex space-x-4 items-end">
              {/* Skeleton untuk Barang */}
              <div className="w-1/2 space-y-2">
                <Skeleton className="h-4 w-1/4 rounded-md" /> {/* Label */}
                <Skeleton className="h-10 w-full rounded-md" /> {/* Combobox */}
              </div>

              {/* Skeleton untuk Qty */}
              <div className="w-1/2 space-y-2">
                <Skeleton className="h-4 w-1/4 rounded-md" /> {/* Label */}
                <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
              </div>

              {/* Skeleton untuk Tombol Hapus */}
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </div>

          {/* Skeleton untuk Tombol Tambah Barang */}
          <Skeleton className="h-10 w-36 rounded-md" />

          {/* Skeleton untuk Tombol Submit */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </CardContent>
        <CardFooter />
      </Card>
    </main>
  );


  // if (!data) {
  //   return (
  //     <main className="flex flex-col gap-5 justify-center content-center p-5">
  //       <Card className="w-full">
  //         <CardHeader />
  //         <CardContent>
  //           <p>Tidak ada data barang.</p>
  //         </CardContent>
  //         <CardFooter />
  //       </Card>
  //     </main>
  //   );
  // }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="tanggal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField control={form.control} name="rekanan" render={({ field }) => (
          <FormItem>
            <FormLabel>Status Rekanan</FormLabel>
            <FormControl>
              {/* <Select onValueChange={field.onChange} defaultValue={field.value} >
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
                options={[{ label: "Ya", value: "1" }, { label: "Tidak", value: "0" }]}
                value={field.value?.toString() || ""}
                onChange={(value) => field.onChange(value)}
                placeholder="Pilih Status Rekanan"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />


        <div className="space-y-4">
          <label className="text-lg font-semibold">Detail Permintaan Barang</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex space-x-4 items-end">
              {/* <FormField
                control={form.control}
                name={`items.${index}.barang_id`}
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    {index === 0 && <FormLabel>Barang</FormLabel>}
                    <FormControl>
                      <Combobox
                        options={
                          data.map((barang) => ({
                            value: barang.id.toString(),
                            label: barang.nama,
                          }))
                        }
                        value={field.value?.toString() || ""}
                        onChange={(value) => field.onChange(Number(value))}
                        placeholder="Pilih Barang"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              {/* <FormField
                control={form.control}
                name={`items.${index}.barang_id`}
                render={({ field }) => {
                  // Ambil daftar barang_id yang sudah dipilih
                  const selectedBarangIds = form.getValues("items").map(item => item.barang_id);
                  // console.log("ssf" + selectedBarangIds)

                  // console.log(selectedBarangIds.includes(12))

                  // Filter daftar barang agar hanya menampilkan yang belum dipilih
                  const availableBarang = data.filter((barang) => {
                    // console.log(barang.id.toString())
                    return !selectedBarangIds.includes(barang.id.toString())
                  });

                  //  data.map((barang) => {
                  //   console.log(barang.id.toString())
                  //  })
                  // console.log(availableBarang)

                  return (
                    <FormItem className="w-1/2">
                      {index === 0 && <FormLabel>Barang</FormLabel>}
                      <FormControl>
                        <Combobox
                          options={availableBarang.map(barang => ({
                            value: barang.id.toString(), // Pastikan value dalam bentuk string
                            label: barang.nama,
                          }))}
                          value={field.value.toString()} // Pastikan nilai dalam bentuk string
                          onChange={(value) => {
                            // console.log("Barang Dipilih:", value); // Debugging
                            field.onChange(value); // Update state form
                          }}
                          placeholder="Pilih Barang"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              /> */}
              <FormField
                control={form.control}
                name={`items.${index}.barang_id`}
                render={({ field }) => {
                  // Ambil daftar barang_id yang sudah dipilih, kecuali untuk item saat ini
                  const selectedBarangIds = form.getValues("items")
                    .filter((_, i) => i !== index) // Exclude current item
                    .map((item) => Number(item.barang_id));

                  // Filter daftar barang agar hanya menampilkan yang belum dipilih (kecuali untuk item saat ini)
                  const availableBarang = data?.data?.filter((barang: any) => {
                    return !selectedBarangIds.includes(Number(barang.id));
                  });

                  return (
                    <FormItem className="w-1/2">
                      {index === 0 && <FormLabel>Barang</FormLabel>}
                      <FormControl>
                        <Combobox
                          options={availableBarang?.map((barang: any) => ({
                            value: barang.id.toString(),
                            label: barang.nama,
                          })) || []}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          placeholder="Pilih Barang"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />



              <FormField
                control={form.control}
                name={`items.${index}.qty`}
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    {index === 0 && <FormLabel>Qty</FormLabel>}
                    <FormControl>
                      <Input type="number" placeholder="Qty" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  Hapus
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          type="button"
          onClick={() => append({ barang_id: "", qty: 0 })}
        >
          Tambah Barang
        </Button>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}