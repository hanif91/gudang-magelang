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
import DataForm from "../data-form-editing-komentar"
import { Fragment } from "react"
import { getBarangKeluar } from "@/lib/actions/actBarangKeluar"

export const metadata: Metadata = {
  title: "Edit Keterangan",
}

export default async function edit({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {

  const paramsId = await searchParams;
  const paramsIdValue = paramsId.id as string || ""
  const id = decrypt(decodeURIComponent(paramsIdValue))
  // console.log("id" ,id)
  const data = await getBarangKeluar(id)

  console.log(data);
  if (data && !data.success) {
    notFound()
  }

  return (
    <Fragment>
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Edit Keterangan</CardTitle>
            <CardDescription>Edit Keterangan Form</CardDescription>
          </CardHeader>
          <CardContent className="py-0">
            <DataForm data={data.data} />
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </main>
    </Fragment>
  )
}