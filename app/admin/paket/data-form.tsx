"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
// import { serialize } from "object-to-formdata";
import { createMerek, editMerek } from "@/lib/actions/actMerek";
import useSWR, { mutate } from "swr";
import { createPaket, editPaket } from "@/lib/actions/actPaket";
import AxiosClient from "@/lib/AxiosClient";
import { Combobox } from "@/components/ui/combobox";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Barang {
  id: string;
  nama: string;
}

const fetcher = (url: any) => AxiosClient.get(url).then((res) => res.data.data);

export default function PaketForm({ paket }: { paket?: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [useHargaPaket, setUseHargaPaket] = useState(paket?.harga_paket ? paket.harga_paket > 0 : false);
  const { data: listBarang, isLoading: isLoadingBarang } = useSWR<Barang[]>(
    "/api/gudang/barang",
    fetcher
  );
  const formSchema = z.object({
    nama: z.string().min(1, "Nama is required"),
    keterangan: z.string().optional(),
    harga_paket: z.coerce.number().min(0, "Harga Paket tidak boleh kurang dari 0").optional(),
    barang: z
      .array(
        z.object({
          barang_id: z.string().min(1, "Barang harus dipilih"),
          qty: z.coerce.number().gt(0, "Qty harus lebih dari 0"),
          paket_id: z.any().optional(),
        })
      )
      .min(1, ""),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: paket?.nama ?? "",
      keterangan: paket?.keterangan ?? "",
      harga_paket: paket?.harga_paket ?? 0,
      barang: paket?.barang ?? [{
        barang_id: "", qty: 1
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "barang",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const finalValues = {
        ...values,
        harga_paket: useHargaPaket ? values.harga_paket : 0,
        barang: paket
          ? values.barang.map((b) => ({
            ...b,
            paket_id: b.paket_id ? b.paket_id : null,
          }))
          : values.barang,
      };

      // const formData = serialize(values);
      const data = paket
        ? await editPaket(paket.id, finalValues)
        : await createPaket(finalValues);

      if (data.success) {
        toast({
          variant: "default",
          description: "Data Paket berhasil disimpan!",
        });
        router.push("/admin/paket");
        // mutate('/api/gudang/merek')
        router.refresh;
      } else {
        toast({
          variant: "destructive",
          description: data.message,
        });
      }
    });
  }

  if (!listBarang || isLoadingBarang)
    return (
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader />
          <CardContent className="space-y-4">
            {/* Skeleton untuk Barang */}
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Paket</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Nama Paket" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="keterangan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keterangan</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Keterangan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="harga_paket"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harga Paket</FormLabel>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="useHargaPaket"
                  checked={useHargaPaket}
                  onCheckedChange={(checked) => {
                    setUseHargaPaket(checked === true || paket?.harga_paket > 0);
                    if (!checked) {
                      form.setValue("harga_paket", 0);
                    }
                  }}
                />
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    value={field.value === 0 ? "" : field.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        field.onChange(0);
                        return;
                      }
                      field.onChange(Number(val));
                    }}
                    disabled={!useHargaPaket}
                    className="flex-1"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {fields.map((field, index) => (
          <div key={field.id} className="flex space-x-4 items-end">
            <FormField
              control={form.control}
              name={`barang.${index}.barang_id`}
              render={({ field }) => {
                // Ambil daftar barang_id yang sudah dipilih, kecuali untuk item saat ini
                const selectedBarangIds = form
                  .getValues("barang")
                  .filter((_, i) => i !== index) // Exclude current item
                  .map((item) => Number(item.barang_id));

                // Filter daftar barang agar hanya menampilkan yang belum dipilih (kecuali untuk item saat ini)
                const availableBarang = listBarang.filter((barang) => {
                  return !selectedBarangIds.includes(Number(barang.id));
                });

                return (
                  <FormItem className="w-1/2">
                    {index === 0 && <FormLabel>Barang</FormLabel>}
                    <FormControl>
                      <Combobox
                        options={availableBarang.map((barang) => ({
                          value: barang.id.toString(),
                          label: barang.nama,
                        }))}
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          // console.log("test",bar)
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
              name={`barang.${index}.qty`}
              render={({ field }) => (
                <FormItem className="w-1/2">
                  {index === 0 && <FormLabel>Qty</FormLabel>}
                  <FormControl>
                    <Input type="text" placeholder="Qty" {...field} />
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

        <Button type="button" onClick={() => append({ barang_id: "", qty: 1 })}>
          Tambah Barang
        </Button>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : paket ? "Edit" : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
