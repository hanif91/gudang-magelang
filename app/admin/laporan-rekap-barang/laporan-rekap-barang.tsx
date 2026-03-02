'use client';
import Image from "next/image";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import React, { useRef } from 'react';
import { useReactToPrint } from "react-to-print";
import { Button } from '@/components/ui/button';

interface Props {
    filter: {
        tahun: string;
        barang: string;
        kategori: string;
        unit: string;
    },
    isTampilkan: boolean,
    data: any;
    formatLaporan?: any;
}

export interface LapAduanReportRef {
    handlePrint: () => void;
}

const LapAduanReport = React.forwardRef<LapAduanReportRef, Props>((props, ref) => {
    const { tahun } = props.filter;
    const periodes = props.data?.periode || [];
    const dataLokasi = props.data?.data || [];
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
                    zoom: 90%;
                }
                table {
                    width: 100%;
                    font-size: 11px;
                }              
                th, td {
                    padding: 4px !important;
                    word-wrap: break-word !important;
                }
            }
        `,
    });

    React.useImperativeHandle(ref, () => ({
        handlePrint
    }));

    if (!props.isTampilkan || !props.data) {
        return null;
    }



    return (
        <div className="w-full border-2 rounded-lg shadow-lg mt-8">
            <div className="flex justify-end p-4">
                <Button onClick={() => handlePrint()} className="print:hidden">
                    Cetak PDF
                </Button>
            </div>

            <div ref={componentRef} className="px-10 pb-10">
                <div className="flex justify-between">
                    <div className="flex items-center gap-4 mb-6 pt-6">
                        <img className="w-16 h-16" src="/logo.png" alt="Logo Perumdam" width={64} height={64} />
                        <div className="text-green-800">
                            <h1 className="font-bold text-lg">{formatLaporan?.data?.header?.headerlap1 || "PERUSAHAAN DAERAH AIR MINUM"}</h1>
                            <p className="text-sm">{formatLaporan?.data?.header?.headerlap2 || "KABUPATEN MAGELANG"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mb-6 pt-6">
                        <p className="text-sm inline-block font-medium"></p>
                        <p className="text-sm inline-block font-medium"></p>
                        <p className="text-sm inline-block font-bold">LAPORAN REKAPTULASI PENGELUARAN BARANG</p>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h2 className="font-bold text-xl">LAPORAN REKAP BARANG</h2>
                    <p className="text-sm">TAHUN : {tahun}</p>
                </div>

                {/* Tabel Unit x Bulan */}
                <Table className="border border-collapse w-full mb-8">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="border border-black text-center font-bold w-[40px]" rowSpan={2}>NO</TableHead>
                            <TableHead className="border border-black text-center font-bold w-[120px]" rowSpan={2}>KODE BARANG</TableHead>
                            <TableHead className="border border-black text-center font-bold w-[250px]" rowSpan={2}>NAMA BARANG</TableHead>
                            <TableHead className="border border-black text-center font-bold" colSpan={periodes.length || 1}>BULAN</TableHead>
                            <TableHead className="border border-black text-center font-bold w-[60px]" rowSpan={2}>TOTAL</TableHead>
                        </TableRow>
                        <TableRow>
                            {periodes.map((p: any) => (
                                <TableHead key={p.periode} className="border border-black text-center font-bold min-w-[60px]">{p.periode_str}</TableHead>
                            ))}
                            {periodes.length === 0 && (
                                <TableHead className="border border-black text-center font-bold">-</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dataLokasi.map((unitGroup: any, uIndex: number) => (
                            <React.Fragment key={uIndex}>
                                <TableRow className="bg-gray-100 font-bold break-inside-avoid">
                                    <TableCell className="border border-black" colSpan={4 + (periodes.length || 1)}>
                                        UNIT: {unitGroup.unit}
                                    </TableCell>
                                </TableRow>

                                {unitGroup.barang?.map((item: any, bIndex: number) => (
                                    <TableRow key={item.kodebarang} className="break-inside-avoid">
                                        <TableCell className="border border-black text-center">{bIndex + 1}</TableCell>
                                        <TableCell className="border border-black text-center">{item.kodebarang}</TableCell>
                                        <TableCell className="border border-black font-medium">{item.barang}</TableCell>

                                        {periodes.length > 0 ? periodes.map((p: any) => {
                                            const bulanData = item.periode?.find((bp: any) => bp.periode === p.periode);
                                            const val = bulanData ? bulanData.qty : 0;
                                            return (
                                                <TableCell key={p.periode} className="border border-black text-right">
                                                    {val === 0 ? '-' : val.toLocaleString('id-ID')}
                                                </TableCell>
                                            );
                                        }) : (
                                            <TableCell className="border border-black text-center">-</TableCell>
                                        )}

                                        <TableCell className="border border-black text-right font-bold">
                                            {(item.total || 0).toLocaleString('id-ID')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </React.Fragment>
                        ))}

                        {/* Total Keseluruhan */}
                        {dataLokasi.length > 0 && periodes.length > 0 && (
                            <TableRow className="font-bold bg-gray-50 break-inside-avoid">
                                <TableCell className="border border-black text-center" colSpan={3}>TOTAL KESELURUHAN</TableCell>
                                {periodes.map((p: any) => {
                                    const totalBulan = dataLokasi.reduce((sum: number, unitGroup: any) => {
                                        return sum + (unitGroup.barang?.reduce((bSum: number, item: any) => {
                                            const bulanData = item.periode?.find((bp: any) => bp.periode === p.periode);
                                            return bSum + (bulanData ? bulanData.qty : 0);
                                        }, 0) || 0);
                                    }, 0);

                                    return (
                                        <TableCell key={p.periode} className="border border-black text-right">
                                            {totalBulan === 0 ? '-' : totalBulan.toLocaleString('id-ID')}
                                        </TableCell>
                                    );
                                })}
                                <TableCell className="border border-black text-right">
                                    {dataLokasi.reduce((sum: number, unitGroup: any) => sum + (unitGroup.barang?.reduce((bSum: number, item: any) => bSum + (item.total || 0), 0) || 0), 0).toLocaleString('id-ID')}
                                </TableCell>
                            </TableRow>
                        )}

                        {(!dataLokasi || dataLokasi.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={4 + (periodes.length || 1)} className="border border-black text-center h-24">
                                    Tidak ada data untuk ditampilkan
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

            </div>
        </div>
    );
});

LapAduanReport.displayName = "LapRekapBarangReport"
export default LapAduanReport;
