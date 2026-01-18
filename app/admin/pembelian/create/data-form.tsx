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

  // State for selected DPB Details (source of truth for ALL available items)
  const [availableDpbItems, setAvailableDpbItems] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tgl_op: new Date().toISOString().split('T')[0],
      supplier_id: 0,
      dpb_id: "",
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
             _uiId: `${item.id}-${index}`,
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      // API expects array of objects in the body directly for /create-op based on prompt logic?
      // "endpoint /pembelian-item/create-op nah terus bodynya itu ada items isinya array dari item item ya"
      // Suggesting: { items: [...] } or just [...] ? 
      // "bodynya itu ada (field) items isinya array..." -> so { items: [...] }

      
      const payload = {
        items: values.items.map(item => ({
             tanggal: values.tgl_op,
             dpb_id: item.dpb_id || values.dpb_id, // Use item's DPB ID if available
             barang_id: item.barang_id, 
             qty: item.qty_op,
             harga_beli: item.harga_beli,
             suplier_id: values.supplier_id // Use selected supplier ID
             // Actually, prompting 'suplier_id' suggests we might need a supplier input. 
             // BUT, the prompt didn't explicitly ask for supplier input UI in THIS turn, just that it's in the payload. 
             // I'll send null or leave it out if strictly matching prompt instructions which focused on "harga beli".
             // Wait, previous prompt had supplier logic refactored. 
             // I will leave suplier_id undefined for now to avoid breaking generic "create" logic if it's optional, or add it if strictly required. 
             // Given the instructions, I will stick to what was asked: `noop, tanggal, barang_id, qty, harga_beli, suplier_id, dpb_id`.
        }))
      };

      console.log("Payload:", payload);

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
          id_dpb_item: item._uiId,
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
                                                                    placeholder="Harga" 
                                                                    {...field} 
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${selectedIndex}.qty_op`}
                                                        render={({ field }) => (
                                                        <FormItem className="mb-0 space-y-1">
                                                            <FormLabel className="text-[10px] text-muted-foreground">Qty OP</FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    type="number" 
                                                                    className={`w-20 h-8 text-sm ${field.value > item.qty ? 'border-red-500' : ''}`}
                                                                    placeholder="Qty" 
                                                                    {...field} 
                                                                    max={item.qty}
                                                                    onChange={(e) => {
                                                                        const val = parseFloat(e.target.value);
                                                                        if (val > item.qty) {
                                                                            // Optional: prevent input or just let validation show error
                                                                            // field.onChange(item.qty); // Strict enforcement
                                                                             field.onChange(val); // Let validation handle it but show visual cue
                                                                        } else {
                                                                            field.onChange(val);
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
                                                <p className="text-[10px] text-muted-foreground font-medium">
                                                    Total: {formatRupiah((form.watch(`items.${selectedIndex}.qty_op`) || 0) * (form.watch(`items.${selectedIndex}.harga_beli`) || 0))}
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
                               return acc + (qty * harga);
                             }, 0))}
                           </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan OP"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
