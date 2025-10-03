import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

interface Barang {
    barang_id: number;
    nama_barang: string;
    merek: string;
    jenis: string;
    kategori: string;
    qty: number;
    satuan: string;
}

interface Paket {
    id: number;
    nama_paket: string;
    barang: Barang[];
}


export async function GET(request: Request) {
    try {
        const { user } = await getCurrentSession();
        if (user === null) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorize'
            }, { status: 403 })
        }
        const [rows] = await db.query<RowDataPacket[]>('SELECT p.id, p.nama AS nama_paket, p.qty,b.id AS id_barang ,b.nama AS nama_barang, b.satuan, j.nama AS jenis, m.nama AS merek, k.nama AS kategori FROM paket p LEFT JOIN barang b ON p.barang_id = b.id LEFT JOIN jenis j ON b.jenis_id = j.id LEFT JOIN merek m ON b.merek_id = m.id LEFT JOIN kategori k ON j.kategori_id = k.id ORDER BY p.nama ASC', []);

        const groupedData = rows.reduce((acc, row) => {
            const { id, nama_paket, ...barang } = row;

            if (!acc[nama_paket]) {
                acc[nama_paket] = {
                    id,
                    nama_paket,
                    barang: [],
                };
            }

            acc[nama_paket].barang.push({
                barang_id: barang.id_barang,
                nama_barang: barang.nama_barang,
                merek: barang.merek,
                jenis: barang.jenis,
                kategori: barang.kategori,
                qty: barang.qty,
                // no_voucher: barang.no_voucher,
                // keterangan: barang.keterangan,
                // supplier: barang.supplier,
                satuan: barang.satuan,
            });

            return acc;
        }, {} as Record<string, Paket>);

        const result = Object.values(groupedData);



        // // await db.end();
        // console.log(data);
        return NextResponse.json({
            success: true,
            data: result
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json(error)
    }
}