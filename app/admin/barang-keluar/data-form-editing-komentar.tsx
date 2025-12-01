"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
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
import { editKomentar } from "@/lib/actions/actBarangKeluar";
import { Combobox } from "@/components/ui/combobox";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import AxiosClient from "@/lib/AxiosClient";

const fetcher = async (url: string) =>
  await AxiosClient.get(url).then((res) => res.data.data);

interface JenisBk {
  id: string;
  nama: string;
}

interface Asset {
  id: string;
  nama: string;
}

interface BagMinta {
  id: string;
  nama: string;
}

export default function EditingKomentarForm({ data }: { data?: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Queries using react-query
  const {
    data: listJenisBk,
    isLoading: isLoadingJenisBk,
    error: errorJenisBk,
  } = useQuery<JenisBk[]>({
    queryKey: ["jenis-bk"],
    queryFn: () => fetcher("/api/gudang/jenis-bk"),
  });

  const {
    data: listAsset,
    isLoading: isLoadingAsset,
    error: errorListAsset,
  } = useQuery<Asset[]>({
    queryKey: ["asset-perpipaan"],
    queryFn: () => fetcher("/api/gudang/asset-perpipaan"),
  });

  const {
    data: listBagMinta,
    isLoading: isLoadingBagMinta,
    error: errorListBagMinta,
  } = useQuery<BagMinta[]>({
    queryKey: ["bagminta"],
    queryFn: () => fetcher("/api/gudang/bagminta"),
  });

  const formSchema = z.object({
    jenis: z.coerce.number().min(1, "Jenis Barang Keluar tidak boleh kosong"),
    asset: z.coerce.number().min(1, "Asset Perpipaan tidak boleh kosong"),
    bagminta: z.coerce.number().min(1, "Bagian Minta tidak boleh kosong"),
    keterangan: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jenis: data?.jenis_bk_id ?? "",
      asset: data?.asset_perpipaan_id ?? "",
      bagminta: data?.bagminta_id ?? "",
      keterangan: data?.keterangan ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      // const formData = serialize(values);
      const result = await editKomentar(data.id, values);
      if (result.success) {
        toast({
          variant: "default",
          description: "Edit barang keluar berhasil disimpan!",
        });
        router.push("/admin/barang-keluar");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          description: result.message,
        });
      }
    });
  }

  if (errorJenisBk || errorListAsset || errorListBagMinta)
    return <div>failed to load</div>;

  if (
    isLoadingAsset ||
    isLoadingBagMinta ||
    isLoadingJenisBk ||
    !listAsset ||
    !listBagMinta ||
    !listJenisBk
  )
    return (
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader />
          <CardContent className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="space-y-2" key={i}>
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="jenis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Barang Keluar</FormLabel>
              <FormControl>
                <Combobox
                  emptyText={isLoadingJenisBk ? "Loading" : "Tidak ada data"}
                  options={
                    listJenisBk?.map((jenis) => ({
                      value: jenis.id.toString(),
                      label: jenis.nama,
                    })) || []
                  }
                  value={field.value?.toString() || ""}
                  onChange={(value) => field.onChange(Number(value))}
                  placeholder="Pilih Jenis"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="asset"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset</FormLabel>
              <FormControl>
                <Combobox
                  options={
                    listAsset?.map((asset) => ({
                      value: asset.id.toString(),
                      label: asset.nama,
                    })) || []
                  }
                  value={field.value?.toString() || ""}
                  onChange={(value) => field.onChange(Number(value))}
                  placeholder="Pilih Asset"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bagminta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bagian Minta</FormLabel>
              <FormControl>
                <Combobox
                  options={
                    listBagMinta?.map((bag) => ({
                      value: bag.id.toString(),
                      label: bag.nama,
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

        <FormField
          control={form.control}
          name="keterangan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Masukkan Keterangan disini (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
