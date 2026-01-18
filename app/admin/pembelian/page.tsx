"use client"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import AxiosClient from '@/lib/AxiosClient'
import { AlertCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import useSWR from 'swr'
import { DataTable } from './data-table'
import { columns } from './columns'
import { Skeleton } from '@/components/ui/skeleton'

const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data)

export default function PembelianPage() {
    const { data, error, isLoading } = useSWR('/api/gudang/dpb/by-no-op', fetcher)

    if (error) return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Pembelian (OP)</CardTitle>
                    <CardDescription>Daftar Order Pembelian</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive" className="mb-5">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Fetching Data</AlertTitle>
                        <AlertDescription>{error.message || "Unknown error"}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </main>
    );

    if (isLoading) return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Pembelian (OP)</CardTitle>
                    <CardDescription>Daftar Order Pembelian</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-[40px] w-full" />
                    <Skeleton className="h-[40px] w-full" />
                    <Skeleton className="h-[40px] w-full" />
                </CardContent>
            </Card>
        </main>
    )

    return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardHeader className="py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Pembelian (OP)</CardTitle>
                            <CardDescription>Daftar Order Pembelian</CardDescription>
                        </div>
                        <Link href="/admin/pembelian/create">
                            <Button variant="default">
                                <Plus className="w-4 h-4 mr-1" /> Create OP
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={data.data ?? []} />
                </CardContent>
            </Card>
        </main>
    )
}
