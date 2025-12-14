"use client"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import AxiosClient from '@/lib/AxiosClient'
import { AlertCircle, CalendarIcon, Plus } from 'lucide-react'
import useSWR from 'swr'
import { DataTable } from '../paket/data-table'
import { columns } from './columns'
import { Combobox } from "@/components/ui/combobox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { MonthRangePicker } from "@/components/ui/monthrangepicker"
import { format } from "date-fns"
import LapAduanReport, { LapAduanReportRef } from "./laporan-stok"
import { useState, useEffect, useRef } from "react"
import { Calendar } from "@/components/ui/calendar"
import { MonthPicker } from "@/components/ui/monthpicker"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data)


export default function LaporanStok() {

    const [filterLap, setFilterLap] = useState({ month: new Date(), istampilkan: false });
    const [data, setData] = useState<any>(null);
    const [filteredData, setFilteredData] = useState<any>(null);
    const [flatData, setFlatData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [types, setTypes] = useState<string[]>([]);
    const [filters, setFilters] = useState({ category: "all", type: "all" });
    const reportRef = useRef<LapAduanReportRef>(null);

    const { data: formatLaporan, isLoading: formatLaporanLoading } = useSWR(
        `/api/portal/settings/attribute-lap?namalap=LPS`,
        fetcher
    );

    const handlebuttonTampilkan = async () => {
        setLoading(true);
        setFilterLap({ ...filterLap, istampilkan: true });
        try {
            const month = format(filterLap.month, "yyyyMM");
            const res = await AxiosClient.get(`/api/gudang/laporan-stok?month=${month}`);
            setData(res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (data?.data?.laporan) {
            // Extract categories and types
            const uniqueCategories = Array.from(new Set(data.data.laporan.map((cat: any) => cat.kategori))) as string[];
            setCategories(uniqueCategories);

            const allTypes = data.data.laporan.flatMap((cat: any) => cat.detail.map((item: any) => item.jenis));
            const uniqueTypes = Array.from(new Set(allTypes.filter((t: any) => t))) as string[];
            setTypes(uniqueTypes);

            applyFilters();
        }
    }, [data, filters]);

    const applyFilters = () => {
        if (!data?.data?.laporan) return;

        let newLaporan = data.data.laporan.map((cat: any) => ({
            ...cat,
            detail: cat.detail.filter((item: any) => {
                const categoryMatch = filters.category === "all" || cat.kategori === filters.category;
                const typeMatch = filters.type === "all" || item.jenis === filters.type;
                return categoryMatch && typeMatch;
            })
        })).filter((cat: any) => cat.detail.length > 0);

        // Recalculate rekapitulasi based on filtered data if needed
        const newRekapitulasi = newLaporan.map((cat: any) => {
            return {
                kategori: cat.kategori,
                qtyawal: cat.detail.reduce((sum: number, item: any) => sum + Number(item.qtyawal || 0), 0),
                qtymasuk: cat.detail.reduce((sum: number, item: any) => sum + Number(item.qtymasuk || 0), 0),
                qtykeluar: cat.detail.reduce((sum: number, item: any) => sum + Number(item.qtykeluar || 0), 0),
                qtyakhir: cat.detail.reduce((sum: number, item: any) => sum + Number(item.qtyakhir || 0), 0),
            };
        });

        const newFilteredData = {
            ...data,
            data: {
                ...data.data,
                laporan: newLaporan,
                rekapitulasi: newRekapitulasi
            }
        };

        setFilteredData(newFilteredData);

        // Flatten data for DataTable
        const flat = newLaporan.flatMap((cat: any) =>
            cat.detail.map((item: any) => ({
                ...item,
                kategori: cat.kategori
            }))
        );
        setFlatData(flat);
    };

    const isLoading = loading || formatLaporanLoading;

    return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardHeader className="py-4">
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row items-center space-x-4 mb-6">
                        <div className="w-min">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !filterLap.month && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filterLap.month ? format(filterLap.month, "MMMM yyyy") : <span>Pilih Bulan</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <MonthPicker onMonthSelect={(month) => setFilterLap({ month: month, istampilkan: false })} selectedMonth={filterLap.month} />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Button onClick={handlebuttonTampilkan} className="ml-20" variant={"secondary"}>Tampilkan</Button>
                        {filterLap.istampilkan && !isLoading && (
                            <Button onClick={() => reportRef.current?.handlePrint()} className="ml-4" variant={"outline"}>
                                Cetak Laporan
                            </Button>
                        )}
                    </div>

                    {filterLap.istampilkan && (
                        isLoading ? (
                            <div className="w-full mt-8 mx-auto">
                                <Skeleton className="w-full h-[300px]" />
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-4 mb-4">
                                    <div className="w-[200px]">
                                        <label className="text-sm font-medium mb-1 block">Kategori</label>
                                        <Select value={filters.category} onValueChange={(val) => setFilters({ ...filters, category: val })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Semua Kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Kategori</SelectItem>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-[200px]">
                                        <label className="text-sm font-medium mb-1 block">Jenis</label>
                                        <Select value={filters.type} onValueChange={(val) => setFilters({ ...filters, type: val })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Semua Jenis" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Jenis</SelectItem>
                                                {types.map((type) => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <DataTable columns={columns} data={flatData} />
                                </div>

                                <LapAduanReport
                                    ref={reportRef}
                                    isTampilkan={filterLap.istampilkan}
                                    filter={filterLap}
                                    data={filteredData}
                                    formatLaporan={formatLaporan}
                                />
                            </>
                        )
                    )}
                </CardContent>
                <CardFooter />
            </Card>
        </main>
    )
}
