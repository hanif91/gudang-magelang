"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { useSearchParams } from "next/navigation"
import { decrypt } from "@/lib/cryptoClient"
import DataForm from "../data-form"
import { Fragment, Suspense, useEffect, useState } from "react"
import { getDpb } from "@/lib/actions/actDpb"

function EditPageContent() {
  const searchParams = useSearchParams()
  const idParam = searchParams.get("id")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!idParam) {
        setLoading(false)
        return
      }
      const id = decrypt(decodeURIComponent(idParam))
      if (id) {
        const res = await getDpb(id)
        if (res && res.success) {
          setData(res.data)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [idParam])

  if (loading) {
    return (
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Edit Daftar Permintaan Barang</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Edit Daftar Permintaan Barang</CardTitle>
            <CardDescription>Data not found</CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  return (
    <Fragment>
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Edit Daftar Permintaan Barang</CardTitle>
            <CardDescription>Edit Daftar Permintaan Barang Form</CardDescription>
          </CardHeader>
          <CardContent className="py-0">
            <DataForm dpb={data} />
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </main>
    </Fragment>
  )
}

export default function EditPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditPageContent />
    </Suspense>
  )
}