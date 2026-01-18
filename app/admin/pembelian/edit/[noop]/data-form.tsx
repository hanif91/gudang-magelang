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
import { updateOp } from "@/lib/actions/actPembelianItem";
import useSWR from "swr";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent } from "@/components/ui/card";
import AxiosClient from "@/lib/AxiosClient";
import { Search } from "lucide-react";
import formatRupiah from "@/lib/format-harga";

const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data.data);

const formSchema = z.object({
  tgl_op: z.string().min(1, "Tanggal OP is required"),
  supplier_id: z.coerce.number().min(1, "Supplier is required"),
  items: z.array(
    z.object({
      id_op: z.number().optional().nullable(),
      id_dpb_item: z.string(), // ID for UI Key (could be unique combo)
      dpb_id: z.coerce.string(),
      barang_id: z.number(),
      nama_barang: z.string(),
      qty_dpb_total: z.coerce.number(),
      qty_sisa: z.coerce.number(),
      qty_dpb_processed: z.coerce.number().optional(), // Added field
      qty: z.coerce.number().min(0, "Qty OP tidak boleh negatif"),
      harga_beli: z.coerce.number().min(0, "Harga beli tidak boleh negatif"),
      stok: z.any().optional(),
      satuan_barang: z.string().optional(),
      is_new_candidate: z.boolean().optional(),
      qty_proses: z.number().optional()
    }).refine((data) => data.qty <= data.qty_sisa, {
      message: "Qty OP melebihi Stok DPB",
      path: ["qty"],
    })
  )
});

