import { Metadata } from "next"
import AppHeaderAdmin from "@/components/header-admin"

import { Fragment } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import DataForm from "../data-form"

export const metadata: Metadata = {
  title: "Create Jenis",
}

export default async function create() {
  return (
		<Fragment>

      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create Jenis</CardTitle>
            <CardDescription>Create Jenis Form</CardDescription>
          </CardHeader>
          <CardContent className="py-0">
            <DataForm />
          </CardContent>
          <CardFooter />
        </Card>
      </main>
    </Fragment>
  )
}






// export default function Page() {
//   return (
// 		<Fragment>
// 		  <AppHeaderAdmin/>
//         <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
//           {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
//             <div className="aspect-video rounded-xl bg-muted/50" />
//             <div className="aspect-video rounded-xl bg-muted/50" />
//             <div className="aspect-video rounded-xl bg-muted/50" />
//           </div>
//           <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
//         </div>
// 			 <AppHeaderAdmin/>
// 		</Fragment>
//   )
// }
