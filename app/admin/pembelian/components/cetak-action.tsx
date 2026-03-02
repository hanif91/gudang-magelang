import { Button } from "@/components/ui/button"
import { PrinterIcon } from "lucide-react"
import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import PrintOP from "./print-op"

interface OpItem {
    id_op: number;
    dpb_id: number;
    nodpb: string;
    id_barang: number;
    nama_barang: string;
    qty: number;
    qty_proses: number;
    status: number;
    harga_beli: number;
    subtotal: number;
    nama_user: string | null;
    satuan_barang: string;
    minimal_stok_barang: number;
    harga_jual_barang: string;
    foto_barang: string | null;
    nama_jenis: string;
    nama_kategori: string;
    nama_merek: string;
    harga_no_ppn: number;
}

interface Op {
    no_op: string;
    tanggal: string;
    total_qty: number;
    total_harga: number;
    nama_supplier: string;
    alamat_supplier: string;
    isppn: number;
    isoverwriteppn: number;
    items: OpItem[];
}

export default function CetakAction({ data }: { data: Op }) {
    const inputRef = useRef(null)

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

    if (data == null) {
        return null
    }

    return <>
        <div className="hidden print:block">
            <PrintOP data={data} ref={inputRef} />
        </div>
        <Button type="button" variant={'ghost'} size="icon" onClick={() => reactToPrintFn()}>
            <PrinterIcon className="h-4 w-4" />
        </Button>
    </>
}
