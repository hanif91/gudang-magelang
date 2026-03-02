import { formatAngka } from "@/lib/formatAngka";
import AxiosClient from "@/lib/AxiosClient";
import { forwardRef } from "react";
import useSWR from "swr";
import Image from "next/image";

interface Pembelian {
    no_pembelian: string;
    supplier: string;
    supplier_alamat: string;
    tanggal: string;
    no_voucher: string;
    status: string;
    id_pembelian: string;
    total: string;
    barang: Barang[];
}

interface Barang {
    id_pembelian_item: string;
    noop: string;
    nama_barang: string;
    qty: number;
    qtyfifo: number;
    satuan: string;
    harga_beli: number;
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
            nik: string;
            jabatan: string;
            is_id: boolean;
        }[];
    };
}

const fetcher = (url: string) => AxiosClient.get(url).then(res => res.data.data);

const PrintBarangMasuk = forwardRef<HTMLDivElement, { data: Pembelian }>(({ data }, ref) => {
    const { data: ttdLap, error: errorTtdLap, isLoading: isLoadingTtdLap } = useSWR<TtdLap>('/api/portal/settings/attribute-lap?namalap=BPP', fetcher);

    if (isLoadingTtdLap || !ttdLap) {
        return <div>Loading tanda tangan...</div>;
    }

    if (errorTtdLap) {
        return <div>Gagal memuat data tanda tangan.</div>;
    }

    const formatTanggal = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(data.tanggal));

    const hariIni = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    console.log('data', data)

    return (
        <div ref={ref} className="text-sm font-sans mx-auto w-full px-3">
            <div className="flex items-center space-x-2 mb-5">
                <img className="w-16 h-auto" src="/logo.png" alt="Logo" width={64} height={64} />
                <div className="text-green-800 items-start">
                    <p>{ttdLap.header?.headerlap1}</p>
                    <p>{ttdLap.header?.headerlap2}</p>
                </div>
            </div>

            <h2 className="text-center font-bold mt-2 underline">
                LAPORAN PENERIMAAN BARANG (LPB)
            </h2>

            <div className="flex justify-between items-center mb-1 mt-4 font-bold uppercase">
                <div>
                    <span>Transaksi Order : {data.barang[0].noop}</span>
                </div>
                <div className="text-right">
                    <span>LPB : {data.no_pembelian}</span>
                </div>
            </div>
            <table className="w-full mt-1 border-t-2 border-black">
                <tbody>
                    <tr>
                        <td className="border-y-[1px] border-black px-2 py-1 text-left">
                            <span>Supplier : {data.supplier}</span>
                        </td>
                        <td className="border-y-[1px] border-black px-2 py-1 text-left">
                            <span>Alamat : {data.supplier_alamat || '-'}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className="w-full mt-0.5">
                <thead >
                    <tr>
                        <th className="border-[1px] border-solid border-black px-2 py-1 text-center">BANYAKNYA</th>
                        <th className="border-[1px] border-solid border-black px-2 py-1 text-center">SATUAN</th>
                        <th className="border-[1px] border-solid border-black px-2 py-1 text-center">KODE BRG</th>
                        <th className="border-[1px] border-solid border-black px-2 py-1 text-center">URAIAN</th>
                        <th className="border-[1px] border-solid border-black px-2 py-1 text-center">CATATAN</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.barang?.map((items: any, index: number) => {
                        return (
                            <tr key={index} className={`border-[1px] border-solid border-black ${index > 0 && index % 24 === 0 ? 'break-page' : ''}`}>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-center w-[10%]">{formatAngka(items.qty)}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-center w-[10%]">{items.satuan}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-center w-[15%]">{items.kode_barang}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-left w-[50%]">{items.nama_barang}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-right w-[20%]"></td>
                            </tr>
                        )
                    })}
                    {(!data?.barang || data.barang.length === 0) && (
                        <tr className="border-[1px] border-solid border-black">
                            <td colSpan={8} className="border-[1px] border-solid border-black px-2 py-1 text-center">Tidak ada data barang</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <table className="w-full mt-0.5">
                <tbody>
                    <tr>
                        <td className="border-[1px] border-solid border-black px-2 py-1 text-center">Barang-barang diterima lengkap dan baik:
                            <div className="flex justify-center gap-2 mt-3">
                                <div className="flex items-center gap-2">
                                    <span>Ya</span>
                                    <input type="checkbox" className="w-9 h-6 border border-black appearance-none cursor-pointer" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>Tidak</span>
                                    <input type="checkbox" className="w-9 h-6 border border-black appearance-none cursor-pointer" />
                                </div>
                            </div>
                            <div className="text-center mt-3">
                                <hr className="w-[70px] inline-block border-black border-1" />
                                <span className="p-1">Tgl</span>
                                <hr className="w-[150px] inline-block border-black border-1" />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="break-inside-avoid mt-4">
                <div className="flex flex-wrap justify-end pr-10 mb-4">
                    <p className="text-right">{`${ttdLap.header?.footerkota || 'MAGELANG'}, ${hariIni}`}</p>
                </div>
                {ttdLap.paraf && ttdLap.paraf.ttd && ttdLap.paraf.ttd.length >= 4 ? (
                    <>
                        <div className={`flex justify-around`}>
                            <div className="text-center w-1/3 mb-8">
                                <p>{ttdLap.paraf.ttd[0].header}</p>
                                <strong>{ttdLap.paraf.ttd[0].jabatan}</strong>
                                <br /><br /><br />
                                <strong className="underline">{ttdLap.paraf.ttd[0].nama}</strong>
                                <br />
                                <strong>{ttdLap.paraf.ttd[0].nik}</strong>
                            </div>
                            <div className="text-center w-1/3 mb-8">
                                <p>{ttdLap.paraf.ttd[1].header}</p>
                                <strong>{ttdLap.paraf.ttd[1].jabatan}</strong>
                                <br /><br /><br />
                                <strong className="underline">{ttdLap.paraf.ttd[1].nama}</strong>
                                <br />
                                <strong>{ttdLap.paraf.ttd[1].nik}</strong>
                            </div>
                            <div className="text-center w-1/3 mb-8">
                                <p>Diserahkan Oleh,</p>
                                <br /><br /><br /><br />
                                <hr className="border-black border-1 w-[150px] mx-auto" />
                                <br />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center mt-10 italic">Data tanda tangan tidak lengkap.</div>
                )}
            </div>
        </div>
    );
});
PrintBarangMasuk.displayName = "PrintBarangMasuk";

export default PrintBarangMasuk;
