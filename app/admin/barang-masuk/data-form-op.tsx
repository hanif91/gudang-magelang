"use client"

import { useRouter } from "next/navigation"
import { useTransition, useState, useEffect, useCallback } from "react"
import { useForm, useFieldArray } from "react-hook-form"
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
import { createPembelianOp } from "@/lib/actions/actPembelianItem"
import AxiosClient from "@/lib/AxiosClient"
import useSWR from "swr"
import { Combobox } from "@/components/ui/combobox"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"

interface OpItem {
  id_op: number
  noop: string
  dpb_id: number
  nodpb: string
  id_barang: number
  nama_barang: string
  qty_op: string
  qty_proses: string
  sisa_qty: string
  harga_beli: string
  id_supplier: number
  nama_supplier: string | null
  nama_user: string
  satuan_barang: string
  minimal_stok_barang: number
  harga_jual_barang: string
  foto_barang: string
  nama_jenis: string
  nama_kategori: string
  nama_merek: string
}

interface OpData {
  noop: string
  tanggal: string
  items: OpItem[]
}

const fetcher = (url: any) =>
  AxiosClient.get(url).then((res) => res.data.data)

const formSchema = z.object({
  no_pembelian: z.string().min(1, "No Pembelian is required"),
  tanggal: z.string().min(1, "Tanggal is required"),
  keterangan: z.string().optional(),
  op_noop: z.string().min(1, "No OP is required"),
  // dpb_id is required by backend, but we might have multiple DPBs. 
  // However prompt says: "semua dpb dari item op yang di pilih masukin ke barang" and body has "dpb_id".
  // Usually this means the primary DPB ID or maybe just one of them. 
  // Given the structure, I'll pass the first one or handle it in backend logic if needed. 
  // But wait, the prompt says "barang // Expecting array of objects: { op_id, qty, harga_beli, dpb_id }".
  // So `dpb_id` in the root might be redundant or specific to the transaction context.
  // I'll include it as optional or derived.
  dpb_id: z.coerce.number().optional(), 
  barang: z.array(
    z.object({
      op_id: z.coerce.number().min(1),
      dpb_id: z.coerce.number().min(1),
      barang_id: z.coerce.number().min(1),
      no_dpb: z.string(), // Helper for UI
      item_name: z.string(), // Helper for UI
      qty_sisa_limit: z.number(), // Helper for validation
      qty: z.coerce.number().min(0, "Qty tidak boleh negatif"),
      harga_beli: z.coerce.number().min(0),
      supplier_id: z.number().optional(),
      selected: z.boolean().default(true)
    })
  ).refine((items) => items.some(item => item.selected && item.qty > 0), {
    message: "Pilih minimal 1 barang dengan qty > 0",
    path: ["root"] // This might not show up nicely on a specific field, but prevents submission
  })
})

