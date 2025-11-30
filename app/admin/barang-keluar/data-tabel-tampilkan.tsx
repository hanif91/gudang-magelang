"use client"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import AxiosClient from '@/lib/AxiosClient'
import { AlertCircle, Plus } from 'lucide-react'
import React from 'react'
import useSWR from 'swr'
import { DataTable } from "./data-table"
import { createColumns } from "./columns"
import { useSearchParams } from "next/navigation"
import useFetch from "@/hooks/useFetch"
import { Label } from "@/components/ui/label"

const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data)

interface Props {
	start: Date;
	end: Date;
	isTampilkan: boolean,
	periode: String
}



export default function DataTabelFilter(props: Props) {


	// const { data, error, isLoading } = useSWR(`/api/gudang/barang-keluar?fromTanggal=${pertama}&toTanggal=${akhir}`, fetcher)

	// const { data, error, isLoading } = useSWR(`/api/gudang/barang-keluar`, fetcher)
	const { data, error, isLoading, mutate } = useFetch('/api/gudang/barang-keluar', props)
	const { data: jenisBarang, error: errorJenisBarang, isLoading: isLoadingJenisBarang, mutate: mutateJenisBarang } = useSWR('/api/gudang/jenis-bk', fetcher)
	const { data: jenisAsset, error: errorJenisAsset, isLoading: isLoadingJenisAsset, mutate: mutateJenisAsset } = useSWR('/api/gudang/asset-perpipaan', fetcher)

	// Create columns with mutate function
	const columns = createColumns(mutate)

	console.log("data tabel barang keluar:", data);
	console.log("props data tabel barang keluar:", isLoading);

	if (error || errorJenisBarang || errorJenisAsset) return (
		<main className="flex flex-col gap-5 justify-center content-center p-5">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Barang Keluar</CardTitle>
					<CardDescription>Daftar Barang Keluar</CardDescription>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive" className="mb-5">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error Fetching Data</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				</CardContent>
				<CardFooter></CardFooter>
			</Card>
		</main>
	);
	if (isLoading || isLoadingJenisBarang || isLoadingJenisAsset) return (
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
	if (!data || !jenisBarang || !jenisAsset) {
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
	}

	return (
		<main className="flex flex-col gap-5 justify-center content-center ">
			<Card className="w-full">
				{/* <CardHeader className="py-4">
					<div className="flex justify-end">
						<Link href="/admin/barang-keluar/create">
							<Button variant="default" className="w-32">
								<Plus className="w-4 h-4 mr-1" /> Create
							</Button>
						</Link>
					</div>

				</CardHeader> */}
				<CardContent className="p-2">
					<DataTable jenis_asset={jenisAsset.data ?? []} jenis_barang={jenisBarang.data ?? []} columns={columns} data={data.data} />
					<div className="flex flex-row items-center justify-center space-x-5 space-y-2 p-2">
						<Label className="text-center text-lg">Total Transaksi Barang Keluar Periode {props.periode} : {data.data ? data.data.reduce((acc: number, item: any) => acc + item.total, 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }) : "Rp. 0"}</Label>
					</div>
				</CardContent>
				<CardFooter />
			</Card>
		</main>
	)
}
