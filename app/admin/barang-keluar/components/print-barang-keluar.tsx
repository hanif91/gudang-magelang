import formatHarga from "@/lib/format-harga";
import AxiosClient from "@/lib/AxiosClient";
import { forwardRef } from "react";
import useSWR from "swr";
import Image from "next/image";

interface Bpp {
    id: number;
    nobpp: string;
    tanggal: string;
    keterangan: string;
    total: number;
    nama_bagminta: string;
    namattd_bagminta: string;
    barang_keluar_items: Barang[];
}

interface Barang {
    id_barang: number;
    nama_barang: string;
    satuan: string;
    qty: number;
    qty_minta: number;
    harga: number;
    stok: number;
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
            is_id: boolean;
        }[];
    };
}

const fetcher = (url: string) => AxiosClient.get(url).then(res => res.data.data);

const PrintDPB = forwardRef<HTMLDivElement, { data: Bpp }>(({ data }, ref) => {
    const { data: ttdLap, error: errorTtdLap, isLoading: isLoadingTtdLap } = useSWR<TtdLap>(`/api/portal/settings/attribute-lap?namalap=BPP&bagminta=${data.namattd_bagminta}`, fetcher);

    if (isLoadingTtdLap || !ttdLap) {
        return <div>Loading tanda tangan...</div>;
    }

    if (errorTtdLap) {
        return <div>Gagal memuat data tanda tangan.</div>;
    }

    // Format tanggal ke Indonesia (contoh: 15 Maret 2025)
    const formatTanggal = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    const ttdFilter = ttdLap.paraf.ttd.filter((e, i) => {
        return e.is_id == true;
    })

    return (
        <div ref={ref} className="text-sm font-sans mx-auto w-full px-3"
            style={{
                // height: "297mm", // Tinggi sesuai A4
            }}>
            {/* Header */}
            <div className="flex items-center space-x-2 mb-5">
                <Image className="w-16 h-auto" src="/logo.png" alt="Logo" width={64} height={64} />
                <div className="text-green-800 items-start">
                    <p>{ttdLap.header?.headerlap1}</p>
                    <p>{ttdLap.header?.headerlap2}</p>
                </div>
            </div>

            <h2 className="text-center font-bold mt-2">
                BUKTI PENERIMAAN DAN PENGELUARAN BARANG <br /> ( BPP )
            </h2>

            <div className="flex justify-between items-center mb-2 font-bold">
                <span >Bagian Yang Meminta : {data.nama_bagminta}</span>
                <span>No. {data.nobpp}</span>
            </div>
            {/* <hr className="border-black" />  */}

            {/* Judul */}

            {/* Info Permintaan */}
            {/* <p className="mt-2">
                Kepada Yth. <strong>URUSAN / PELAKSANA PEMBELIAN</strong> <br />
                Mohon dipesankan barang-barang seperti tersebut <br /> di bawah ini untuk disampaikan kepada:
                <span className="inline-block w-[100px] border-b border-black border-dotted"></span> <br />
                Barang - barang tersebut dibutuhkan segera dalam waktu
                <span className="inline-block w-[50px] border-b border-black border-dotted"></span> hari
            </p> */}

            <table className="w-full mt-4">
                <thead >
                    <tr>
                        <th className="border-[1px] border-solid border-black px-2 py-1 w-1/12 text-center" rowSpan={2}>NO.</th>
                        <th className="border-[1px] border-solid border-black px-2 py-1 w-1/12 text-center" colSpan={2}>YANG MEMINTA</th>
                        <th className="border-[1px] border-solid border-black px-2 py-1 w-1/12 text-center" rowSpan={2}>URAIAN</th>
                        <th className="border-[1px] border-solid border-black px-2 py-1 w-1/12 text-center" colSpan={4}> Dikeluarkan</th>
                    </tr>
                    <tr>
                        <th className="border-[1px] border-solid border-black px-2 py-1 w-1/12 text-center">BYK</th>
                        <th className="border-[1px] border-solid border-black px-2 py-1 w-1/12 text-center">SAT</th>
                        <th className="border-[1px] border-solid border-black px-2 py-1 w-1/12 text-center">BYK</th>
                        <th className="border-[1px] border-solid border-black px-2 py-1 w-1/12 text-center">SAT</th>
                        <th className="border-[1px] border-solid border-black px-2 py-1 w-1/12 text-center">HRG.SAT</th>
                        <th className="border-[1px] border-solid border-black px-2 py-1 w-1/12 text-center">JUMLAH</th>

                    </tr>


                    {/* <th className="border-[1px] border-solid border-black px-2 py-1 w-1/12 text-center">STOCK</th> */}
                    {/* </tr> */}
                </thead>
                <tbody>
                    {data?.barang_keluar_items?.map((items, index) => {
                        return (
                            <tr key={index} className={`border-[1px] border-solid border-black ${index % 24 == 0 && 'break-page'}`}>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-center w-1/12">{index + 1}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-right w-1/12">{items.qty_minta}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 w-1/12">{items.satuan}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 w-6/12">{items.nama_barang}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-right w-1/12">{items.qty}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-right w-1/12">{items.satuan}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-right w-1/12">{formatHarga(items.harga, { style: "decimal" })}</td>
                                <td className="border-[1px] border-solid border-black px-2 py-1 text-right w-1/12">{formatHarga(items.harga * items.qty, { style: "decimal" })}</td>
                                {/* <td className="border-[1px] border-solid border-black px-2 py-1 text-right w-1/12"></td> */}
                                {/* <td className="border-[1px] border-solid border-black px-2 py-1 text-right w-1/12">{items.}</td> */}
                            </tr>
                        )
                    })}
                    <tr className="border-[1px] border-solid border-black">
                        <td colSpan={7} className="border-[1px] border-solid border-black px-2 py-1 text-right font-bold">Total</td>
                        <td className="border-[1px] border-solid border-black px-2 py-1 text-right font-bold">{formatHarga(data.total, { style: "decimal" })}</td>
                    </tr>
                    <tr className="border-[1px] border-solid border-black">
                        <td colSpan={8}>Di Gunakan Untuk : {data?.keterangan}</td>
                    </tr>
                </tbody>
            </table>


            {/* Tanda Tangan */}
            {/* <div className="page-break-avoid mt-4">
                <div className="flex flex-wrap">
                    <div className="w-1/3" />
                    <div className="w-1/3" />
                    <div className="w-1/3">
                        <p className="text-center">{`${ttdLap.kota?.footerkota}, ${formatTanggal}`}</p>
                    </div>
                </div>

                <div className={`flex flex-row justify-between`}>
                    {ttdFilter.map((items, index) => (
                        <div key={index} className={` flex flex-row ${index == 0 ?"justify-end" : index == 1 ? "justify-center" : "justify-start"} w-1/3`}>
                            <div className="mb-8 flex flex-col items-center">
                                <p className="text-left">{items.header}</p>
                                <br /><br /><br />{index != 1 ?
                                    <div className="flex flex-row space-x-3 text-left">
                                        <div className="flex flex-col">
                                            <span>Nama</span>
                                            <span>Tanggal</span>
                                        </div>
                                        <div className="flex flex-row space-x-2">
                                            <div className="flex flex-col">
                                                <span>:</span>
                                                <span>:</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span>{items.nama_paraf}</span>
                                                <span>....</span>
                                            </div>
                                        </div>

                                    </div>
                                    : <strong>{items.nama_paraf}</strong>}

                            </div>
                        </div>

                    ))}
                </div>
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row space-x-3 text-left w-1/3 border">
                        <div className="flex flex-col">
                            <span>Nama</span>
                            <span>Tanggal</span>
                        </div>
                        <div className="flex flex-row space-x-2">
                            <div className="flex flex-col">
                                <span>:</span>
                                <span>:</span>
                            </div>
                            <div className="flex flex-col">
                                <span>Testtt</span>
                                <span>....</span>
                            </div>
                        </div>

                    </div>
                    <span className="w-1/3 border" />
                    <div className="flex flex-row space-x-3 text-left w-1/3 border">
                        <div className="flex flex-col">
                            <span>Nama</span>
                            <span>Tanggal</span>
                        </div>
                        <div className="flex flex-row space-x-2">
                            <div className="flex flex-col">
                                <span>:</span>
                                <span>:</span>
                            </div>
                            <div className="flex flex-col">
                                <span>Testtt</span>
                                <span>....</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div> */}

            <div className="break-inside-avoid mt-4">
                {/* <div className="flex flex-wrap">
                    <div className="w-1/3" />
                    <div className="w-1/3" />
                    <div className="w-1/3">
                        <p className="text-center">{`${ttdLap.header?.footerkota}, ${formatTanggal}`}</p>
                    </div>
                </div> */}

                <div className={`flex flex-wrap flex-col`}>

                    <div className="flex flex-wrap justify-end pr-10">
                        <p className="text-right">{`${ttdLap.header?.footerkota}, ${formatTanggal}`}</p>
                    </div>
                    <div className={`flex justify-between`}>
                        <div className="text-center w-1/3 mb-8">
                            <p>{ttdLap.paraf.ttd[0].header}</p>
                            <strong>{ttdLap.paraf.ttd[0].jabatan}</strong>
                            <br /><br /><br />
                            <strong>{ttdLap.paraf.ttd[0].nama}</strong>
                        </div>
                        <div className="text-center w-1/3 mb-8">
                            <p>{ttdLap.paraf.ttd[1].header}</p>
                            <strong>{ttdLap.paraf.ttd[1].jabatan}</strong>
                            <br /><br /><br />
                            <strong>{ttdLap.paraf.ttd[1].nama}</strong>
                        </div>
                        <div className="text-center w-1/3 mb-8">
                            <p>Dikelola oleh</p>
                            <strong>{data.nama_bagminta}</strong>
                            <br /><br /><br />
                            <strong>{data.namattd_bagminta}</strong>
                        </div>
                    </div>
                    <div className={`flex justify-between`}>
                        <div className="text-center w-1/3 mb-8">
                            <p>{ttdLap.paraf.ttd[2].header}</p>
                            <strong>{ttdLap.paraf.ttd[2].jabatan}</strong>
                            <br /><br /><br />
                            <strong>{ttdLap.paraf.ttd[2].nama}</strong>
                        </div>
                        <div className="w-1/3 mb-8 ml-5">
                            <p className="text-center">Yang menerima barang</p>
                            <ul className="list-decimal mt-3">
                                <li className=""><span className="ml-24">:</span> </li>
                                <li className=""><span className="ml-24">:</span> </li>
                                <li className=""><span className="ml-24">:</span> </li>
                            </ul>
                        </div>
                        <div className="w-1/3 mb-8">
                            <p className="text-center">Dibukukan ke Kartu Stock</p>

                            <table className="border border-collapse border-black mt-3 w-full">
                                <tr>
                                    <td className="border border-collapse border-black ">Input Tgl:</td>
                                </tr>
                                <tr>
                                    <td className="border border-collapse border-black ">Diketahui:</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className="footer">
                <p className="text-right italic text-sm">Halaman 1 dari 1</p>
            </div> */}
        </div>
    );
});
PrintDPB.displayName = "PrintDPB";

export default PrintDPB;