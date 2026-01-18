"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getOpDetail } from "@/lib/actions/actPembelianItem"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import DataForm from "./data-form"

export default function EditPage() {
    const params = useParams()
    const noop = decodeURIComponent(params.noop as string)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!noop) { return }
            const res = await getOpDetail(noop)
            if (res && res.success && res.data && res.data.length > 0) {
                 setData(res.data[0]) 
            }
            setLoading(false)
        }
        fetchData()
    }, [noop])

    if (loading) return <div className="p-5">Loading...</div>
    if (!data) return <div className="p-5">Data not found</div>

    return (
        <main className="flex flex-col gap-5 justify-center content-center p-5">
             <Card className="w-full">
                <CardHeader>
                    <CardTitle>Edit Order Pembelian (OP)</CardTitle>
                    <CardDescription>{noop}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataForm op={data} />
                </CardContent>
             </Card>
        </main>
    )
}
