import AxiosClient from "@/lib/AxiosClient";
import React, { forwardRef } from "react";
import useSWR from "swr";
import Image from "next/image";
import moment from "moment";

interface OpItem {
    id_op: number;
    dpb_id: number;
    nodpb: string;
    id_barang: number;
    harga_no_ppn: number;
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

interface TtdLap {
    ttdlap: {
        header: string;
        nama_paraf: string;
        jabatan: string;
        isid: number;
    }[];
    header: {
        headerlap1: string;
        headerlap2: string;
        footerkota: string;
    };
    paraf: {
        ttd: {
            header: string;
            nama: string;
            jabatan: string;
            nik: string;
            is_id: boolean;
        }[];
    };
}

const fetcher = (url: string) => AxiosClient.get(url).then(res => res.data.data);

const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const PrintOP = forwardRef<HTMLDivElement, { data: Op }>(({ data }, ref) => {
    const { data: ttdLap, error: errorTtdLap, isLoading: isLoadingTtdLap } = useSWR<TtdLap>('/api/portal/settings/attribute-lap?namalap=op', fetcher);
    const { data: ppn, error: errorPpn, isLoading: isLoadingPpn } = useSWR('/api/filter/ppn', fetcher);

    if (isLoadingTtdLap || !ttdLap) {
        return <div>Loading tanda tangan...</div>;
    }

    if (isLoadingPpn || !ppn) {
        return <div>Loading PPN...</div>;
    }

    if (errorTtdLap) {
        return <div>Gagal memuat data tanda tangan.</div>;
    }

    if (errorPpn) {
        return <div>Gagal memuat data PPN.</div>;
    }

    // Format tanggal ke Indonesia
    const formatTanggal = (dateString: string) => {
        return moment(dateString).format("DD MMMM YYYY");
    };

    const ttdFilter = ttdLap.paraf.ttd.filter((e) => e.is_id);

    // Calculate total
    const totalNoPpn = data.items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.harga_no_ppn == 0 ? item.harga_beli : item.harga_no_ppn)), 0);
    const total = data.items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.harga_beli == 0 ? item.harga_no_ppn : item.harga_beli)), 0) + (data.isppn == 1 && data.isoverwriteppn == 0 ? totalNoPpn * Number(ppn.jml) : 0);

    return (
        <div ref={ref} className="text-sm font-sans mx-auto w-full px-10 relative">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-5">
                <img className="w-16 h-auto" src="/logo.png" alt="Logo" width={64} height={64} />
                <div className="text-green-800 items-start">
                    <p>{ttdLap.header?.headerlap1}</p>
                    <p>{ttdLap.header?.headerlap2}</p>
                </div>
            </div>

            <hr className="border-black" />

            {/* Judul */}
            <h2 className="text-center font-bold mt-2">
                ORDER PEMBELIAN
            </h2>
            <div className="text-center">
                <span>No. {data.no_op}</span>
            </div>

            {/* Table Barang */}
            <div>
                <div className="border-[1px] border-solid border-black p-2 mt-4">
                    <div className="flex gap-2 mb-2">
                        <div className="flex-1">
                            <table>
                                <tbody>
                                    <tr>
                                        <td className="align-top whitespace-nowrap">Kepada Yth.</td>
                                        <td className="align-top px-1">:</td>
                                        <td className="align-top"><strong>{data.nama_supplier || "-"}</strong></td>
                                    </tr>
                                    <tr>
                                        <td className="align-top whitespace-nowrap">Alamat</td>
                                        <td className="align-top px-1">:</td>
                                        <td className="align-top"><strong>{data.alamat_supplier || "-"}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-1">
                            <p className="mb-1">
                                Cara Pembayaran:{" "}
                                {(data as any).cara_pembayaran ? (
                                    <strong>{(data as any).cara_pembayaran}</strong>
                                ) : null}
                            </p>
                            <p className="mb-0">
                                Dikirim Ke: <strong>PDAM KOTA MAGELANG</strong>
                            </p>
                        </div>
                    </div>

                    <hr className="border-black my-2" />

                    <p className="mb-0">
                        Berdasarkan Daftar Permintaan Barang (DPB) dari Gudang mohon dikirim
                        barang-barang dengan harga dan jumlah seperti tertera dibawah ini paling
                        lambat dalam waktu 14 hari
                    </p>
                </div>

                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border-[1px] border-solid border-black px-2 py-1 text-center w-[10%]">Banyak</th>
                            <th className="border-[1px] border-solid border-black px-2 py-1 text-center w-[10%]">Satuan</th>
                            <th className="border-[1px] border-solid border-black px-2 py-1 text-center w-[15%]">Kode Barang</th>
                            <th className="border-[1px] border-solid border-black px-2 py-1 text-center w-[35%]">Penjelasan</th>
                            <th className="border-[1px] border-solid border-black px-2 py-1 text-center w-[15%]">Harga Satuan (Rp)</th>
                            <th className="border-[1px] border-solid border-black px-2 py-1 text-center w-[15%]">Jumlah (Rp)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, index) => (
                            <tr key={index}>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-center">{item.qty}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-center">{item.satuan_barang}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-center">{item.id_barang}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1">{item.nama_barang}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-right">{formatRupiah(Number(item.harga_no_ppn == 0 ? item.harga_beli : item.harga_no_ppn))}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-right">{formatRupiah(Number(item.qty) * (Number(item.harga_no_ppn == 0 ? item.harga_beli : item.harga_no_ppn)))}</td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={5} className="border-[1px] border-solid border-black px-2 py-1 font-bold text-right">Jumlah</td>
                            <td className="border-[1px] border-solid border-black px-2 py-1 text-right font-bold">{formatRupiah(totalNoPpn)}</td>
                        </tr>
                        {data.isppn == 1 && (
                            <tr>
                                <td colSpan={5} className="border-[1px] border-solid border-black px-2 py-1 font-bold text-right">{ppn.label}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-right font-bold">{formatRupiah(total == 0 || totalNoPpn == 0 ? 0 : data.isppn == 1 && data.isoverwriteppn == 0 ? totalNoPpn * Number(ppn.jml) : total - totalNoPpn)}</td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={5} className="border-[1px] border-solid border-black border-t-0 px-2 py-1 font-bold text-right">Total</td>
                            <td className="border-[1px] border-solid border-black border-t-0 px-2 py-1 font-bold text-right">{formatRupiah(total)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Tanda Tangan */}
                <div className="break-inside-avoid mt-2">
                    <div className={`flex flex-wrap flex-col`}>
                        <div className="flex flex-wrap justify-end pr-10">
                            <p className="text-right">{`${ttdLap.header?.footerkota}, ${formatTanggal(data.tanggal)}`}</p>
                        </div>
                        <div className={`flex justify-end pr-7`}>
                            {ttdFilter.slice(0, 1).map((items, index) => (
                                <div key={index} className="text-center w-1/3">
                                    <p>{items.header}</p>
                                    <strong>{items.jabatan}</strong>
                                    <br /><br /><br />
                                    <strong className="underline">{items.nama}</strong>
                                    <br />
                                    <strong>{items.nik}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

PrintOP.displayName = 'PrintOP';

export default PrintOP;
