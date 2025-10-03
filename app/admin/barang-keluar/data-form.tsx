"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { any, z } from "zod";
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
import { createBarangKeluar } from "@/lib/actions/actBarangKeluar";
import axios from "axios";
import useSWR from "swr";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

interface Dpbk {
  id: number;
  nodpbk: string;
  barang: Barang[];
}

interface JenisBk {
  id: number;
  nama: string;
}

interface KodeKeper {
  id: number;
  nama: string;
}

interface AssetPipa {
  id: number;
  nama: string;
}
interface BagianMinta {
  id: number;
  nama: string;
}

interface Barang {
  barang_id: number;
  stok_barang: number;
  id_nodpbk: number;
  nama_barang: string;
  tanggal: string;
  qty: number;
  nama_user: string;
  satuan_barang: string;
  minimal_stok_barang: number;
  harga_jual_barang: string;
  foto_barang: string | null;
  nama_jenis: string;
  nama_kategori: string;
  nama_merek: string;
}

const fetcher = (url: any) => axios.get(url).then((res) => res.data);

const formSchema = z.object({
  dpbk_id: z.coerce.number().min(1, "Id DPB is required"),
  bagminta_id: z.coerce.number().min(1, "Bagian Minta is required"),
  // kodekeper_id: z.coerce.number().min(1, "Kode Keperluan is required"),
  asset_perpipaan_id: z.coerce.number().min(1, "Asset Pipa is required"),
  jenis_bk_id: z.coerce.number().min(1, "Jenis BK is required"),
  tanggal: z.string().min(1, "Tanggal is required"),
  barang: z
    .array(
      z.object({
        dpbk_id: z.coerce.number().min(1, "DPBK ID is required"),
        barang_id: z.coerce.number().min(1, "Barang is required"),
        qty: z.coerce.number().gt(0, "Qty harus lebih dari 0"),
      })
    )
    .min(1, "Pilih minimal 1 barang"),
  keterangan: z.string().optional(),
});

