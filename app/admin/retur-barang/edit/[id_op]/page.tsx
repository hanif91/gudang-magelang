"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { getReturBarangDetail } from "@/lib/actions/actReturBarang"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import DataForm from "./data-form"

export default function EditReturBarangPage() {
    const params = useParams()
    const id_op = params.id_op as string
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!id_op) { return }
            const res = await getReturBarangDetail(id_op)
            if (res && res.success && res.data) {
                setData(res.data)
            }
            setLoading(false)
        }
        fetchData()
    }, [id_op])

    if (loading) return <div className="p-5">Loading...</div>
    if (!data) return <div className="p-5">Data not found</div>

    return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Edit Retur Barang</CardTitle>
                    <CardDescription>{data.noop}</CardDescription>
                </CardHeader>
                <CardContent className="py-0">
                    <DataForm initialData={data} />
                </CardContent>
            </Card>
        </main>
    )
}
