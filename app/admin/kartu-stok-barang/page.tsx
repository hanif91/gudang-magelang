"use client"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import AxiosClient from '@/lib/AxiosClient'
import { AlertCircle, CalendarIcon } from 'lucide-react'
import useSWR from 'swr'
import { Combobox } from "@/components/ui/combobox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { MonthRangePicker } from "@/components/ui/monthrangepicker"
import { format } from "date-fns"
import LapAduanReport from "./laporan-stok"
import LapStokSemuaBarang from "./laporan-stok-semua"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data)


export default function KartuStokBarang() {
    const { data: listBarang, error: barangError, isLoading: loadingBarang } = useSWR('/api/gudang/barang-all?status=aktif', fetcher)
    // Tab 1: Per Barang
    const [barang, setBarang] = useState('');
    const [dates] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });
    const [selesaiDates, setSelesaiDates] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });
    const [filterLap, setFilterLap] = useState({ start: new Date(), end: new Date(), istampilkan: false, barang: "" });

    // Tab 2: Semua Barang
    const [datesSemua] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });
    const [selesaiDatesSemua, setSelesaiDatesSemua] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });
    const [filterSemua, setFilterSemua] = useState({ start: new Date(), end: new Date(), istampilkan: false });

    const handlebuttonTampilkan = () => {
        if (barang == '') return
        setFilterLap({ istampilkan: true, start: selesaiDates.start, end: selesaiDates.end, barang: barang })
    }

    const handlebuttonTampilkanSemua = () => {
        setFilterSemua({ istampilkan: true, start: selesaiDatesSemua.start, end: selesaiDatesSemua.end })
    }

    if (barangError) return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardHeader>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive" className="mb-5">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Fetching Data</AlertTitle>
                    </Alert>
                </CardContent>
                <CardFooter></CardFooter>
            </Card>
        </main>
    );
    if (loadingBarang) return (

        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardHeader>
                </CardHeader>
                <CardContent>
                    <Skeleton className="flex w-full m-1 h-[20px] rounded-full" />
                    <Skeleton className="flex w-full m-1 h-[20px] rounded-full" />
                    <Skeleton className="flex w-full m-1 h-[20px] rounded-full" />
                </CardContent>
                <CardFooter></CardFooter>
            </Card>
        </main>
    )
    return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardHeader className="py-4">
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="per-barang" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="per-barang">Per Barang</TabsTrigger>
                            <TabsTrigger value="semua-barang">Semua Barang</TabsTrigger>
                        </TabsList>

                        {/* Tab 1: Kartu Stok Per Barang */}
                        <TabsContent value="per-barang">
                            <div className="flex flex-row items-center space-x-4">
                                <div className="w-min">
                                    <Combobox
                                        options={
                                            listBarang?.data?.map((data: any) => ({
                                                value: data.id.toString(),
                                                label: data.nama,
                                            })) || []
                                        }
                                        value={barang}
                                        onChange={(value) => { setBarang(value), setFilterLap({ ...filterLap, istampilkan: false }) }}
                                        placeholder="Pilih Barang"
                                    />
                                </div>
                                <div className="w-min">
                                    <Popover >
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dates ? `${format(selesaiDates.start, "MMM yyyy")} - ${format(selesaiDates.end, "MMM yyyy")}` : <span>Pick a month range</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <MonthRangePicker onMonthRangeSelect={(newDates: any) => {
                                                setSelesaiDates(newDates)
                                                setFilterLap({ ...filterLap, istampilkan: false })
                                            }} selectedMonthRange={dates}></MonthRangePicker>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <Button onClick={handlebuttonTampilkan} className="ml-20" variant={"secondary"}>Tampilkan</Button>
                            </div>

                            {filterLap.istampilkan && <LapAduanReport isTampilkan={filterLap.istampilkan} filter={filterLap} />}
                        </TabsContent>

                        {/* Tab 2: Kartu Stok Semua Barang */}
                        <TabsContent value="semua-barang">
                            <div className="flex flex-row items-center space-x-4">
                                <div className="w-min">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {datesSemua ? `${format(selesaiDatesSemua.start, "MMM yyyy")} - ${format(selesaiDatesSemua.end, "MMM yyyy")}` : <span>Pick a month range</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <MonthRangePicker onMonthRangeSelect={(newDates: any) => {
                                                setSelesaiDatesSemua(newDates)
                                                setFilterSemua({ ...filterSemua, istampilkan: false })
                                            }} selectedMonthRange={datesSemua}></MonthRangePicker>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <Button onClick={handlebuttonTampilkanSemua} variant={"secondary"}>Tampilkan</Button>
                            </div>

                            {filterSemua.istampilkan && <LapStokSemuaBarang isTampilkan={filterSemua.istampilkan} filter={filterSemua} />}
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter />
            </Card>
        </main>
    )
}
