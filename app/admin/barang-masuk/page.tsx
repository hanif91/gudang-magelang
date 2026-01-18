"use client"
import Link from "next/link"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, CalendarIcon } from 'lucide-react'
import React, { useState } from 'react'


import { Label } from "@/components/ui/label"
import { format } from "date-fns"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { MonthRangePicker } from "@/components/ui/monthrangepicker"
import DataTabelFilter from "./data-tabel-tampilkan"
import { useSearchParams } from "next/navigation"



import { Suspense } from 'react'

function PembelianContent() {
	const searchParams = useSearchParams()
	const [filterLap, setFilterLap] = useState({
		start: searchParams.get('start') ? new Date(searchParams.get('start') as string) : new Date(),
		end: searchParams.get('end') ? new Date(searchParams.get('end') as string) : new Date(),
		istampilkan: false
	});
	const startParam: string | null = searchParams.get('start');

	const handlebuttonTampilkan = () => {
		// if (barang == '') return
		setFilterLap({ ...filterLap, istampilkan: true })
	}
	return (
		<main className="flex flex-col gap-5 justify-center content-center p-5">
			<Card className="w-full">
				<CardHeader className="py-4">
					<div className="flex flex-row items-center justify-between space-x-5">
						<div className="flex flex-row items-center justify-start space-x-5">
							<Label>Periode</Label>
							<div className="w-min">
								<Popover>
									<PopoverTrigger asChild>
										<Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal")}>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{filterLap ? `${format(filterLap.start, "MMM yyyy")} - ${format(filterLap.end, "MMM yyyy")}` : <span>Pick a month range</span>}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<MonthRangePicker onMonthRangeSelect={(newDates: any) => {
											// console.log(newDates)
											// seSelesaiDates(newDates)
											setFilterLap({ ...filterLap, start: newDates.start, end: newDates.end, istampilkan: false })
										}} selectedMonthRange={{ start: filterLap.start, end: filterLap.end }}></MonthRangePicker>
									</PopoverContent>
								</Popover>
							</div>
							<Button onClick={handlebuttonTampilkan} className="ml-20" variant={"secondary"}>Tampilkan</Button>
						</div>
						<div className="flex flex-row items-center justify-start space-x-5">
							{/* <Link href="/admin/barang-masuk/create-non-rekanan" className="flex justify-end">
								<Button variant="default" className="min-w-32">
									<Plus className="w-4 h-4 mr-1" /> Tambah Barang Masuk Non Rekanan
								</Button>
							</Link>
							<Link href="/admin/barang-masuk/create-rekanan" className="flex justify-end">
								<Button variant="default" className="min-w-32">
									<Plus className="w-4 h-4 mr-1" /> Tambah Barang Masuk Full Rekanan
								</Button>
							</Link> */}
                             <Link href="/admin/barang-masuk/create-op" className="flex justify-end">
								<Button variant="default" className="min-w-32">
									<Plus className="w-4 h-4 mr-1" /> Tambah Barang Masuk OP
								</Button>
							</Link>
						</div>
					</div>

				</CardHeader>
				<CardContent>
					{/* <DataTable columns={columns} data={data.data ?? []} /> */}
					{filterLap.istampilkan || startParam != null ? <DataTabelFilter start={filterLap.start} end={filterLap.end} isTampilkan={filterLap.istampilkan} periode={filterLap ? `${format(filterLap.start, "MMM yyyy")} - ${format(filterLap.end, "MMM yyyy")}` : ''} /> : null}
					{/* <DataTabelFilter start={filterLap.start} end={filterLap.end} isTampilkan={filterLap.istampilkan} /> */}
				</CardContent>
				{/* <CardFooter></CardFooter> */}
			</Card>
		</main>
	)
}

export default function Pembelian() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<PembelianContent />
		</Suspense>
	)
}
