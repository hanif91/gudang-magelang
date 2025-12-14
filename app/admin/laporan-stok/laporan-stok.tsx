"use client";
import useSWR from "swr";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AxiosClient from "@/lib/AxiosClient";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import formatHarga from "@/lib/format-harga";
import formatBulanIndonesia from "@/lib/format-bulan";

interface Props {
  filter: {
    month: Date;
  };
  isTampilkan: boolean;
  data: any;
  isLoading?: boolean;
  formatLaporan?: any;
}

export interface LapAduanReportRef {
  handlePrint: () => void;
}

const fetcher = (url: string) => AxiosClient.get(url).then((res) => res.data);

const LapAduanReport = React.forwardRef<LapAduanReportRef, Props>((props, ref) => {
  const month = format(props.filter.month, "yyyyMM");
  const periodeText = formatBulanIndonesia(props.filter.month);

  const barang = props.data;
  // const barangLoading = props.isLoading; // Handled by parent

  const formatLaporan = props.formatLaporan;

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    pageStyle: `
            @page {
                size: landscape;
                margin: 10mm;
                @top-left { content: ""; }
                @top-center { content: ""; }
                @top-right { content: ""; }
                @bottom-left { content: ""; }
                @bottom-center { content: ""; }
                @bottom-right {
                    content: "Halaman " counter(page);
                    padding-right: 40px;
                }
            }
            @media print {
                body {
                    zoom: 80%;
                }
                table {
                    width: 100%;
                    font-size: 10px;
                }              
                th, td {
                    padding: 4px !important;
                    word-wrap: break-word !important;
                }
                .qty-col {
                    max-width: 20px !important;
                }
                .harga-col {
                    max-width: 100px !important;
                }
                .saldo-col {
                    max-width: 200px !important;
                }
            }
        `,
  });

  React.useImperativeHandle(ref, () => ({
    handlePrint
  }));

  // Loading handled by parent
  // if (barangLoading || formatLaporanLoading) { ... }

  console.log(barang);

  // Calculate row numbers per category
  let globalIndex = 0;
  const dataWithRowNumbers = barang?.data?.laporan?.map((category: any) => {
    const detailsWithNumbers = category.detail.map((item: any) => {
      globalIndex++;
      return { ...item, rowNumber: globalIndex };
    });
    return { ...category, detail: detailsWithNumbers };
  });

  const totalRecap = {
    qtyawal:
      barang?.data?.rekapitulasi?.reduce(
        (sum: number, item: any) => sum + Number(item.qtyawal || 0),
        0
      ) || 0,
    qtymasuk:
      barang?.data?.rekapitulasi?.reduce(
        (sum: number, item: any) => sum + Number(item.qtymasuk || 0),
        0
      ) || 0,
    qtykeluar:
      barang?.data?.rekapitulasi?.reduce(
        (sum: number, item: any) => sum + Number(item.qtykeluar || 0),
        0
      ) || 0,
    qtyakhir:
      barang?.data?.rekapitulasi?.reduce(
        (sum: number, item: any) => sum + Number(item.qtyakhir || 0),
        0
      ) || 0,
  };
  const formatTanggal = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const ttdFilter = formatLaporan?.data?.paraf?.ttd?.filter(
    (e: any) => e.is_id === true
  );

  return (
    <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
      <div ref={componentRef} className="px-10">
        <div className="flex items-center gap-4 mb-6">
          <Image className="w-16 h-16" src="/logo.png" alt="Logo Perumdam" width={64} height={64} />
          <div className="text-green-800">
            <h1 className="font-bold text-lg">
              {formatLaporan?.data?.header?.headerlap1}
            </h1>
            <p className="text-sm">{formatLaporan?.data?.header?.headerlap2}</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="font-bold text-xl">LAPORAN REKAPITULASI BARANG</h2>
          <p className="text-sm">PERIODE : {periodeText}</p>
        </div>

        {/* Tabel Utama */}
        <Table className="border border-collapse w-full table-auto mb-8">
          <TableHeader>
            <TableRow>
              <TableHead
                className="border border-black text-center font-bold w-[40px]"
                rowSpan={2}
              >
                NO
              </TableHead>
              <TableHead
                className="border border-black text-center font-bold w-[100px]"
                rowSpan={2}
              >
                JENIS
              </TableHead>
              <TableHead
                className="border border-black text-center font-bold w-[200px]"
                rowSpan={2}
              >
                NAMA BARANG
              </TableHead>
              <TableHead
                className="border border-black text-center font-bold w-[60px]"
                rowSpan={2}
              >
                SAT
              </TableHead>
              <TableHead
                className="border border-black text-center font-bold"
                colSpan={4}
              >
                Barang - Barang
              </TableHead>
              <TableHead
                className="border border-black text-center font-bold w-[80px]"
                rowSpan={2}
              >
                KET
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="border border-black text-center font-bold qty-col">
                AWAL
              </TableHead>
              <TableHead className="border border-black text-center font-bold qty-col">
                MASUK
              </TableHead>
              <TableHead className="border border-black text-center font-bold qty-col">
                KELUAR
              </TableHead>
              <TableHead className="border border-black text-center font-bold qty-col">
                AKHIR
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataWithRowNumbers?.map((category: any) => (
              <React.Fragment key={`category-${category.kategori}`}>
                <TableRow className="break-inside-avoid">
                  <TableCell
                    colSpan={9}
                    className="border border-black font-bold"
                  >
                    KATEGORI: {category.kategori}
                  </TableCell>
                </TableRow>
                {category.detail.map((item: any) => (
                  <TableRow
                    key={`item-${item.id}`}
                    className="break-inside-avoid"
                  >
                    <TableCell className="border border-black text-center w-[40px]">
                      {item.rowNumber}
                    </TableCell>
                    <TableCell className="border border-black w-[100px]">
                      {item.jenis || "-"}
                    </TableCell>
                    <TableCell className="border border-black w-[200px]">
                      {item.nama || "-"}
                    </TableCell>
                    <TableCell className="border border-black text-center w-[60px]">
                      {item.satuan || "-"}
                    </TableCell>
                    <TableCell className="border border-black text-right qty-col">
                      {item.qtyawal?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell className="border border-black text-right qty-col">
                      {item.qtymasuk?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell className="border border-black text-right qty-col">
                      {item.qtykeluar?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell className="border border-black text-right qty-col">
                      {item.qtyakhir?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell className="border border-black text-center w-[80px]">
                      -
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>

        {/* Tabel Rekapitulasi */}
        <div className="mt-8 mb-4 page break-inside-avoid">
          <h3 className="font-bold text-lg mb-2">REKAPITULASI PER KATEGORI</h3>
          <Table className="border border-collapse w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="border border-black text-center font-bold">
                  NO
                </TableHead>
                <TableHead className="border border-black text-center font-bold">
                  KATEGORI
                </TableHead>
                <TableHead className="border border-black text-center font-bold">
                  QTY AWAL
                </TableHead>
                <TableHead className="border border-black text-center font-bold">
                  QTY MASUK
                </TableHead>
                <TableHead className="border border-black text-center font-bold">
                  QTY KELUAR
                </TableHead>
                <TableHead className="border border-black text-center font-bold">
                  QTY AKHIR
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {barang?.data?.rekapitulasi?.map((rekap: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="border border-black text-center">
                    {index + 1}
                  </TableCell>
                  <TableCell className="border border-black">
                    {rekap.kategori}
                  </TableCell>
                  <TableCell className="border border-black text-right">
                    {/* {formatHarga(rekap.saldoawal, { style: 'decimal' })} */}
                    {rekap.qtyawal}
                  </TableCell>
                  <TableCell className="border border-black text-right">
                    {/* {formatHarga(rekap.saldomasuk, { style: 'decimal' })} */}
                    {rekap.qtymasuk}
                  </TableCell>
                  <TableCell className="border border-black text-right">
                    {/* {formatHarga(rekap.saldokeluar, { style: 'decimal' })} */}
                    {rekap.qtykeluar}
                  </TableCell>
                  <TableCell className="border border-black text-right">
                    {/* {formatHarga(rekap.saldoakhir, { style: 'decimal' })} */}
                    {rekap.qtyakhir}
                  </TableCell>
                </TableRow>
              ))}
              {/* Total Row */}
              <TableRow className="font-bold">
                <TableCell
                  className="border border-black text-center"
                  colSpan={2}
                >
                  TOTAL
                </TableCell>
                <TableCell className="border border-black text-right">
                  {/* {formatHarga(totalRecap.saldoawal, { style: 'decimal' })} */}
                  {totalRecap.qtyawal}
                </TableCell>
                <TableCell className="border border-black text-right">
                  {/* {formatHarga(totalRecap.saldomasuk, { style: 'decimal' })} */}
                  {totalRecap.qtymasuk}
                </TableCell>
                <TableCell className="border border-black text-right">
                  {/* {formatHarga(totalRecap.saldokeluar, { style: 'decimal' })} */}
                  {totalRecap.qtykeluar}
                </TableCell>
                <TableCell className="border border-black text-right">
                  {/* {formatHarga(totalRecap.saldoakhir, { style: 'decimal' })} */}
                  {totalRecap.qtyakhir}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Tanda Tangan */}
        <div className="break-inside-avoid mt-4">
          <div className="flex flex-wrap">
            <div className="w-1/3" />
            <div className="w-1/3" />
            <div className="w-1/3">
              <p className="text-center">{`${formatLaporan?.data?.header?.footerkota}, ${formatTanggal}`}</p>
            </div>
          </div>

          <div
            className={`flex flex-wrap ${ttdFilter?.length > 2 ? "justify-center" : "justify-between"
              }`}
          >
            {ttdFilter?.map((items: any, index: number) => (
              <div key={index} className="text-center w-1/3 mb-8">
                <p>{items.header}</p>
                <strong>{items.jabatan}</strong>
                <br />
                <br />
                <br />
                <strong>{items.nama}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

LapAduanReport.displayName = "LapAduanReport"

export default LapAduanReport;
