'use client';
import useSWR from 'swr';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AxiosClient from '@/lib/AxiosClient';
import { useRef } from 'react';
import { useReactToPrint } from "react-to-print";
import formatBulanIndonesia from '@/lib/format-bulan';
interface Props {
    filter: {
        start: Date;
        end: Date;
        barang: string;
    },
    isTampilkan: boolean,
}

const fetcher = (url: string) => AxiosClient.get(url).then(res => res.data);

export default function LapAduanReport(props: Props) {
    // Format dates consistently
    const firstDay = format(props.filter.start, "yyyy-MM");
    const fromTanggal = format(props.filter.start, "yyyyMM");
    const toTanggal = format(props.filter.end, "yyyyMM");
    const periodeText = `${formatBulanIndonesia(props.filter.start)} - ${formatBulanIndonesia(props.filter.end)}`

    // Fetch data
    const { data: barang, isLoading, error } = useSWR(
        `/api/gudang/kartu-stok-barang?id=${props.filter.barang}&firstDay=${firstDay}-01&fromTanggal=${fromTanggal}&toTanggal=${toTanggal}`,
        fetcher
    );
    const { data: formatLaporan, isLoading: formatLaporanLoading, error: formatLaporanError } = useSWR(
        `/api/gudang/ttd-lap?tipe=KSB`,
        fetcher
    );

    // Print functionality
    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        pageStyle: `
        @page {
        margin-left: 0;
        margin-right: 0;
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
    if (!props.isTampilkan) {
        return null;
    }
    if (error || formatLaporanError) {
        return (
            <Alert variant="destructive" className="mx-auto max-w-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Gagal memuat data stok barang</AlertDescription>
            </Alert>
        );
    }

    if (isLoading || formatLaporanLoading) {
        return (
            <div className="w-full mt-24 mx-auto p-4">
                <Skeleton className="w-full h-[300px]" />
            </div>
        );
    }

    const formatTanggal = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    const ttdFilter = formatLaporan?.data?.ttdlap?.filter((e: any) => e.isid === 1);

    return (
        <div className="w-full border-2 rounded-lg shadow-lg mt-24">
            <div className="flex justify-end p-4">
                <Button onClick={() => handlePrint()} className="print:hidden">
                    Cetak Laporan
                </Button>
            </div>

            <div ref={componentRef} className="px-10">
                <div className="flex items-center gap-4 mb-6">
                    <img className="w-16 h-16" src="/logo.png" alt="Logo Perumdam" />
                    <div className="text-green-800">
                        <h1 className="font-bold text-lg">{formatLaporan?.data?.kota?.headerlap1}</h1>
                        <p className="text-sm">{formatLaporan?.data?.kota?.headerlap2}</p>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h2 className="font-bold text-xl">KARTU STOK BARANG</h2>
                    <p className="text-sm">{periodeText}</p>
                </div>

                <div className="mb-4">
                    <p className="font-semibold">Nama Barang: {barang?.data?.nama || '-'}</p>
                </div>

                <Table className="border border-collapse">
                    <TableHeader className="">
                        <TableRow>
                            <TableHead className="border-[1px] border-solid border-black text-center font-bold" rowSpan={2}>TGL</TableHead>
                            <TableHead className="border-[1px] border-solid border-black text-center font-bold" rowSpan={2}>REF</TableHead>
                            <TableHead className="border-[1px] border-solid border-black text-center font-bold" colSpan={4}>Barang - Barang</TableHead>
                        </TableRow>
                        <TableRow className="">
                            <TableHead className="border-[1px] border-solid border-black text-center font-bold">AWAL</TableHead>
                            <TableHead className="border-[1px] border-solid border-black text-center font-bold">MASUK</TableHead>
                            <TableHead className="border-[1px] border-solid border-black text-center font-bold">KELUAR</TableHead>
                            <TableHead className="border-[1px] border-solid border-black text-center font-bold">AKHIR</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {barang?.data?.data?.map((item: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell className="border-[1px] border-solid border-black text-center p-2">
                                    {format(new Date(item.tgl), "yyyy-MM-dd")}
                                </TableCell>
                                <TableCell className="border-[1px] border-solid border-black text-center p-2">
                                    {item.ref || '-'}
                                </TableCell>
                                <TableCell className="border-[1px] border-solid border-black text-right p-2">
                                    {item.qtyawal?.toLocaleString() || '0'}
                                </TableCell>
                                <TableCell className="border-[1px] border-solid border-black text-right p-2">
                                    {item.qtymasuk?.toLocaleString() || '0'}
                                </TableCell>
                                <TableCell className="border-[1px] border-solid border-black text-right p-2">
                                    {item.qtykeluar?.toLocaleString() || '0'}
                                </TableCell>
                                <TableCell className="border-[1px] border-solid border-black text-right p-2 font-medium">
                                    {item.qtyakhir?.toLocaleString() || '0'}
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* {[...Array(20)].map((index) => (
                            <TableRow key={index} className='' style={{ pageBreakInside: 'avoid', pageBreakBefore: 'auto' }}>
                                <TableCell className="border text-center p-2">
                                    sdfdsfsf
                                </TableCell>
                                <TableCell className="border text-center p-2">
                                    dfgdgdg
                                </TableCell>
                                <TableCell className="border text-right p-2">
                                    dfgdfg
                                </TableCell>
                                <TableCell className="border text-right p-2">
                                    dfgdg
                                </TableCell>
                                <TableCell className="border text-right p-2">
                                    dfg
                                </TableCell>
                                <TableCell className="border text-right p-2 font-medium">
                                    dfg
                                </TableCell>
                            </TableRow>
                        ))} */}

                    </TableBody>
                </Table>
                <div className="break-inside-avoid mt-4">
                    <div className="flex flex-wrap">
                        <div className="w-1/3" />
                        <div className="w-1/3" />
                        <div className="w-1/3">
                            <p className="text-center">{`${formatLaporan?.data?.kota?.footerkota}, ${formatTanggal}`}</p>
                        </div>
                    </div>

                    <div className={`flex flex-wrap ${ttdFilter.length > 2 ? 'justify-center' : 'justify-between'}`}>
                        {ttdFilter.map((items: any, index: number) => (
                            <div key={index} className="text-center w-1/3 mb-8">
                                <p>{items.header}</p>
                                <strong>{items.jabatan}</strong>
                                <br /><br /><br />
                                <strong>{items.nama_paraf}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}