import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
    const url = new URL(request.url); // Ambil URL dari request
    const searchParams = url.searchParams;
    const tipe = searchParams.get('tipe')
    const bagminta = searchParams.get('bagminta')
    console.log(tipe)
    try {
        const { user } = await getCurrentSession();
        if (user === null) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 403 });
        }

        // Query untuk mengambil data ttdlap
        const [ttdlap] = await db.query<RowDataPacket[]>(`
            SELECT 
            t.*,
            u1.nama AS nama_paraf1,
            u1.jabatan AS jabatan_paraf1,
            u2.nama AS nama_paraf2,
            u2.jabatan AS jabatan_paraf2,
            u3.nama AS nama_paraf3,
            u3.jabatan AS jabatan_paraf3,
            u4.nama AS nama_paraf4,
            u4.jabatan AS jabatan_paraf4
            FROM ttdlap t
            LEFT JOIN userparaf u1 ON t.id1_paraf = u1.id
            LEFT JOIN userparaf u2 ON t.id2_paraf = u2.id
            LEFT JOIN userparaf u3 ON t.id3_paraf = u3.id
            LEFT JOIN userparaf u4 ON t.id4_paraf = u4.id
            WHERE t.kode = ?
        `, [tipe]);

        // Query untuk mengambil data logo
        const [kota] = await db.query<RowDataPacket[]>(`
            SELECT * FROM pengaturan
        `);


        // Format data ttdlap sesuai kebutuhan


        const formattedTtdlap = ttdlap.reduce((acc: any[], row: any) => {
            acc.push(
                { header: row.header1, nama_paraf: row.nama_paraf1, jabatan: row.jabatan_paraf1, isid: row.isid1 },
                { header: row.header2, nama_paraf: row.nama_paraf2, jabatan: row.jabatan_paraf2, isid: row.isid2 },
                { header: row.header3, nama_paraf: row.nama_paraf3, jabatan: row.jabatan_paraf3, isid: row.isid3 },
            );

            if (tipe === "BPP") {
                acc.push({
                    header: "Barang yang diminta telah diterima",
                    nama_paraf: bagminta || "Tidak Diketahui",
                    jabatan: "",
                    isid: 1
                });
            }

            acc.push({ header: row.header4, nama_paraf: row.nama_paraf4, jabatan: row.jabatan_paraf4, isid: row.isid4 })

            return acc;
        }, []);

        // Mengembalikan response dengan data yang diformat
        return NextResponse.json({
            success: true,
            tipe: tipe,
            data: {
                ttdlap: formattedTtdlap,
                kota: kota[0]
            }
        }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        }, { status: 500 });
    }
}