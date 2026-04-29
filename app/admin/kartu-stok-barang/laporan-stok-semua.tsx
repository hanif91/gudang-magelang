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

interface Props {
    filter: {
        start: Date;
        end: Date;
    },
    isTampilkan: boolean,
}

const fetcher = (url: string) => AxiosClient.get(url).then(res => res.data);

export default function LapStokSemuaBarang(props: Props) {
    const firstDay = format(props.filter.start, "yyyy-MM") + "-01";
    const fromTanggal = format(props.filter.start, "yyyyMM");
    const toTanggal = format(props.filter.end, "yyyyMM");
    const tahun = props.filter.start.getFullYear();
    const bulan = format(props.filter.start, "MMMM");

    const { data: response, isLoading, error } = useSWR(
        props.isTampilkan
            ? `/api/gudang/kartu-stok-barang?firstDay=${firstDay}&fromTanggal=${fromTanggal}&toTanggal=${toTanggal}`
            : null,
        fetcher
    );
    const { data: formatLaporan, isLoading: formatLaporanLoading, error: formatLaporanError } = useSWR(
        `/api/portal/settings/attribute-lap?namalap=KSB`,
        fetcher
    );

    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        pageStyle: `
        @page {
        size: A4 landscape;
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
    });

    if (!props.isTampilkan) return null;

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

    const ttdFilter = formatLaporan?.data?.paraf?.ttd?.filter((e: any) => e.is_id === true);
    const allBarang: any[] = response?.data || [];

    // Build structured rows with merge info
    let sumQtyAwal = 0;
    let sumQtyMasuk = 0;
    let sumQtyKeluar = 0;
    let sumQtyAkhir = 0;
    let barangNo = 0;
    const renderRows: any[] = [];

    allBarang.forEach((barangItem: any) => {
        const groups = barangItem.data || [];

        // Calculate total rows for this barang (sum of all items across all groups)
        let totalRowsForBarang = 0;
        groups.forEach((group: any) => {
            totalRowsForBarang += (group.data?.length || 0);
        });

        if (totalRowsForBarang === 0) return;

        barangNo++;
        let isFirstRowOfBarang = true;

        groups.forEach((group: any) => {
            const items = group.data || [];
            const groupRowCount = items.length;

            items.forEach((item: any, itemIndex: number) => {
                const isFirstRowOfGroup = itemIndex === 0;

                renderRows.push({
                    // Barang-level merge
                    isFirstRowOfBarang,
                    barangRowSpan: totalRowsForBarang,
                    barangNo,
                    kategoriJenis: `${barangItem.kategori || '-'} / ${barangItem.jenis || '-'}`,
                    namaBarang: barangItem.nama || '-',
                    satuan: barangItem.satuan || '-',
                    // Group-level merge
                    isFirstRowOfGroup,
                    groupRowSpan: groupRowCount,
                    groupTgl: group.tgl,
                    groupRef: group.ref,
                    // Item-level (no merge)
                    harga: item.harga,
                    qtyawal: item.qtyawal,
                    qtymasuk: item.qtymasuk,
                    qtykeluar: item.qtykeluar,
                    qtypenye: item.qtypenye || '0',
                    qtydist: item.qtydist || '0',
                    qtyakhir: item.qtyakhir,
                    keterangan: item.keterangan || '-',
                    ketFifo: item.ket_fifo || '-',
                });

                isFirstRowOfBarang = false;
            });
        });

        // Accumulate sums for footer
        groups.forEach((group: any) => {
            (group.data || []).forEach((item: any) => {
                sumQtyAwal += Number(item.qtyawal || 0);
                sumQtyMasuk += Number(item.qtymasuk || 0);
                sumQtyKeluar += Number(item.qtykeluar || 0);
            });
        });

        // Last item's qtyakhir for SISA STOCK AKHIR
        const lastGroup = groups[groups.length - 1];
        if (lastGroup?.data?.length > 0) {
            sumQtyAkhir += Number(lastGroup.data[lastGroup.data.length - 1].qtyakhir || 0);
        }
    });

    const cellBorder = "border-[1px] border-solid border-black p-1 text-[11px]";
    // Total columns: NO, Kategori/Jenis, Nama, SAT, TGL, NO.TRANS, HARGA, AWAL, MASUK, KELUAR, PENYE, DIST, AKHIR, KET, KET_FIFO = 15
    const totalColumns = 13;

    return (
        <div className="w-full border-2 rounded-lg shadow-lg mt-24">
            <div className="flex justify-end p-4">
                <Button onClick={() => handlePrint()} className="print:hidden">
                    Cetak Laporan
                </Button>
            </div>

            <div ref={componentRef} className="px-10">
                <div className="flex items-center gap-4 mb-6">
                    <img className="w-16 h-16" src="/logo.png" alt="Logo Perumdam" width={64} height={64} />
                    <div className="text-green-800">
                        <h1 className="font-bold text-lg">{formatLaporan?.data?.header?.headerlap1}</h1>
                        <p className="text-sm">{formatLaporan?.data?.header?.headerlap2}</p>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h2 className="font-bold text-xl">LAPORAN KARTU STOCK BULANAN</h2>
                    <p className="font-semibold">TAHUN : {bulan} {tahun}</p>
                </div>

                <Table className="border border-collapse">
                    <TableHeader>
                        <TableRow>
                            <TableHead className={`${cellBorder} text-center font-bold`} rowSpan={2}>NO.</TableHead>
                            <TableHead className={`${cellBorder} text-center font-bold`} rowSpan={2}>KATEGORI / JENIS</TableHead>
                            <TableHead className={`${cellBorder} text-center font-bold`} rowSpan={2}>NAMA BARANG</TableHead>
                            <TableHead className={`${cellBorder} text-center font-bold`} rowSpan={2}>SAT</TableHead>
                            <TableHead className={`${cellBorder} text-center font-bold`} rowSpan={2}>TANGGAL</TableHead>
                            <TableHead className={`${cellBorder} text-center font-bold`} rowSpan={2}>NO.TRANS</TableHead>
                            <TableHead className={`${cellBorder} text-center font-bold`} rowSpan={2}>HARGA</TableHead>
                            <TableHead className={`${cellBorder} text-center font-bold`} colSpan={4}>TRANSAKSI BARANG</TableHead>
                            <TableHead className={`${cellBorder} text-center font-bold`} rowSpan={2}>KETERANGAN</TableHead>
                            <TableHead className={`${cellBorder} text-center font-bold`} rowSpan={2}>KET FIFO</TableHead>
                        </TableRow>
                        <TableRow>
                            <TableHead className={`${cellBorder} text-center font-bold`}>AWAL</TableHead>
                            <TableHead className={`${cellBorder} text-center font-bold`}>MASUK</TableHead>
                            <TableHead className={`${cellBorder} text-center font-bold`}>KELUAR</TableHead>
                            <TableHead className={`${cellBorder} text-center font-bold`}>AKHIR</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {renderRows.map((row: any, index: number) => (
                            <TableRow key={index}>
                                {/* Barang-level merged cells: NO, KATEGORI/JENIS, NAMA, SAT */}
                                {row.isFirstRowOfBarang && (
                                    <>
                                        <TableCell className={`${cellBorder} text-center align-top`} rowSpan={row.barangRowSpan}>
                                            {row.barangNo}
                                        </TableCell>
                                        <TableCell className={`${cellBorder} text-center align-top`} rowSpan={row.barangRowSpan}>
                                            {row.kategoriJenis}
                                        </TableCell>
                                        <TableCell className={`${cellBorder} align-top`} rowSpan={row.barangRowSpan}>
                                            {row.namaBarang}
                                        </TableCell>
                                        <TableCell className={`${cellBorder} text-center align-top`} rowSpan={row.barangRowSpan}>
                                            {row.satuan}
                                        </TableCell>
                                    </>
                                )}

                                {/* Group-level merged cells: TANGGAL, NO.TRANS */}
                                {row.isFirstRowOfGroup && (
                                    <>
                                        <TableCell className={`${cellBorder} text-center align-top`} rowSpan={row.groupRowSpan}>
                                            {row.groupTgl ? format(new Date(row.groupTgl), "dd-MM-yyyy") : ''}
                                        </TableCell>
                                        <TableCell className={`${cellBorder} align-top`} rowSpan={row.groupRowSpan}>
                                            {row.groupRef || ''}
                                        </TableCell>
                                    </>
                                )}

                                {/* Item-level cells (no merge) */}
                                <TableCell className={`${cellBorder} text-right`}>
                                    {row.harga ? Number(row.harga).toLocaleString('id-ID') : ''}
                                </TableCell>
                                <TableCell className={`${cellBorder} text-right`}>{Number(row.qtyawal || 0).toLocaleString('id-ID')}</TableCell>
                                <TableCell className={`${cellBorder} text-right`}>{Number(row.qtymasuk || 0).toLocaleString('id-ID')}</TableCell>
                                <TableCell className={`${cellBorder} text-right`}>{Number(row.qtykeluar || 0).toLocaleString('id-ID')}</TableCell>
                                <TableCell className={`${cellBorder} text-right font-medium`}>{Number(row.qtyakhir || 0).toLocaleString('id-ID')}</TableCell>
                                <TableCell className={`${cellBorder} text-[10px]`}>{row.keterangan}</TableCell>
                                <TableCell className={`${cellBorder} text-[10px]`}>{row.ketFifo}</TableCell>
                            </TableRow>
                        ))}

                        {/* JUMLAH / FOOTER SUM */}
                        <TableRow>
                            <TableCell className={`${cellBorder} text-center font-bold`} colSpan={7}>
                                JUMLAH
                            </TableCell>
                            <TableCell className={`${cellBorder} text-right font-bold`}>
                                {sumQtyAwal.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className={`${cellBorder} text-right font-bold`}>
                                {sumQtyMasuk.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className={`${cellBorder} text-right font-bold`}>
                                {sumQtyKeluar.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className={`${cellBorder} text-right font-bold`}>
                                {sumQtyAkhir.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className={`${cellBorder}`} colSpan={2} />
                        </TableRow>
                    </TableBody>
                </Table>

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
