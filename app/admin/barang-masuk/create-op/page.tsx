import { Metadata } from "next"
import { Fragment } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import DataFormOp from "../data-form-op"

export const metadata: Metadata = {
  title: "Create Pembelian OP",
}

export default async function CreateOpPage() {
  return (
    <Fragment>
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create Pembelian dari OP</CardTitle>
            <CardDescription>Masukan Data Pembelian Berdasarkan Order Pembelian (OP)</CardDescription>
          </CardHeader>
          <CardContent className="py-0">
            <DataFormOp />
          </CardContent>
          <CardFooter />
        </Card>
      </main>
    </Fragment>
  )
}
