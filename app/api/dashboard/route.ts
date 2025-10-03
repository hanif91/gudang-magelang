import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { user } = await getCurrentSession();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 403 }
      );
    }

    const query = `
            SELECT 
                (SELECT COUNT(id) AS belum_verifikasi_bpp FROM barangkeluar WHERE kodekeper_id IS NULL) AS 'belum_verifikasi_bpp',
                (SELECT COUNT(d.id) FROM (SELECT  d.id FROM dpbk d WHERE d.flagproses = 0 GROUP BY d.nodpbk) AS d) AS dpbk,
                (SELECT COUNT(b.id) AS jumlah_min_stok FROM barang b LEFT JOIN stock s ON s.barang_id = b.id WHERE b.min_stok >= s.qty) AS jumlah_min_stok,
                (SELECT SUM(s.qty * s.harga_masuk) AS saldo_persediaan FROM stock s) AS saldo_persediaan
        `;
    const queryJenis = `
           SELECT 
                j.nama AS name,
                COALESCE(SUM(f.qty * f.harga_masuk), 0) AS amount
            FROM 
                jenis_bk j 
            LEFT JOIN 
                barangkeluar bk ON bk.jenis_bk_id = j.id AND DATE_FORMAT(bk.tanggal, "%Y%m") = DATE_FORMAT(NOW(), "%Y%m")
            LEFT JOIN 
                barangkeluar_item bi ON bi.barangkeluar_id = bk.id 
            LEFT JOIN 
                fifo_log f ON f.barangkeluar_item_id = bi.id
            GROUP BY 
                j.id;
        `;
    const queryKategori = `
          SELECT k.nama AS name, SUM(f.qty * f.harga_masuk) AS amount
            FROM kategori k 
            LEFT JOIN jenis j ON j.kategori_id = k.id 
            LEFT JOIN barang b ON b.jenis_id = j.id 
            LEFT JOIN barangkeluar_item bk ON bk.barang_id = b.id AND DATE_FORMAT(bk.tanggal, "%Y%m") = DATE_FORMAT(NOW(), "%Y%m")
            LEFT JOIN fifo_log f ON f.barangkeluar_item_id = bk.id
            GROUP BY k.id
        `;

    // Eksekusi query ke database
    const [data] = await db.query<RowDataPacket[]>(query);
    const [dataJenis] = await db.query<RowDataPacket[]>(queryJenis);
    const [dataKategori] = await db.query<RowDataPacket[]>(queryKategori);

    const result = {
      card: data[0],
      chart: {
        jenis: dataJenis,
        kategori: dataKategori,
      },
    };

    // Kembalikan data dalam respons JSON
    return NextResponse.json(
      {
        success: true,
        data: result, // Ambil baris pertama dari hasil query
      },
      { status: 200 }
    );
  } catch (error) {
    // Tangani error dan kembalikan respons error
    console.error("Error fetching data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
