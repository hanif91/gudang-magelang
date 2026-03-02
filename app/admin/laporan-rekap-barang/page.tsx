"use client"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import AxiosClient from '@/lib/AxiosClient'
import { AlertCircle, CalendarIcon, Plus } from 'lucide-react'
import useSWR from 'swr'
import { Combobox } from "@/components/ui/combobox"
import { cn } from "@/lib/utils"
import LapAduanReport, { LapAduanReportRef } from "./laporan-rekap-barang"
import { useState, useRef } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data)

export default function LaporanRekapBarang() {
    const { data: listBarang, isLoading: loadingBarang } = useSWR('/api/gudang/barang-all?status=aktif', fetcher)
    const { data: listUnit, isLoading: loadingUnit } = useSWR('/api/gudang/unit', fetcher)
    const { data: listKategori, isLoading: loadingKategori } = useSWR('/api/gudang/kategori', fetcher)

    const [filterLap, setFilterLap] = useState({ tahun: new Date().getFullYear().toString(), barang: "", unit: "", kategori: "", istampilkan: false });
    const [dataLap, setDataLap] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const reportRef = useRef<LapAduanReportRef>(null);

    const { data: formatLaporan, isLoading: formatLaporanLoading } = useSWR(
        `/api/portal/settings/attribute-lap?namalap=LRKB`,
        fetcher
    );

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => (currentYear - 5 + i).toString());

    const handlebuttonTampilkan = async () => {
        setLoading(true);
        setFilterLap({ ...filterLap, istampilkan: true });

        try {
            const res = await AxiosClient.get(`/api/gudang/laporan-rekap-barang?tahun=${filterLap.tahun}&barang=${filterLap.barang}&unit=${filterLap.unit}&kategori=${filterLap.kategori}`);
            setDataLap(res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }

    const isLoading = loading || loadingBarang || loadingUnit || loadingKategori || formatLaporanLoading;

    if (isLoading && !filterLap.istampilkan) {
        return (
            <main className="flex flex-col gap-5 justify-center content-center p-5">
                <Card className="w-full">
                    <CardContent className="pt-6">
                        <Skeleton className="flex w-full m-1 h-[40px] rounded-md mb-2" />
                        <Skeleton className="flex w-full m-1 h-[300px] rounded-md" />
                    </CardContent>
                </Card>
            </main>
        )
    }

    return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Laporan Rekap Barang</CardTitle>
                    <CardDescription>Laporan rekapitulasi jumlah barang per bulan</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Tahun</label>
                            <Select
                                value={filterLap.tahun}
                                onValueChange={(val) => setFilterLap({ ...filterLap, tahun: val, istampilkan: false })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => (
                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Kode Barang</label>
                            <Combobox
                                options={
                                    listBarang?.data?.map((data: any) => ({
                                        value: data.id.toString(),
                                        label: data.nama,
                                    })) || []
                                }
                                value={filterLap.barang}
                                onChange={(value) => setFilterLap({ ...filterLap, barang: value, istampilkan: false })}
                                placeholder="Semua Barang"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Kategori</label>
                            <Combobox
                                options={
                                    listKategori?.data?.map((data: any) => ({
                                        value: data.id.toString(),
                                        label: data.nama,
                                    })) || []
                                }
                                value={filterLap.kategori}
                                onChange={(value) => setFilterLap({ ...filterLap, kategori: value, istampilkan: false })}
                                placeholder="Semua Kategori"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Cabang</label>
                            <Combobox
                                options={
                                    listUnit?.data?.map((data: any) => ({
                                        value: data.id.toString(),
                                        label: data.nama,
                                    })) || []
                                }
                                value={filterLap.unit}
                                onChange={(value) => setFilterLap({ ...filterLap, unit: value, istampilkan: false })}
                                placeholder="Semua Cabang"
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <Button onClick={handlebuttonTampilkan} className="w-full" variant={"secondary"}>Tampilkan</Button>
                        </div>
                    </div>

                    {filterLap.istampilkan && loading && (
                        <div className="w-full mt-8 mx-auto">
                            <Skeleton className="w-full h-[300px]" />
                        </div>
                    )}

                    <LapAduanReport
                        ref={reportRef}
                        isTampilkan={filterLap.istampilkan}
                        filter={filterLap}
                        data={dataLap}
                        formatLaporan={formatLaporan}
                    />
                </CardContent>
            </Card>
        </main>
    )
}
