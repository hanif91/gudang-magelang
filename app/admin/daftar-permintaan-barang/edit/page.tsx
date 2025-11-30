import { Metadata } from "next"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { notFound } from "next/navigation"
import { decrypt } from "@/lib/crypto"
import DataForm from "../data-form"
import { Fragment } from "react"
import { getBarang } from "@/lib/actions/actBarang"
import { getDpb } from "@/lib/actions/actDpb"

export const metadata: Metadata = {
  title: "Edit Daftar Permintaan Barang",
}

export default async function edit({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {

  const paramsId = await searchParams;
  const paramsIdValue = paramsId.id as string || ""
  const id = decrypt(decodeURIComponent(paramsIdValue))
  const data = await getDpb(id)

  console.log(data);
  if (data && !data.success) {
    notFound()
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
            <DataForm dpb={data.data[0]} />
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </main>
    </Fragment>
  )
}