export default function DataFormOp() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  
  // Fetch OPs
  const { data: listOp, isLoading: isLoadingOp, error: errorOp } = useSWR("/api/gudang/pembelian-item/op-with-sisa", fetcher)
  
  // Fetch Suppliers
  const { data: listSupplier, isLoading: isLoadingSupplier, error: errorSupplier } = useSWR("/api/gudang/supplier", fetcher)

  const [selectedOp, setSelectedOp] = useState<OpData | null>(null)
  const [grandTotal, setGrandTotal] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      no_pembelian: "",
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: "",
      op_noop: "",
      barang: []
    },
  })

  // Watch for OP Selection
  const handleOpChange = (noop: string) => {
    const selected = listOp?.find((op: OpData) => op.noop === noop)
    if (selected) {
      setSelectedOp(selected)
      form.setValue('op_noop', selected.noop)
      
      // Map items to form array
      const mappedItems = selected.items.map((item: OpItem) => ({
        op_id: item.id_op,
        dpb_id: item.dpb_id,
        barang_id: item.id_barang,
        no_dpb: item.nodpb,
        item_name: item.nama_barang,
        qty_sisa_limit: parseFloat(item.sisa_qty),
        qty: parseFloat(item.sisa_qty), // Default to sisa
        harga_beli: parseFloat(item.harga_beli), // Default to existing price (0 or updated)
        supplier_id: item.id_supplier,
        selected: true
      }))
      
      form.setValue('barang', mappedItems)
      
      // If items have a common DPB, maybe set it? The prompt says "dpb_id" in body.
      // I'll take the first one for now if needed.
      if (mappedItems.length > 0) {
        form.setValue('dpb_id', mappedItems[0].dpb_id)
      }
    }
  }

  // Calculate Grand Total
  const { fields } = useFieldArray({
    control: form.control,
    name: "barang",
  })
  
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("barang")) {
         const currentItems = form.getValues("barang")
         const total = currentItems.reduce((acc, item) => {
           if (item.selected) {
             return acc + (item.qty * item.harga_beli)
           }
           return acc
         }, 0)
         setGrandTotal(total)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])


  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        // Filter out unselected items
        const selectedItems = values.barang.filter(item => item.selected && item.qty > 0)
        
        if (selectedItems.length === 0) {
           toast({ variant: 'destructive', description: "Tidak ada barang yang dipilih" })
           return
        }
        
        // Validate Qty vs Sisa
        const invalidItem = selectedItems.find(item => item.qty > item.qty_sisa_limit)
        if (invalidItem) {
           toast({ 
             variant: 'destructive', 
             description: `Qty untuk ${invalidItem.item_name} melebihi sisa (${invalidItem.qty_sisa_limit})` 
           })
           return
        }

        // Construct Payload
        const payload = {
            no_pembelian: values.no_pembelian,
            tanggal: values.tanggal,
            keterangan: values.keterangan || "",
            supplier_id: selectedItems[0]?.supplier_id, // Get supplier_id from first selected item
            dpb_id: values.dpb_id, // Root DPB ID (taking from first item or logic)
            barang: selectedItems.map(item => ({
                op_id: item.op_id,
                qty: item.qty,
                harga_beli: item.harga_beli,
                barang_id: item.barang_id,
                dpb_id: item.dpb_id
            }))
        }

        const dataResponse = await createPembelianOp(payload)

        if (dataResponse.success) {
          toast({
            variant: 'default',
            description: 'Data Pembelian berhasil disimpan!',
          })
          const tanggal = values.tanggal
          router.push(`/admin/barang-masuk?start=${tanggal}&end=${tanggal}`)
          router.refresh()
        } else {
          toast({
            variant: 'destructive',
            description: dataResponse.message || 'Terjadi kesalahan saat menyimpan data',
          })
        }
      } catch (error) {
        console.error('Error in onSubmit:', error)
        toast({
          variant: 'destructive',
          description: 'Terjadi kesalahan sistem. Silakan coba lagi.',
        })
      }
    })
  }

  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(harga)
  }

  if (isLoadingOp || isLoadingSupplier) {
      return <div>Loading...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
        
        {/* Tanggal */}
        <FormField
          control={form.control}
          name='tanggal'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* No Pembelian */}
        <FormField
          control={form.control}
          name='no_pembelian'
          render={({ field }) => (
            <FormItem>
              <FormLabel>No Pembelian</FormLabel>
              <FormControl>
                <Input placeholder='Masukkan No Pembelian' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Keterangan */}
        {/* <FormField
          control={form.control}
          name='keterangan'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan</FormLabel>
              <FormControl>
                <Textarea placeholder='Masukkan Keterangan (opsional)' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        {/* Keterangan */}
        <FormField
          control={form.control}
          name='keterangan'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan</FormLabel>
              <FormControl>
                <Textarea placeholder='Masukkan Keterangan (opsional)' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Select OP */}
        <FormField
          control={form.control}
          name='op_noop'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pilih No OP</FormLabel>
              <FormControl>
                <Combobox
                  options={listOp?.map((op: any) => ({
                    value: op.noop,
                    label: `${op.noop} - ${new Date(op.tanggal).toLocaleDateString()}`,
                  })) || []}
                  value={field.value}
                  onChange={(value) => handleOpChange(value)}
                  placeholder='Pilih No OP'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Items Table */}
        {selectedOp && (
          <div className='mt-6'>
            <h3 className='text-lg font-semibold mb-4'>Daftar Barang:</h3>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead className="w-[50px]">Pilih</TableHead>
                    <TableHead>No DPB</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Sisa Qty</TableHead>
                    <TableHead>Qty Proses</TableHead>
                    <TableHead>Harga Beli</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((item, index) => {
                    const isSelected = form.watch(`barang.${index}.selected`)
                    const qty = form.watch(`barang.${index}.qty`)
                    const hargaBeli = form.watch(`barang.${index}.harga_beli`)
                    const sisaLimit = form.getValues(`barang.${index}.qty_sisa_limit`)

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                             <FormField
                              control={form.control}
                              name={`barang.${index}.selected`}
                              render={({ field }) => (
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              )}
                            />
                        </TableCell>
                        <TableCell>
                          {form.getValues(`barang.${index}.no_dpb`)}
                        </TableCell>
                        <TableCell>
                          {form.getValues(`barang.${index}.item_name`)}
                        </TableCell>
                         <TableCell>
                          {sisaLimit}
                        </TableCell>
                        <TableCell>
                             <FormField
                                control={form.control}
                                name={`barang.${index}.qty`}
                                render={({ field }) => (
                                    <Input 
                                        type="number" 
                                        {...field} 
                                        disabled={!isSelected}
                                        onChange={e => {
                                            const val = parseFloat(e.target.value)
                                            field.onChange(val)
                                        }}
                                        max={sisaLimit}
                                        className={qty > sisaLimit ? 'border-red-500' : ''}
                                    />
                                )}
                             />
                             {qty > sisaLimit && <span className="text-xs text-red-500">Melebihi sisa item</span>}
                        </TableCell>
                        <TableCell>
                             <FormField
                                control={form.control}
                                name={`barang.${index}.harga_beli`}
                                render={({ field }) => (
                                    <Input 
                                        type="number" 
                                        {...field} 
                                        disabled={!isSelected}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                    />
                                )}
                             />
                        </TableCell>
                        <TableCell>
                             {formatHarga(qty * hargaBeli)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                   <TableRow>
                    <TableCell colSpan={5} className='font-bold text-right'>
                      Grand Total:
                    </TableCell>
                    <TableCell className='font-bold'>
                      {formatHarga(grandTotal)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className='flex justify-end'>
          <Button type='submit' disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Submit'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
