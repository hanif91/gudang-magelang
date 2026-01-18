"use client"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import AxiosClient from '@/lib/AxiosClient'
import { AlertCircle, Plus, CalendarIcon } from 'lucide-react'
import React, { useState } from 'react'
import useSWR from 'swr'
import { DataTable } from '../barang-masuk/data-table'
import { columns } from '../barang-masuk/columns'
import { Label } from "@/components/ui/label"
import { differenceInBusinessDays, format } from "date-fns"
import { MonthPicker } from "@/components/ui/monthpicker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { MonthRangePicker } from "@/components/ui/monthrangepicker"
import useFetch from "@/hooks/useFetch"
const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data)


interface Props {
	start: Date;
	end: Date;
	isTampilkan: boolean,
	periode: String
}


export default function DataTabelFilter(props: Props) {
	// const { data, error, isLoading } = useSWR('/api/gudang/pembelian-item', fetcher)
	const { data: UserData, isLoading: UserLoading, error: UserError, mutate: UserMutate } = useFetch('/api/gudang/pembelian-item', props)

	// if (props.isTampilkan === false || props.isTampilkan === undefined) {
	// 	return null
	// }

	if (UserError) return (
		<main className="flex flex-col gap-5 justify-center content-center p-5">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Barang Masuk</CardTitle>
					<CardDescription>Daftar Barang Masuk</CardDescription>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive" className="mb-5">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error Fetching Data</AlertTitle>
						<AlertDescription>{UserError}</AlertDescription>
					</Alert>
				</CardContent>
				<CardFooter></CardFooter>
			</Card>
		</main>
	);
	if (UserLoading) return (
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
		<>
			<DataTable columns={columns} data={UserData.data ?? []} />
			<div className="flex flex-row items-center justify-center space-x-5 space-y-2 p-5">
				<Label className="text-center text-lg">Total Transaksi Barang Masuk Periode {props.periode} : {UserData.data ? UserData.data.reduce((acc: number, item: any) => acc + item.total, 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }) : "Rp. 0"}</Label>
			</div>
		</>


	)
}