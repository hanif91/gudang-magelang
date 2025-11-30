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
import { DataTable } from '../asset-lokasi/data-table'
import { columns } from '../asset-lokasi/columns'

const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data)


export default function AssetLokasi() {
	const { data, error, isLoading } = useSWR('/api/gudang/asset-lokasi', fetcher)
	// console.log(data.data)
	if (error) return (
		<main className="flex flex-col gap-5 justify-center content-center p-5">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Asset Lokasi</CardTitle>
					<CardDescription>Asset Lokasi Management</CardDescription>
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
	if (isLoading) return (

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
					<Link href="/admin/asset-lokasi/create" className="flex justify-end">
						<Button variant="default" className="w-32">
							<Plus className="w-4 h-4 mr-1" /> Create
						</Button>
					</Link>
				</CardHeader>
				<CardContent>
					<DataTable columns={columns} data={data.data ?? []} />
				</CardContent>
				<CardFooter></CardFooter>
			</Card>
		</main>
	)
}
