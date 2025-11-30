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
import { columns } from '../paket/columns'
import { Combobox } from "@/components/ui/combobox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { MonthRangePicker } from "@/components/ui/monthrangepicker"
import { format } from "date-fns"
import LapAduanReport from "./laporan-persediaan"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { MonthPicker } from "@/components/ui/monthpicker"

const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data)


export default function LaporanPersediaan() {

    // const [dates] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });
    // const [selesaiDates, setSelesaiDates] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });
    const [filterLap, setFilterLap] = useState({ month: new Date(), istampilkan: false });
    // const [date, setDate] = useState<{ month: Date; }>({ month: new Date() })


    const handlebuttonTampilkan = () => {
        // if (barang == '') return
        setFilterLap({ ...filterLap, istampilkan: true })
    }

    return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardHeader className="py-4">
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row items-center space-x-4">
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
