import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
// import PrintDPB from "./components/print-dpb"
import useSWR from "swr";
import PrintBarangKeluar from "./components/print-barang-keluar";

interface Dpb {
  id: number;
  nodpb: string;
  tanggal: string;
  barang: Barang[];
}

interface Barang {
  id: number;
  nama_barang: string;
  satuan_barang: string;
  qty: number;
  nama_jenis: string;
  nama_kategori: string;
  nama_merek: string;
  stok: number;
}
export default function CetakAction({ data }: { data: any }) {
  const inputRef = useRef(null);

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
  });

  return (
    <>
      <div className="hidden print:block">
        <PrintBarangKeluar data={data} ref={inputRef} />
      </div>
      <Button type="button" variant={"ghost"} onClick={() => reactToPrintFn()}>
        <PrinterIcon className="h-4 w-4" />
      </Button>
    </>
  );
}
