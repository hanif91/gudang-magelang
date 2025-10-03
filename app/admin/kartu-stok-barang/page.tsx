"use client"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import axios from 'axios'
import { AlertCircle, CalendarIcon, Plus } from 'lucide-react'
import useSWR from 'swr'
import { DataTable } from '../paket/data-table'
import { columns } from '../paket/columns'
import { Combobox } from "@/components/ui/combobox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { MonthRangePicker } from "@/components/ui/monthrangepicker"
import { format } from "date-fns"
import LapAduanReport from "./laporan-stok"
import { useState } from "react"

const fetcher = (url: any) => axios.get(url).then(res => res.data)


export default function KartuStokBarang() {
    const { data: listBarang, error: barangError, isLoading: loadingBarang } = useSWR('/api/barang-all?status=aktif', fetcher)
    const [barang, setBarang] = useState('');
    const [dates] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });
    const [selesaiDates, setSelesaiDates] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });
    const [filterLap, setFilterLap] = useState({ start: new Date(), end: new Date(), istampilkan: false, barang: "" });


    const handlebuttonTampilkan = () => {
        if (barang == '') return
        setFilterLap({ istampilkan: true, start: selesaiDates.start, end: selesaiDates.end, barang: barang })
    }

    if (barangError) return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Kartu Stok Barang</CardTitle>
                    <CardDescription>Kartu Stok Barang</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive" className="mb-5">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Fetching Data</AlertTitle>
                        {/* <AlertDescription>{error}</AlertDescription> */}
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
                    {/* <CardTitle>Users</CardTitle>
				<CardDescription>Users Management</CardDescription> */}
                </CardHeader>
                <CardContent>
                    {/* {!data.success && (
					<Alert variant="destructive" className="mb-5">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error Fetching Data</AlertTitle>
						<AlertDescription>{data.message}</AlertDescription>
					</Alert>
				)} */}
                    {/* <Link href="/users/create" className="flex justify-end">
					<Button variant="default">
						<Plus className="w-4 h-4 mr-1" /> Create
					</Button>
				</Link> */}
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
                                        // console.log(newDates)
                                        setSelesaiDates(newDates)
                                        setFilterLap({ ...filterLap, istampilkan: false })
                                    }} selectedMonthRange={dates}></MonthRangePicker>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Button onClick={handlebuttonTampilkan} className="ml-20" variant={"secondary"}>Tampilkan</Button>
                    </div>

                    {filterLap.istampilkan && <LapAduanReport isTampilkan={filterLap.istampilkan} filter={filterLap} />}



                    {/* {listBarang.data.map((barang: any, index: number) => (
                        <p key={index}>{barang.nama}</p>
                    ))} */}
                </CardContent>
                <CardFooter />
            </Card>
        </main>
    )
}
