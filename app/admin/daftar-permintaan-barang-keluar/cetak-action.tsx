import { Button } from "@/components/ui/button"
import { PrinterIcon } from "lucide-react"
import { useRef } from "react"
import { useReactToPrint } from "react-to-print"

import useSWR from "swr"
import PrintDPBK from "./components/print-dpbk"
import Dpbk from "./models/models"


export default function CetakAction({ data }: { data: Dpbk }) {
    const inputRef = useRef(null)

    // Correct useReactToPrint usage
    const reactToPrintFn = useReactToPrint({
        contentRef: inputRef,
        pageStyle: `
        @page {
            @top-left { content: ""; }
            @top-center { content: ""; }
            @top-right { content: ""; }
            @bottom-left { content: ""; }
            @bottom-center { content: ""; }
            @bottom-right {
                content: "Halaman " counter(page);
                padding-right : 40px;
              }
    }`,
    })

    return <>
        <div className="hidden print:block">
            <PrintDPBK data={data} ref={inputRef} />
        </div>
        <Button type="button" variant={'ghost'} onClick={() => reactToPrintFn()}>
            <PrinterIcon className="h-4 w-4" />
        </Button>
    </>

}