export default function BarangKeluarForm({
  barangKeluar,
}: {
  barangKeluar?: any;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { data, isLoading, error } = useSWR("/api/dpbk", fetcher);
  const {
    data: listJenisBk,
    isLoading: isLoadingJenisBk,
    error: errorJenisBk,
  } = useSWR("/api/jenis-bk", fetcher);
  const {
    data: listKodeKeper,
    isLoading: isLoadingKodeKeper,
    error: errorKodeKeper,
  } = useSWR("/api/kodekeper", fetcher);
  const {
    data: listBagianMinta,
    isLoading: isLoadingBagianMinta,
    error: errorBagianMinta,
  } = useSWR("/api/bagminta", fetcher);
  const {
    data: listAssetPipa,
    isLoading: isLoadingAssetPipa,
    error: errorAssetPipa,
  } = useSWR("/api/asset-perpipaan", fetcher);
  const [selectedDpbks, setSelectedDpbks] = useState<Dpbk[]>([]); // State untuk menyimpan DPBK yang dipilih
  const [selectedBarang, setSelectedBarang] = useState<Barang[]>([]); // State untuk menyimpan barang yang dipilih
  const [grandTotal, setGrandTotal] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tanggal: barangKeluar?.tanggal
        ? new Date(barangKeluar.tanggal).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      dpbk_id: barangKeluar?.dpb_id ? barangKeluar.dpb_id : "",
      bagminta_id: barangKeluar?.bagminta ? barangKeluar.dpb_id : "",
      asset_perpipaan_id: barangKeluar?.asset_perpipaan_id ?? "",
      jenis_bk_id: barangKeluar?.jenis_bk_id ?? "",
      barang: barangKeluar?.barang
        ? barangKeluar.barang.map(
            (item: {
              barang_id: number;
              qty: number;
              harga_beli: number;
              dpb_id: number;
            }) => ({
              dpb_id: item.dpb_id,
              barang_id: item.barang_id,
              qty: item.qty,
              harga_beli: item.harga_beli,
            })
          )
        : [],
      keterangan: barangKeluar?.keterangan ?? "",
    },
  });

  // Fungsi untuk menambahkan DPBK yang dipilih
  const handleAddDpbk = (dpbkId: number) => {
    setSelectedDpbks([]);
    const selectedDpbk = data?.data?.find((dpbk: any) => dpbk.id === dpbkId);
    if (selectedDpbk) {
      setSelectedDpbks((prev) => [...prev, selectedDpbk]);
    }
  };

  // Fungsi untuk menambahkan barang yang dipilih
  const handleAddBarang = (barang: Barang) => {
    // Validasi qty tidak melebihi stok_barang
    const qtyAwal = Number(barang.qty);
    const qtyValid =
      qtyAwal > barang.stok_barang ? barang.stok_barang : qtyAwal;

    // Update state selectedBarang
    const barangDenganQtyValid = { ...barang, qty: qtyValid };
    setSelectedBarang((prev) => [...prev, barangDenganQtyValid]);

    // Update form barang field
    form.setValue("barang", [
      ...form.getValues("barang"),
      {
        dpbk_id: barang.id_nodpbk,
        barang_id: barang.barang_id,
        qty: qtyValid, // Gunakan qty yang sudah divalidasi
      },
    ]);
  };

  const handleSelectAll = () => {
    const availableBarang = getAvailableBarang();
    const newSelectedBarang = [...selectedBarang, ...availableBarang];
    setSelectedBarang(newSelectedBarang);

    // Update form barang field
    const newFormBarang = [
      ...form.getValues("barang"),
      ...availableBarang.map((barang) => ({
        dpbk_id: barang.id_nodpbk,
        barang_id: barang.barang_id,
        qty: Number(barang.qty),
      })),
    ];
    form.setValue("barang", newFormBarang);
  };

  // Fungsi untuk menghapus barang yang dipilih
  const handleRemoveBarang = (barangId: number) => {
    setSelectedBarang((prev) =>
      prev.filter((item) => item.barang_id !== barangId)
    );
    // Update form barang field
    form.setValue(
      "barang",
      form.getValues("barang").filter((item) => item.barang_id !== barangId)
    );
  };

  // Fungsi untuk mendapatkan daftar barang yang tersedia (belum dipilih)
  const getAvailableBarang = () => {
    const selectedBarangIds = selectedBarang.map((item) => item.barang_id);
    const selectedDpbkIds = selectedBarang.map((item) => item.id_nodpbk);
    return selectedDpbks
      .flatMap((dpbk) => dpbk.barang)
      .filter(
        (barang) =>
          !selectedBarangIds.includes(barang.barang_id) ||
          !selectedDpbkIds.includes(barang.id_nodpbk)
      );
  };

  // Fungsi untuk mengupdate qty barang yang dipilih
  const handleUpdateQty = (barangId: number, newQty: number) => {
    const updatedBarang = selectedBarang.map((item) =>
      item.barang_id === barangId ? { ...item, qty: newQty } : item
    );
    setSelectedBarang(updatedBarang);

    // Update form barang field
    const updatedFormBarang = form
      .getValues("barang")
      .map((item) =>
        item.barang_id === barangId ? { ...item, qty: newQty } : item
      );
    form.setValue("barang", updatedFormBarang);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = serialize(values);
      // console.log(formData)
      const dataResponse = await createBarangKeluar(formData);

      if (dataResponse.success) {
        toast({
          variant: "default",
          description: "Data BarangKeluar berhasil disimpan!",
        });
        router.push(`/admin/barang-keluar?start=${dataResponse.parameter.start}&end=${dataResponse.parameter.end}`);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          description: dataResponse.message,
        });
      }
    });
  }

  async function onTesCliec() {
            // router.refresh();
        router.push("/admin/barang-keluar?start=2025-05-01&end=2025-05-30");

  }

  // const formatHarga = (harga: number) => {
  //   return new Intl.NumberFormat("id-ID", {
  //     style: "currency",
  //     currency: "IDR",
  //     minimumFractionDigits: 0,
  //   }).format(harga);
  // };

  if (
    error ||
    errorAssetPipa ||
    errorBagianMinta ||
    errorJenisBk ||
    errorKodeKeper
  )
    return (
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader />
          <CardContent>
            <p className="text-red-500">
              Gagal memuat data. Silakan coba lagi.
            </p>
          </CardContent>
          <CardFooter />
        </Card>
      </main>
    );

  if (
    !data ||
    !listJenisBk ||
    !listAssetPipa ||
    !listBagianMinta ||
    !listKodeKeper
  ) {
    return (
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader />
          <CardContent className="space-y-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-1/4 rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </CardContent>
          <CardFooter />
        </Card>
      </main>
    );
  }

  if (
    isLoading ||
    isLoadingJenisBk ||
    isLoadingBagianMinta ||
    isLoadingKodeKeper ||
    isLoadingAssetPipa
  ) {
    return (
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader />
          <CardContent className="space-y-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-1/4 rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </CardContent>
          <CardFooter />
        </Card>
      </main>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
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
            name="jenis_bk_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Barang Keluar</FormLabel>
                <FormControl>
                  <Combobox
                    emptyText={isLoadingJenisBk ? "Loading" : "Tidak ada data"}
                    options={
                      listJenisBk?.data?.map((jenis: any) => ({
                        value: jenis.id.toString(),
                        label: jenis.nama,
                      })) || []
                    }
                    value={field.value?.toString() || ""}
                    onChange={(value) => field.onChange(Number(value))}
                    placeholder="Pilih Jenis Barang Keluar"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="asset_perpipaan_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset Pipa</FormLabel>
                <FormControl>
                  <Combobox
                    emptyText={
                      isLoadingAssetPipa ? "Loading" : "Tidak ada data"
                    }
                    options={
                      listAssetPipa?.data?.map((pipa: any) => ({
                        value: pipa.id.toString(),
                        label: pipa.nama,
                      })) || []
                    }
                    value={field.value?.toString() || ""}
                    onChange={(value) => field.onChange(Number(value))}
                    placeholder="Pilih Asset Pipa"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bagminta_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bagian Minta</FormLabel>
                <FormControl>
                  <Combobox
                    emptyText={
                      isLoadingBagianMinta ? "Loading" : "Tidak ada data"
                    }
                    options={
                      listBagianMinta?.data?.map((bagian: any) => ({
                        value: bagian.id.toString(),
                        label: bagian.nama,
                      })) || []
                    }
                    value={field.value?.toString() || ""}
                    onChange={(value) => field.onChange(Number(value))}
                    placeholder="Pilih Bagian"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name="kodekeper_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Keperluan</FormLabel>
                <FormControl>
                  <Combobox
                    emptyText={isLoadingKodeKeper ? "Loading" : "Tidak ada data"}
                    options={listKodeKeper.map((kode) => ({
                      value: kode.id.toString(),
                      label: kode.nama,
                    }))}
                    value={field.value?.toString() || ""}
                    onChange={(value) => field.onChange(Number(value))}
                    placeholder="Pilih Kode Keperluan"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
        </div>

        <FormField
          control={form.control}
          name="keterangan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan</FormLabel>
              <FormControl>
                <Textarea placeholder="Keterangan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dpbk_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>No DPBK</FormLabel>
              <FormControl>
                <Combobox
                  options={
                    data?.data?.map((dpbk: any) => ({
                      value: dpbk.id.toString(),
                      label: dpbk.nodpbk,
                    })) || []
                  }
                  value={field.value?.toString() || ""}
                  onChange={(value) => {
                    field.onChange(Number(value));
                    handleAddDpbk(Number(value));
                  }}
                  placeholder="Pilih No DPB"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row items-center justify-between space-x-14">
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Daftar Barang Tersedia:</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Stok</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getAvailableBarang().map((barang, index) => (
                  <TableRow
                    className="cursor-pointer"
                    key={index}
                    onClick={() => handleAddBarang(barang)}
                  >
                    <TableCell>{barang.nama_barang}</TableCell>
                    <TableCell>{barang.qty}</TableCell>
                    <TableCell>{barang.satuan_barang}</TableCell>
                    <TableCell>{barang.stok_barang}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-center">
            <Button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center justify-center w-10 h-10 p-2"
            >
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>

          <div className="w-full">
            <h3 className="text-lg font-semibold mb-4">Barang yang Dipilih:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedBarang.map((barang, index) => (
                  <TableRow key={index}>
                    <TableCell>{barang.nama_barang}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="any"
                        value={barang.qty}
                        onChange={(e) => {
                          const newQty = Number(e.target.value);

                          if (newQty > barang.stok_barang) {
                            handleUpdateQty(
                              barang.barang_id,
                              barang.stok_barang
                            );
                          } else {
                            handleUpdateQty(barang.barang_id, newQty);
                          }
                        }}
                        max={barang.stok_barang} // Nilai maksimal adalah stok_barang
                      />
                    </TableCell>
                    <TableCell>{barang.satuan_barang}</TableCell>
                    <TableCell>{barang.stok_barang}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        onClick={() => handleRemoveBarang(barang.barang_id)}
                      >
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Tombol Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            Submit
          </Button>
        </div>
\
      </form>
    </Form>
  );
}
