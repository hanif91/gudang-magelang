"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, useMemo } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createOp } from "@/lib/actions/actOp";
import { getAllDpbSisa } from "@/lib/actions/actDpb"; // Helper import, not used directly in component fetcher
import useSWR from "swr";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent } from "@/components/ui/card";
import AxiosClient from "@/lib/AxiosClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Search } from "lucide-react";
import formatRupiah from "@/lib/format-harga";



const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data);

const formSchema = z.object({
  tgl_op: z.string().min(1, "Tanggal OP is required"),
  supplier_id: z.coerce.number().min(1, "Supplier is required"),
  dpb_id: z.string().min(1, "DPB is required"),
  ppn: z.boolean().default(false),
  ppn_persediaan: z.boolean().default(false),
  items: z.array(
    z.object({
      id_dpb_item: z.string(),
      dpb_id: z.string().optional(), // Store origin DPB ID
      barang_id: z.number(),
      nama_barang: z.string(),
      qty_dpb: z.number(),
      qty_op: z.coerce.number().min(1, "Qty OP harus lebih dari 0"),
      harga_beli: z.coerce.number().min(0, "Harga beli tidak boleh negatif"),
      stok: z.any().optional(),
      satuan_barang: z.string().optional(),
    }).refine((data) => data.qty_op <= data.qty_dpb, {
      message: "Qty OP tidak boleh melebihi Qty DPB",
      path: ["qty_op"],
    })
  ).min(1, "Minimal satu barang harus dipilih"),
});

