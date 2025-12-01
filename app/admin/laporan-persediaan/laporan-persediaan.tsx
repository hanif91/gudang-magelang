'use client';
import useSWR from 'swr';
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
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AxiosClient from '@/lib/AxiosClient';
import React, { useRef } from 'react';
import { useReactToPrint } from "react-to-print";
import formatHarga from '@/lib/format-harga';
import formatBulanIndonesia from '@/lib/format-bulan';

interface Props {
    filter: {
        month: Date;
    },
    isTampilkan: boolean,
}

const fetcher = (url: string) => AxiosClient.get(url).then(res => res.data);

export default function LapAduanReport(props: Props) {
    const month = format(props.filter.month, "yyyyMM");
    const periodeText = formatBulanIndonesia(props.filter.month);

    const { data: barang, isLoading: barangLoading, error: barangError } = useSWR(
        `/api/gudang/laporan-persediaan?month=${month}`,
        fetcher
    );
    const { data: formatLaporan, isLoading: formatLaporanLoading, error: formatLaporanError } = useSWR(
        `/api/portal/settings/attribute-lap?namalap=LPPER`,
        fetcher
    );

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

    // if (!props.isTampilkan) return null;

    if (barangError || formatLaporanError) {
        return (
            <Alert variant="destructive" className="mx-auto max-w-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Gagal memuat data stok barang</AlertDescription>
            </Alert>
        );
    }

    if (barangLoading || formatLaporanLoading) {
        return (
            <div className="w-full mt-24 mx-auto p-4">
                <Skeleton className="w-full h-[300px]" />
            </div>
        );
    }
    console.log(barang)

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
        saldoawal: barang?.data?.rekapitulasi?.reduce((sum: number, item: any) => sum + Number(item.saldoawal || 0), 0) || 0,
        saldomasuk: barang?.data?.rekapitulasi?.reduce((sum: number, item: any) => sum + Number(item.saldomasuk || 0), 0) || 0,
        saldokeluar: barang?.data?.rekapitulasi?.reduce((sum: number, item: any) => sum + Number(item.saldokeluar || 0), 0) || 0,
        saldoakhir: barang?.data?.rekapitulasi?.reduce((sum: number, item: any) => sum + Number(item.saldoakhir || 0), 0) || 0,
    };
    const formatTanggal = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    const ttdFilter = formatLaporan?.data?.paraf?.ttd?.filter((e: any) => e.is_id === true);

    return (
        <div className="w-full border-2 rounded-lg shadow-lg mt-24">
            <div className="flex justify-end p-4">
                <Button onClick={() => handlePrint()} className="print:hidden">
                    Cetak Laporan
                </Button>
            </div>

            <div ref={componentRef} className="px-10">
                <div className="flex items-center gap-4 mb-6">
                    <Image className="w-16 h-16" src="/logo.png" alt="Logo Perumdam" width={64} height={64} />
                    <div className="text-green-800">
                        <h1 className="font-bold text-lg">{formatLaporan?.data?.header?.headerlap1}</h1>
                        <p className="text-sm">{formatLaporan?.data?.header?.headerlap2}</p>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h2 className="font-bold text-xl">LAPORAN REKAPITULASI BARANG</h2>
                    <p className="text-sm">PERIODE : {periodeText}</p>
                </div>

                {/* Tabel Utama */}
                <Table className="border border-collapse w-full table-fixed mb-8">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="border border-black text-center font-bold w-[40px]" rowSpan={2}>NO</TableHead>
                            <TableHead className="border border-black text-center font-bold w-[100px]" rowSpan={2}>JENIS</TableHead>
                            <TableHead className="border border-black text-center font-bold w-[200px]" rowSpan={2}>NAMA BARANG</TableHead>
                            <TableHead className="border border-black text-center font-bold w-[60px]" rowSpan={2}>SAT</TableHead>
                            <TableHead className="border border-black text-center font-bold harga-col w-[100px]" rowSpan={2}>HARGA</TableHead>
                            <TableHead className="border border-black text-center font-bold" colSpan={2}>SALDO AWAL</TableHead>
                            <TableHead className="border border-black text-center font-bold" colSpan={2}>PENERIMAAN</TableHead>
                            <TableHead className="border border-black text-center font-bold" colSpan={2}>PENGELUARAN</TableHead>
                            <TableHead className="border border-black text-center font-bold" colSpan={2}>SALDO AKHIR</TableHead>
                            <TableHead className="border border-black text-center font-bold w-[80px]" rowSpan={2}>KET</TableHead>
                        </TableRow>
                        <TableRow>
                            <TableHead className="border border-black text-center font-bold qty-col">Q</TableHead>
                            <TableHead className="border border-black text-center font-bold saldo-col">JUMLAH (RP)</TableHead>
                            <TableHead className="border border-black text-center font-bold qty-col">Q</TableHead>
                            <TableHead className="border border-black text-center font-bold saldo-col">JUMLAH (RP)</TableHead>
                            <TableHead className="border border-black text-center font-bold qty-col">Q</TableHead>
                            <TableHead className="border border-black text-center font-bold saldo-col">JUMLAH (RP)</TableHead>
                            <TableHead className="border border-black text-center font-bold qty-col">Q</TableHead>
                            <TableHead className="border border-black text-center font-bold saldo-col">JUMLAH (RP)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dataWithRowNumbers?.map((category: any) => (
                            <React.Fragment key={`category-${category.kategori}`}>
                                <TableRow className='break-inside-avoid'>
                                    <TableCell colSpan={14} className="border border-black font-bold">
                                        KATEGORI: {category.kategori}
                                    </TableCell>
                                </TableRow>
                                {category.detail.map((item: any) => (
                                    <TableRow key={`item-${item.id}`} className='break-inside-avoid'>
                                        <TableCell className="border border-black text-center w-[40px]">
                                            {item.rowNumber}
                                        </TableCell>
                                        <TableCell className="border border-black w-[100px]">
                                            {item.jenis || '-'}
                                        </TableCell>
                                        <TableCell className="border border-black w-[200px]">
                                            {item.nama || '-'}
                                        </TableCell>
                                        <TableCell className="border border-black text-center w-[60px]">
                                            {item.satuan || '-'}
                                        </TableCell>
                                        <TableCell className="border border-black text-right harga-col w-[100px]">
                                            {formatHarga(item.harga, { style: 'decimal' }) || '0.00'}
                                        </TableCell>
                                        <TableCell className="border border-black text-right qty-col">
                                            {item.qtyawal?.toLocaleString() || '0'}
                                        </TableCell>
                                        <TableCell className="border border-black text-right saldo-col font-medium w-[100px]">
                                            {formatHarga(item.saldoawal, { style: 'decimal' }) || '0.00'}
                                        </TableCell>
                                        <TableCell className="border border-black text-right qty-col">
                                            {item.qtymasuk?.toLocaleString() || '0'}
                                        </TableCell>
                                        <TableCell className="border border-black text-right saldo-col font-medium w-[100px]">
                                            {formatHarga(item.saldomasuk, { style: 'decimal' }) || '0.00'}
                                        </TableCell>
                                        <TableCell className="border border-black text-right qty-col">
                                            {item.qtykeluar?.toLocaleString() || '0'}
                                        </TableCell>
                                        <TableCell className="border border-black text-right saldo-col font-medium w-[100px]">
                                            {formatHarga(item.saldokeluar, { style: 'decimal' }) || '0.00'}
                                        </TableCell>
                                        <TableCell className="border border-black text-right qty-col">
                                            {item.qtyakhir?.toLocaleString() || '0'}
                                        </TableCell>
                                        <TableCell className="border border-black text-right saldo-col font-medium w-[100px]">
                                            {formatHarga(item.saldoakhir, { style: 'decimal' }) || '0.00'}
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
                                <TableHead className="border border-black text-center font-bold">NO</TableHead>
                                <TableHead className="border border-black text-center font-bold">KATEGORI</TableHead>
                                <TableHead className="border border-black text-center font-bold">SALDO AWAL</TableHead>
                                <TableHead className="border border-black text-center font-bold">PENERIMAAN</TableHead>
                                <TableHead className="border border-black text-center font-bold">PENGELUARAN</TableHead>
                                <TableHead className="border border-black text-center font-bold">SALDO AKHIR</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {barang?.data?.rekapitulasi?.map((rekap: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell className="border border-black text-center">{index + 1}</TableCell>
                                    <TableCell className="border border-black">{rekap.kategori}</TableCell>
                                    <TableCell className="border border-black text-right">
                                        {formatHarga(rekap.saldoawal, { style: 'decimal' })}
                                    </TableCell>
                                    <TableCell className="border border-black text-right">
                                        {formatHarga(rekap.saldomasuk, { style: 'decimal' })}
                                    </TableCell>
                                    <TableCell className="border border-black text-right">
                                        {formatHarga(rekap.saldokeluar, { style: 'decimal' })}
                                    </TableCell>
                                    <TableCell className="border border-black text-right">
                                        {formatHarga(rekap.saldoakhir, { style: 'decimal' })}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {/* Total Row */}
                            <TableRow className="font-bold">
                                <TableCell className="border border-black text-center" colSpan={2}>TOTAL</TableCell>
                                <TableCell className="border border-black text-right">
                                    {formatHarga(totalRecap.saldoawal, { style: 'decimal' })}
                                </TableCell>
                                <TableCell className="border border-black text-right">
                                    {formatHarga(totalRecap.saldomasuk, { style: 'decimal' })}
                                </TableCell>
                                <TableCell className="border border-black text-right">
                                    {formatHarga(totalRecap.saldokeluar, { style: 'decimal' })}
                                </TableCell>
                                <TableCell className="border border-black text-right">
                                    {formatHarga(totalRecap.saldoakhir, { style: 'decimal' })}
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

                    <div className={`flex flex-wrap ${ttdFilter?.length > 2 ? 'justify-center' : 'justify-between'}`}>
                        {ttdFilter?.map((items: any, index: number) => (
                            <div key={index} className="text-center w-1/3 mb-8">
                                <p>{items.header}</p>
                                <strong>{items.jabatan}</strong>
                                <br /><br /><br />
                                <strong>{items.nama}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}