export default function DataForm({ op }: { op: any }) {
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

  // Fetch List Supplier only
  const { data: listDpb, isLoading: isLoadingDpb } = useSWR('/api/gudang/dpb/sisa', fetcher);
  const { data: listSupplier, isLoading: isLoadingSupplier } = useSWR('/api/gudang/supplier', fetcher);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tgl_op: op.tanggal ? new Date(op.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      supplier_id: op.supplier_id || 0,
      items: [],
    },
  });

  const { fields, replace, update } = useFieldArray({
    control: form.control,
    name: "items",
  });


  // Init Form from OP Data
  useEffect(() => {
    if (op && op.items) {
       // op.items now contains both Existing + Candidate items
       const formItems = op.items.map((item: any, index: number) => {
           // Decide Qty: Existing -> qty_op (from DB), Candidate -> 0
           const isCandidate = item.is_new_candidate || !item.id_op;
           const initialQty = isCandidate ? 0 : Number(item.qty_op || 0); // "default valuenya qty op ya"
           
           // Ensure qty_dpb_total is valid number. Fallback to qty_dpb_sisa just in case of transition.
           const totalDpb = Number(item.qty_dpb_total) || Number(item.qty_dpb_sisa) || 0;
           console.log(item)
           
           return {
               id_op: item.id_op || null,
               id_dpb_item: `${item.id_barang}-${index}`, // Unique UI key
               dpb_id: item.dpb_id?.toString(),
               barang_id: item.id_barang,
               nama_barang: item.nama_barang,
               qty_dpb_total: totalDpb,
               qty_dpb_processed: Number(item.qty_dpb_processed) || 0,
               qty: initialQty, // Map to new 'qty' field
               qty_sisa: Number(item.qty_dpb_sisa || 0) + Number(item.qty_op || 0),
               harga_beli: Number(item.harga_beli) || 0,
               stok: item.stok,
               satuan_barang: item.satuan_barang,
               is_new_candidate: !!isCandidate,
               qty_proses: Number(item.qty_proses) || 0
           };
       });
       
       // Replace fields only if empty to avoid reset loops if op changes references
       if (fields.length === 0) {
           replace(formItems);
       }
    }
  }, [op, replace, fields.length]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      // Filter out items with Qty <= 0 AND items that are already processed (qty_proses > 0)
      const activeItems = values.items.filter(item => item.qty > 0 && (!item.qty_proses || item.qty_proses === 0));

      const payload = {
        no_pembelian: op.no_pembelian,
        tanggal: values.tgl_op,
        supplier_id: values.supplier_id,
        items: activeItems.map(item => ({
             id_op: item.id_op || undefined, // undefined signals backend to insert new
             tanggal: values.tgl_op,
             dpb_id: parseInt(item.dpb_id),
             barang_id: item.barang_id, 
             qty: item.qty, // Use new field name
             qty_dpb_total: item.qty_dpb_total,
             harga_beli: item.harga_beli,
             suplier_id: values.supplier_id 
        }))
      };

      console.log("Update Payload:", payload);

      const res = await updateOp(op.noop, payload);

      if (res.success) {
        toast({ variant: "default", description: "Data berhasil diperbarui!" });
        router.push("/admin/pembelian");
        router.refresh();
      } else {
        toast({ variant: "destructive", description: res.message || "Gagal menyimpan data" });
      }
    });
  }

  // Handle Validation Errors
  const onError = (errors: any) => {
    console.log("Validation Errors:", errors);
    toast({
        variant: "destructive",
        title: "Validasi Gagal",
        description: "Mohon periksa kembali inputan anda. Pastikan Qty tidak melebihi stok DPB.",
    });
  };
  
  // Filter Display
  const displayedIndices = useMemo(() => {
      // Return INDICES of fields that match search
      // We map over fields and return indices
      return fields.map((field, index) => ({ field, index }))
            .filter(({ field }) => 
                (field.nama_barang || "").toLowerCase().includes(debouncedSearchQuery.toLowerCase())
            )
            .map(item => item.index);
  }, [fields, debouncedSearchQuery]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-5">
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
                  options={(Array.isArray(listSupplier) ? listSupplier : [])?.map((supplier: any) => ({
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


        {fields.length > 0 && (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <FormLabel className="block">Daftar Barang (DPB)</FormLabel>
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
                    
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                        {displayedIndices.map((index) => {
                            // Render specific field by index
                            const field = fields[index];
                            // To simplify UI: 
                            // If Qty > 0 -> Highlighted / Active
                            // If Qty == 0 -> Dimmed / Candidate
                            const currentQty = form.watch(`items.${index}.qty`);
                            const currentHarga = form.watch(`items.${index}.harga_beli`);
                            const isActive = currentQty > 0;
                            // Check "Proses" lock
                            const isProcessed = (field.qty_proses || 0) > 0;

                            return (
                                <div key={field.id} className={`flex items-start justify-between p-3 rounded-md border text-sm transition-colors ${isActive ? 'bg-card border-primary/20' : 'bg-muted/20 border-border opacity-80'}`}>
                                    <div className="flex-1 mr-4 pt-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{field.nama_barang}</p>
                                            {field.is_new_candidate && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Baru</span>}
                                            {isProcessed && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Diproses: {field.qty_proses}</span>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Stok DPB: <span className="font-semibold text-foreground">{field.qty_sisa}</span> | Total Stok: <span className="font-semibold text-foreground">{field.qty_dpb_total}</span> | Stok: {field.stok || '0'} | Satuan: {field.satuan_barang || '-'} 
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-end gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.harga_beli`}
                                                render={({ field: inputField }) => (
                                                <FormItem className="mb-0 space-y-1">
                                                    <FormLabel className="text-[10px] text-muted-foreground">Harga Beli</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="number" 
                                                            className="w-32 h-8 text-sm" 
                                                            placeholder="0" 
                                                            {...inputField} 
                                                            disabled={isProcessed}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.qty`}
                                                render={({ field: inputField }) => (
                                                <FormItem className="mb-0 space-y-1">
                                                    <FormLabel className="text-[10px] text-muted-foreground">Qty</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="number" 
                                                            className={`w-20 h-8 text-sm ${isActive ? 'font-bold' : ''}`}
                                                            placeholder="0" 
                                                            {...inputField}
                                                            disabled={isProcessed}
                                                            onChange={(e) => inputField.onChange(parseFloat(e.target.value))}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                                )}
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-medium">
                                            Total: {formatRupiah((currentQty || 0) * (currentHarga || 0))}
                                        </p>
                                         <FormMessage className="text-xs text-right">
                                             {form.formState.errors.items?.[index]?.qty?.message}
                                         </FormMessage>
                                    </div>
                                </div>
                            );
                        })}
                        {displayedIndices.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                Tidak ada barang ditemukan
                            </div>
                        )}
                    </div>

                    
                    {/* Grand Total */}
                    <div className="mt-4 flex justify-end items-center border-t pt-4">
                        <div className="text-right">
                           <p className="text-sm text-muted-foreground">Grand Total</p>
                           <p className="text-xl font-bold">
                             {formatRupiah(fields.reduce((acc, field, index) => {
                               // Use watched values for real-time calc
                               const qty = Number(form.watch(`items.${index}.qty`)) || 0;
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
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