export default function DataForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();



  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch List DPB for Combobox
  const { data: dataDpb, isLoading: isLoadingDpb } = useSWR('/api/gudang/dpb/sisa', fetcher);
  // Fetch List Supplier
  const { data: listSupplier, isLoading: isLoadingSupplier } = useSWR('/api/gudang/supplier', fetcher);
  // Fetch PPN Rate
  const { data: dataPpn } = useSWR('/api/filter/ppn', fetcher);

  // State for selected DPB Details (source of truth for ALL available items)
  const [availableDpbItems, setAvailableDpbItems] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tgl_op: new Date().toISOString().split('T')[0],
      supplier_id: 0,
      dpb_id: "",
      ppn: false,
      ppn_persediaan: false,
      items: [],
    },
  });

  const { fields, append, remove, replace, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watch dpb_id change to fetch details
  const watchedDpbId = form.watch("dpb_id");

  useEffect(() => {
    if (watchedDpbId && dataDpb?.data) {
      const selectedDpb = dataDpb.data.find((d: any) => d.id.toString() === watchedDpbId);

      if (selectedDpb && selectedDpb.barang) {
        // Create items with unique UI ID
        const itemsWithUiId = selectedDpb.barang.map((item: any, index: number) => ({
          ...item,
          _uiId: `${selectedDpb.id}-${item.id}-${index}`,
          dpb_id: selectedDpb.id.toString()
        }));
        setAvailableDpbItems(itemsWithUiId);

        // Auto-populate items
        const newItems = itemsWithUiId.map((item: any) => ({
          id_dpb_item: item._uiId,
          dpb_id: item.id_nodpb?.toString() || item.id_dpb?.toString() || selectedDpb.id.toString(), // Use stored id_dpb/id_nodpb from item, fallback to selectedDpb
          barang_id: Number(item.id_barang || item.id),
          nama_barang: item.nama_barang || item.nama,
          qty_dpb: Number(item.qty),
          qty_op: Number(item.qty),
          harga_beli: 0, // Default price
          stok: item.stok,
          satuan_barang: item.satuan_barang
        }));
        replace(newItems);

      } else {
        setAvailableDpbItems([]);
        replace([]);
      }
    } else {
      setAvailableDpbItems([]);
      if (!watchedDpbId) replace([]);
    }
  }, [watchedDpbId, dataDpb, replace]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const isPpn = values.ppn;
    const isPpnPersediaan = values.ppn_persediaan;

    const payload = {
      items: values.items.map(item => ({
        tanggal: values.tgl_op,
        dpb_id: item.dpb_id || values.dpb_id,
        barang_id: item.barang_id,
        qty: item.qty_op,
        harga_beli: item.harga_beli,
        suplier_id: values.supplier_id,
      })),
      isppn: isPpn ? 1 : 0,
      isoverwriteppn: isPpn && isPpnPersediaan ? 1 : 0
    };

    startTransition(async () => {
      console.log("Final Payload:", payload);

      const res = await createOp(payload);

      if (res.success) {
        toast({ variant: "default", description: "Data berhasil disimpan!" });
        router.push("/admin/pembelian");
        router.refresh();
      } else {
        toast({ variant: "destructive", description: res.message || "Gagal menyimpan data" });
      }
    });
  }

  // Handlers
  const handleAddItem = (item: any) => {
    // Use item's stored DPB ID, fallback to current layout if missing (robustness)
    const itemDpbId = item.id_nodpb?.toString() || item.id_dpb?.toString() || form.getValues("dpb_id");

    append({
      id_dpb_item: `${item._uiId}-${Date.now()}`,
      dpb_id: itemDpbId,
      barang_id: Number(item.id_barang || item.id),
      nama_barang: item.nama_barang || item.nama,
      qty_dpb: Number(item.qty),
      qty_op: Number(item.qty),
      harga_beli: 0,
      stok: item.stok,
      satuan_barang: item.satuan_barang
    });
  };

  const handleRemoveItem = (idDpbItem: string) => {
    const index = fields.findIndex(f => f.id_dpb_item === idDpbItem);
    if (index > -1) {
      remove(index);
    }
  };

  // Filtered Items for Display
  const displayedItems = useMemo(() => {
    if (!debouncedSearchQuery) return availableDpbItems;
    return availableDpbItems.filter((item: any) =>
      (item.nama_barang || item.nama).toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [availableDpbItems, debouncedSearchQuery]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tgl_op"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal OP</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <FormControl>
                  <Combobox
                    emptyText={isLoadingSupplier ? "Loading..." : "Tidak ada data"}
                    options={listSupplier?.data?.map((supplier: any) => ({
                      value: supplier.id.toString(),
                      label: supplier.nama,
                    })) || []}
                    value={field.value?.toString() || ""}
                    onChange={(value) => field.onChange(Number(value))}
                    placeholder="Pilih Supplier"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        <FormField
          control={form.control}
          name="dpb_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>No DPB</FormLabel>
              <FormControl>
                <Combobox
                  options={dataDpb?.data?.map((dpb: any) => ({
                    value: dpb.id.toString(),
                    label: `${dpb.nodpb} - ${new Date(dpb.tanggal).toLocaleDateString()}`,
                  })) || []}
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  placeholder="Pilih DPB"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchedDpbId && (
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="ppn"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      PPN
                    </FormLabel>
                    <FormDescription>
                      Check jika transaksi ini menggunakan PPN
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("ppn") && (
              <FormField
                control={form.control}
                name="ppn_persediaan"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 ml-8">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        PPN Ditambahkan di Persediaan
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        {availableDpbItems.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <FormLabel className="block">Pilih Barang dari DPB</FormLabel>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari barang..."
                    className="pl-8 h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {displayedItems.map((item: any) => {
                  const dpbItemId = item._uiId;
                  const selectedIndex = fields.findIndex(f => f.id_dpb_item === dpbItemId);
                  const isItemSelected = selectedIndex > -1;

                  return (
                    <div key={dpbItemId} className={`flex items-start justify-between p-3 rounded-md border text-sm ${isItemSelected ? 'bg-card' : 'bg-muted/30 border-dashed opacity-70'}`}>
                      <div className="flex-1 mr-4 pt-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.nama_barang || item.nama}</p>
                          {!isItemSelected && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Dihapus</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Qty: {item.qty} | Stok: {item.stok || '0'} | Satuan: {item.satuan_barang || '-'}
                          {item.harga_jual_barang > 0 && ` | H.Jual: ${formatRupiah(item.harga_jual_barang)}`}
                        </p>
                      </div>

                      {isItemSelected ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-end gap-2">
                            <FormField
                              control={form.control}
                              name={`items.${selectedIndex}.harga_beli`}
                              render={({ field }) => (
                                <FormItem className="mb-0 space-y-1">
                                  <FormLabel className="text-[10px] text-muted-foreground">Harga Beli</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      className="w-32 h-8 text-sm"
                                      placeholder="0"
                                      value={field.value === 0 ? "" : field.value}
                                      onChange={(e) => {
                                        const val = e.target.value;

                                        if (val === "") {
                                          field.onChange(0);
                                          return;
                                        }

                                        field.onChange(Number(val));
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            {(form.watch("ppn") || form.watch("ppn_persediaan")) && (
                              <FormItem className="mb-0 space-y-1">
                                <FormLabel className="text-[10px] text-muted-foreground">Harga Beli (Setelah PPN)</FormLabel>
                                <FormControl>
                                  {(() => {
                                    const harga = Number(form.watch(`items.${selectedIndex}.harga_beli`)) || 0;
                                    const isPpn = form.watch("ppn");
                                    const isPpnPersediaan = form.watch("ppn_persediaan");
                                    const ppnRate = dataPpn?.data?.jml ? parseFloat(dataPpn.data.jml) : 0;

                                    let hargaSetelahPpn = harga;
                                    if (isPpn && !isPpnPersediaan) {
                                      hargaSetelahPpn = harga + (harga * 0.11);
                                    } else if (isPpn && isPpnPersediaan) {
                                      hargaSetelahPpn = harga + (harga * ppnRate);
                                    }

                                    return (
                                      <Input
                                        type="number"
                                        className="w-32 h-8 text-sm font-medium bg-muted"
                                        placeholder="Harga Setelah PPN"
                                        value={hargaSetelahPpn}
                                        disabled
                                      />
                                    );
                                  })()}
                                </FormControl>
                              </FormItem>
                            )}
                            <FormField
                              control={form.control}
                              name={`items.${selectedIndex}.qty_op`}
                              render={({ field }) => (
                                <FormItem className="mb-0 space-y-1">
                                  <FormLabel className="text-[10px] text-muted-foreground">Qty OP</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      className={`w-20 h-8 text-sm ${Number(field.value) > Number(item.qty) ? 'border-red-500' : ''}`}
                                      placeholder="Qty"
                                      {...field}
                                      max={item.qty}
                                      value={field.value === 0 ? "" : field.value}
                                      onChange={(e) => {
                                        const val = e.target.value;

                                        if (val === "") {
                                          field.onChange(0);
                                          return;
                                        }

                                        const numVal = parseFloat(val);
                                        if (numVal > item.qty) {
                                          field.onChange(numVal);
                                        } else {
                                          field.onChange(numVal);
                                        }
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 mb-[1px]"
                              onClick={() => handleRemoveItem(dpbItemId)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium text-right">
                            {(() => {
                              const qty = Number(form.watch(`items.${selectedIndex}.qty_op`)) || 0;
                              const harga = Number(form.watch(`items.${selectedIndex}.harga_beli`)) || 0;
                              const ppnRate = dataPpn?.data?.jml ? parseFloat(dataPpn.data.jml) : 0;
                              const hargaOveridePpn = ppnRate * harga;
                              const hargaPpn = harga * 0.11;
                              const isPpn = form.watch("ppn");
                              const isPpnPersediaan = form.watch("ppn_persediaan");

                              if (isPpn && !isPpnPersediaan) {
                                return <>Total: {formatRupiah(harga * qty)} - PPN: {formatRupiah(hargaPpn * qty)} (11%) - Total Keseluruhan: {formatRupiah((harga + hargaPpn) * qty)}</>;
                              } else if (isPpn && isPpnPersediaan) {
                                return <>Total: {formatRupiah((harga + hargaOveridePpn) * qty)}</>;
                              }
                              return <>Total: {formatRupiah(harga * qty)}</>;
                            })()}
                          </p>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs mt-1"
                          onClick={() => handleAddItem(item)}
                        >
                          Ambil Lagi
                        </Button>
                      )}
                    </div>
                  );
                })}
                {displayedItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Tidak ada barang ditemukan
                  </div>
                )}
              </div>
              {form.formState.errors.items && (
                <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.items.message}</p>
              )}

              {/* Grand Total */}
              <div className="mt-4 flex justify-end items-center border-t pt-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Grand Total</p>
                  <p className="text-xl font-bold">
                    {formatRupiah(fields.reduce((acc, _, index) => {
                      const qty = Number(form.watch(`items.${index}.qty_op`)) || 0;
                      const harga = Number(form.watch(`items.${index}.harga_beli`)) || 0;
                      const ppnRate = dataPpn?.data?.jml ? parseFloat(dataPpn.data.jml) : 0;
                      const total = qty * harga;
                      const hargaOveridePpn = ppnRate * harga;
                      const hargaPpn = harga * 0.11;
                      const isPpn = form.watch("ppn");
                      const isPpnPersediaan = form.watch("ppn_persediaan");

                      if (isPpn) {
                        if (isPpnPersediaan) {
                          return acc + ((harga + hargaOveridePpn) * qty);
                        }
                        return acc + ((harga + hargaPpn) * qty);
                      }
                      return acc + total;
                    }, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Submit OP"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
