"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
// import { serialize } from "object-to-formdata";
import useSWR from "swr";
import AxiosClient from "@/lib/AxiosClient";
import { Combobox } from "@/components/ui/combobox";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createDpbk, editDpbk } from "@/lib/actions/actDpbk";
import { Textarea } from "@/components/ui/textarea";

const fetcher = (url: any) => AxiosClient.get(url).then((res) => res.data.data);

interface Barang {
  id: string;
  nama: string;
  stok_barang: number;
}
interface Unit {
  id: string;
  nama: string;
}
interface Paket {
  id: string;
  nama_paket: string;
  barang: { barang_id: string; qty: number; stok_barang: number }[];
}

const formSchema = z.object({
  nodpbk: z.string(),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  unit_id: z.coerce.number().min(1, "Unit harus diisi"),
  paket_id: z.string(),
  keterangan: z.string().optional(),
  items: z
    .array(
      z.object({
        barang_id: z.string().min(1, "Barang harus dipilih"),
        qty: z.coerce.number().min(0.01, "Qty harus lebih dari 0"),
        stok_barang: z.coerce.number(),
      })
    )
    .min(1, "Minimal satu barang harus dipilih"),
});

export default function DaftarPermintaanBarangKeluar({ dpbk }: { dpbk?: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"manual" | "paket">("manual");
  const { data, isLoading, error } = useSWR<Barang[]>(
    "/api/gudang/barang?status=aktif",
    fetcher
  );
  const {
    data: listUnit,
    isLoading: isLoadingUnit,
    error: errorUnit,
  } = useSWR<Unit[]>("/api/gudang/unit", fetcher);
  const {
    data: listPaket,
    isLoading: isLoadingPaket,
    error: errorPaket,
  } = useSWR<Paket[]>("/api/gudang/paket?status=tersedia", fetcher);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nodpbk: dpbk?.nodpbk ?? "",
      tanggal: dpbk?.tanggal
        ? new Date(dpbk.tanggal).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      unit_id: dpbk?.id_unit?.toString() ?? "",
      paket_id: "",
      keterangan: dpbk?.keterangan ?? "",
      items: dpbk?.barang ?? [{ barang_id: "", qty: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Reset items saat mode berubah
  useEffect(() => {
    if (mode === "manual" && !dpbk) {
      form.setValue("items", [{ barang_id: "", qty: 0, stok_barang: 0 }]);
    } else if (mode === "paket") {
      form.setValue("items", []);
    }
    form.setValue("paket_id", "");
  }, [mode, form, dpbk]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      // const formData = serialize(values);
      // console.log("Form Data:", values);

      const data = dpbk
        ? await editDpbk(dpbk.id, values)
        : await createDpbk(values);

      if (data.success) {
        toast({ variant: "default", description: "Data berhasil disimpan!" });
        router.push("/admin/daftar-permintaan-barang-keluar");
        router.refresh();
      } else {
        toast({ variant: "destructive", description: data.message });
      }
    });
  }

  if (
    !data ||
    !listUnit ||
    !listPaket ||
    isLoading ||
    isLoadingPaket ||
    isLoadingUnit ||
    error ||
    errorUnit ||
    errorPaket
  )
    return (
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader />
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4 rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/3 rounded-md" />
              <div className="flex space-x-4 items-end">
                <div className="w-1/2 space-y-2">
                  <Skeleton className="h-4 w-1/4 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="w-1/2 space-y-2">
                  <Skeleton className="h-4 w-1/4 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <Skeleton className="h-10 w-24 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-10 w-36 rounded-md" />
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

        <FormField
          control={form.control}
          name="unit_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daftar Unit</FormLabel>
              <FormControl>
                <Combobox
                  options={listUnit.map((unit) => ({
                    value: unit.id.toString(),
                    label: unit.nama,
                  }))}
                  value={field.value?.toString() || ""}
                  onChange={(value) => field.onChange(value)}
                  placeholder="Pilih Unit"
                />
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
                <Textarea placeholder="Keterangan (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <label className="text-lg font-semibold">
            Detail Permintaan Barang Keluar
          </label>
          <div className="flex space-x-4">
            <Button
              type="button"
              variant={mode === "manual" ? "default" : "outline"}
              onClick={() => setMode("manual")}
            >
              Manual
            </Button>
            {!dpbk && (
              <Button
                type="button"
                variant={mode === "paket" ? "default" : "outline"}
                onClick={() => setMode("paket")}
              >
                Paket
              </Button>
            )}
          </div>

          {mode === "manual" ? (
            <div className="space-y-4 mt-4">
              {fields.map((field, index) => {
                return (
                  <div key={field.id} className="flex space-x-4 items-start">
                    <FormField
                      control={form.control}
                      name={`items.${index}.barang_id`}
                      render={({ field }) => {
                        const selectedBarangIds = form
                          .getValues("items")
                          .filter((_, i) => i !== index)
                          .map((item) => Number(item.barang_id));

                        const availableBarang = data.filter((barang) => {
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
                                  let stok =
                                    data.find((barang) => barang.id == value)
                                      ?.stok_barang ?? 0;
                                  form.setValue(
                                    `items.${index}.stok_barang`,
                                    stok
                                  );
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
                            <Input
                              type="number"
                              step="0.01" // Langkah 0.01 untuk 2 digit desimal
                              min={0.01}
                              placeholder="Qty"
                              {...field}
                              onChange={(e) => {
                                const stok = form.getValues(
                                  `items.${index}.stok_barang`
                                );
                                const value =
                                  e.target.value === "" ? "" : e.target.value; // Pertahankan string kosong

                                if (value === "") {
                                  field.onChange(value);
                                  return;
                                }

                                const numValue = parseFloat(value);
                                if (isNaN(numValue)) return; // Hindari NaN

                                if (numValue > stok) {
                                  form.setError(`items.${index}.qty`, {
                                    type: "manual",
                                    message:
                                      "Jumlah melebihi stok yang tersedia",
                                  });
                                } else {
                                  form.clearErrors(`items.${index}.qty`);
                                  field.onChange(numValue);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.stok_barang`}
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          {index === 0 && <FormLabel>Stok Barang</FormLabel>}
                          <FormControl>
                            <Input
                              type="text"
                              disabled
                              placeholder="Qty"
                              {...field}
                            />
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
                );
              })}
              <Button
                type="button"
                onClick={() =>
                  append({ barang_id: "", qty: 0, stok_barang: 0 })
                }
              >
                Tambah Barang
              </Button>
            </div>
          ) : (
            <div>
              <FormField
                control={form.control}
                name="paket_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Paket</FormLabel>
                    <FormControl>
                      <Combobox
                        options={
                          listPaket?.map((paket) => ({
                            value: paket.id.toString(),
                            label: paket.nama_paket,
                          })) || []
                        }
                        value={field.value || ""}
                        onChange={(value) => {
                          field.onChange(value);
                          const selectedPaket = listPaket?.find(
                            (paket) => paket.id.toString() === value
                          );
                          if (selectedPaket?.barang) {
                            form.setValue(
                              "items",
                              selectedPaket.barang.map((item) => ({
                                barang_id: item.barang_id.toString(),
                                qty: item.qty,
                                stok_barang: item.stok_barang,
                              }))
                            );
                          }
                        }}
                        placeholder="Pilih Paket"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {fields.length > 0 && (
                <div className="space-y-4 mt-4">
                  {fields.map((field, index) => {
                    return (
                      <div
                        key={field.id}
                        className="flex space-x-4 items-start"
                      >
                        <FormField
                          control={form.control}
                          name={`items.${index}.barang_id`}
                          render={({ field }) => {
                            const selectedBarangIds = form
                              .getValues("items")
                              .filter((_, i) => i !== index)
                              .map((item) => Number(item.barang_id));

                            const availableBarang = data.filter((barang) => {
                              return !selectedBarangIds.includes(
                                Number(barang.id)
                              );
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
                                <Input
                                  type="number"
                                  step="any" // Mengizinkan input desimal
                                  min={0}
                                  placeholder="Qty"
                                  {...field}
                                  onChange={(e) => {
                                    const stok = form.getValues(
                                      `items.${index}.stok_barang`
                                    );
                                    const value = parseFloat(e.target.value); // Menggunakan parseFloat untuk mengizinkan desimal
                                    if (value > stok) {
                                      form.setError(`items.${index}.qty`, {
                                        type: "manual",
                                        message:
                                          "Jumlah melebihi stok yang tersedia",
                                      });
                                    } else {
                                      form.clearErrors(`items.${index}.qty`);
                                      field.onChange(value);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.stok_barang`}
                          render={({ field }) => (
                            <FormItem className="w-1/2">
                              {index === 0 && (
                                <FormLabel>Stok Barang</FormLabel>
                              )}
                              <FormControl>
                                <Input
                                  type="text"
                                  disabled
                                  placeholder="Qty"
                                  {...field}
                                />
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
                    );
                  })}
                  <Button
                    type="button"
                    onClick={() =>
                      append({ barang_id: "", qty: 0, stok_barang: 0 })
                    }
                  >
                    Tambah Barang
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
