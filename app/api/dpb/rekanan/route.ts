import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";


type Barang = {
    id: string;
    id_nodpb: string;
    nama_barang: string;
    qty: number;
    nama_user: string;
    satuan_barang: string;
    minimal_stok_barang: number;
    harga_jual_barang: number;
    foto_barang: string;
    nama_jenis: string;
    nama_kategori: string;
    nama_merek: string;
};

// Define tipe data untuk DPB
type DPB = {
    id: string,
    tanggal: string;
    nodpb: string;
    barang: Barang[];
};

export async function GET(request: Request) {
    try {
        const { user } = await getCurrentSession();
        if (user === null) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 403 }
            );
        }

        // Query database
        const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        d.*,
        b.id AS 'id_barang',
        b.nama AS 'nama_barang',
        u.nama AS 'nama_user',
        b.satuan AS 'satuan_barang',
        b.min_stok AS 'minimal_stok_barang',
        b.hargajual AS 'harga_jual_barang',
        b.url_foto AS 'foto_barang',
        j.id AS 'id_jenis',
        j.nama AS 'nama_jenis',
        k.id AS 'id_kategori',
        k.kode AS 'kode_kategori',
        k.nama AS 'nama_kategori',
        m.id AS 'id_merek',
        m.nama AS 'nama_merek'
      FROM dpb d
      LEFT JOIN barang b ON d.barang_id = b.id
      LEFT JOIN web_admin_user u ON d.user_id = u.id
      LEFT JOIN jenis j ON b.jenis_id = j.id
      LEFT JOIN merek m ON b.merek_id = m.id
      LEFT JOIN kategori k ON j.kategori_id = k.id
	  WHERE d.flagproses = 0
      AND d.flagfullrekanan = 1
      ORDER BY d.id ASC
    `);

        // Group data by nodpb
        const groupedData = rows.reduce((acc, row) => {
            const { id, nodpb, tanggal, ...barang } = row;

            // Jika nodpb belum ada di accumulator, tambahkan
            if (!acc[nodpb]) {
                acc[nodpb] = {
                    id,
                    nodpb,
                    tanggal, // Pindahkan tanggal ke level grup
                    barang: [],
                };
            }

            // Tambahkan barang ke array barang untuk nodpb yang sesuai
            acc[nodpb].barang.push({
                id: barang.id_barang,
                id_nodpb: id, // Perbaiki typo di sini
                nama_barang: barang.nama_barang,
                qty: barang.qty, // Sesuaikan dengan kolom qty yang ada di query
                nama_user: barang.nama_user,
                satuan_barang: barang.satuan_barang,
                minimal_stok_barang: barang.minimal_stok_barang,
                harga_jual_barang: barang.harga_jual_barang,
                foto_barang: barang.foto_barang,
                nama_jenis: barang.nama_jenis,
                nama_kategori: barang.nama_kategori,
                nama_merek: barang.nama_merek,
            });

            return acc;
        }, {} as Record<string, DPB>);

        // Ubah hasil grouping menjadi array
        const result = Object.values(groupedData);

        return NextResponse.json(
            {
                success: true,
                data: result,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            { status: 500 }
        );
    }
}