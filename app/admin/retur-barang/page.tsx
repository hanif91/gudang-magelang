"use client"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import AxiosClient from '@/lib/AxiosClient'
import { AlertCircle } from 'lucide-react'
import React from 'react'
import useSWR from 'swr'
import { DataTable } from "./data-table"
import { columns } from "./columns"

const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data)


export default function ReturBarangPage() {
    const { data, error, isLoading } = useSWR('/api/gudang/retur-barang', fetcher)
    if (error) return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Retur Barang</CardTitle>
                    <CardDescription>Daftar Retur Barang</CardDescription>
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
    if (isLoading) return (

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
    console.log(data)
    return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardContent>
                    <DataTable columns={columns} data={data.data} />
                </CardContent>
                <CardFooter></CardFooter>
            </Card>
        </main>
    )
}
