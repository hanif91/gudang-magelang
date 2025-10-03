import { Metadata } from "next"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getUser } from "@/lib/actions/usersAction"
import { notFound } from "next/navigation"
import { decrypt } from "@/lib/crypto"
import DataForm from "../data-form"
import { Fragment } from "react"
import { getMerek } from "@/lib/actions/actMerek"
import { getJenis } from "@/lib/actions/actJenis"
import { getPembelianItem } from "@/lib/actions/actPembelianItem"

export const metadata: Metadata = {
  title: "Edit Jenis",
}

export default async function edit({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {

  const paramsId = await searchParams;
  const paramsIdValue = paramsId.id as string || ""
  const id = decrypt(decodeURIComponent(paramsIdValue))
  const data = await getPembelianItem(id)

  console.log(data);
  if (data && !data.success) {
    notFound()
  }

  return (
    <Fragment>
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Edit Pembelian</CardTitle>
            <CardDescription>Edit Pembelian Form</CardDescription>
          </CardHeader>
          <CardContent className="py-0">
            <DataForm pembelian={data.data} />
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </main>
    </Fragment>
  )
}