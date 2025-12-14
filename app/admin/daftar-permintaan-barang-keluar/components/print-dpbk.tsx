import AxiosClient from "@/lib/AxiosClient";
import React, { forwardRef } from "react";
import useSWR from "swr";
import Dpbk from "../models/models";
import Image from "next/image";

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
            is_id: boolean;
        }[];
    };
}

const fetcher = (url: string) => AxiosClient.get(url).then(res => res.data.data);

const PrintDPBK = forwardRef<HTMLDivElement, { data: Dpbk }>(({ data }, ref) => {
    const { data: ttdLap, error: errorTtdLap, isLoading: isLoadingTtdLap } = useSWR<TtdLap>('/api/portal/settings/attribute-lap?namalap=DPBK', fetcher);

    if (isLoadingTtdLap || !ttdLap) {
        return <div>Loading tanda tangan...</div>;
    }

    if (errorTtdLap) {
        return <div>Gagal memuat data tanda tangan.</div>;
    }

    // Format tanggal ke Indonesia
    const formatTanggal = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    const ttdFilter = ttdLap.paraf.ttd.filter((e) => e.is_id == true);

    return (
        <div ref={ref} className="text-sm font-sans mx-auto w-full px-10 relative">
            <div className="flex items-center space-x-2 mb-5">
                <img className="w-16 h-auto" src="/logo.png" alt="Logo" width={64} height={64} />
                <div className="text-green-800 items-start">
                    <p>{ttdLap.header?.headerlap1}</p>
                    <p>{ttdLap.header?.headerlap2}</p>
                </div>
            </div>

            <div className="flex justify-end items-center mb-2">
                <span>DPBK No. {data.nodpbk}</span>
            </div>
            <hr className="border-black" />

            {/* Judul */}
            <h2 className="text-center font-bold mt-2">
                DAFTAR PERMINTAAN BARANG KELUAR ( DPBK )
            </h2>

            {/* Info Permintaan */}
            <p className="mt-2 font-bold uppercase">
                unit yang meminta : {data.nama_unit}
                {/* Kepada Yth. <strong>URUSAN / PELAKSANA PEMBELIAN</strong> <br />
                Mohon dipesankan barang-barang seperti tersebut <br /> di bawah ini untuk disampaikan kepada:
                <span className="inline-block w-[100px] border-b border-black border-dotted"></span> <br />
                Barang - barang tersebut dibutuhkan segera dalam waktu
                <span className="inline-block w-[50px] border-b border-black border-dotted"></span> hari */}
            </p>

            <div className="">
                <table className="w-full mt-4">
                    <thead >
                        <tr>
                            <th className="border-[1px] border-solid border-black px-2 py-0 w-1/12 text-center">NO.</th>
                            <th className="border-[1px] border-solid border-black px-2 py-0 w-1/12 text-center">QTY</th>
                            <th className="border-[1px] border-solid border-black px-2 py-0 w-2/12 text-center">SATUAN</th>
                            <th className="border-[1px] border-solid border-black px-2 py-0 w-5/12 text-center">JENIS BARANG</th>
                            <th className="border-[1px] border-solid border-black px-2 py-0 w-1/12 text-center">STOCK</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.barang.map((item, index) => (
                            <tr key={index} className="border-[1px] border-solid border-black">
                                <td className="border-[1px] border-solid border-black px-2 py-0 text-center w-1/12">{index + 1}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-0 text-right w-1/12">{item.qty}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-0 w-1/12">{item.satuan_barang}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-0 w-6/12">{item.nama_barang}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-0 text-right w-1/12">{item.stok_barang}</td>
                            </tr>
                        ))}

                        {/* {[...Array(40)].map((item, index) => (
                            <tr key={index} className="border-[1px] border-solid border-black">
                                <td className="border-[1px] border-solid border-black px-2 py-0 text-center w-1/12">1</td>
                                <td className="border-[1px] border-solid border-black px-2 py-0 text-right w-1/12">7</td>
                                <td className="border-[1px] border-solid border-black px-2 py-0 w-1/12">buah</td>
                                <td className="border-[1px] border-solid border-black px-2 py-0 w-6/12">mobil</td>
                                <td className="border-[1px] border-solid border-black px-2 py-0 text-right w-1/12">mobill</td>
                            </tr>
                        ))} */}
                        <tr className="border-[1px] border-solid border-black">
                            <td colSpan={8}>Di Gunakan Untuk : {data?.keterangan}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Tanda Tangan */}
                <div className="break-inside-avoid mt-4">
                    <div className="flex flex-wrap">
                        <div className="w-1/3" />
                        <div className="w-1/3" />
                        <div className="w-1/3">
                            <p className="text-center">{`${ttdLap.header?.footerkota}, ${formatTanggal}`}</p>
                        </div>
                    </div>

                    <div className={`flex flex-wrap ${ttdFilter.length > 2 ? 'justify-center' : 'justify-between'}`}>
                        {ttdFilter.map((items, index) => (
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
});
PrintDPBK.displayName = 'PrintDPBK';
export default PrintDPBK;