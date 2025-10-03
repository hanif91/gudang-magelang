import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";


// Define tipe data untuk Barang
type Barang = {
	barang_id: string;
	stok_barang: number;
	id_nodpbk: string;
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
type DPBK = {
	id: string,
	tanggal: string;
	nodpbk: string;
	id_unit: string;
	nama_unit: string;
	keterangan: string;
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
		IF(s.qty IS NULL, 0, s.qty) AS stok_barang,
        b.nama AS 'nama_barang',
        u.nama AS 'nama_user',
        un.id AS 'id_unit',
        un.nama AS 'nama_unit',
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
      FROM dpbk d
      LEFT JOIN barang b ON d.barang_id = b.id
	  LEFT JOIN (SELECT SUM(qty) AS qty,barang_id FROM stock GROUP BY barang_id) s ON s.barang_id = b.id
      LEFT JOIN unit un ON d.unit_id  = un.id
      LEFT JOIN web_admin_user u ON d.user_id = u.id
      LEFT JOIN jenis j ON b.jenis_id = j.id
      LEFT JOIN merek m ON b.merek_id = m.id
      LEFT JOIN kategori k ON j.kategori_id = k.id
	  WHERE d.flagproses = 0
      ORDER BY d.id DESC
    `);

		// Group data by nodpb
		const groupedData = rows.reduce((acc, row) => {
			const { id, nodpbk, id_unit, tanggal, keterangan, nama_unit, ...barang } = row;

			// Jika nodpb belum ada di accumulator, tambahkan
			if (!acc[nodpbk]) {
				acc[nodpbk] = {
					id,
					nodpbk,
					id_unit,
					nama_unit,
					keterangan,
					tanggal, // Pindahkan tanggal ke level grup
					barang: [],
				};
			}

			// Tambahkan barang ke array barang untuk nodpb yang sesuai
			acc[nodpbk].barang.push({
				barang_id: barang.id_barang,
				stok_barang: barang.stok_barang,
				id_nodpbk: id, // Perbaiki typo di sini
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
		}, {} as Record<string, DPBK>);

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


// Contoh endpoint POST untuk menyimpan DPB dengan banyak item
export async function POST(request: NextRequest) {
	try {

		const { user } = await getCurrentSession();
		if (user === null) {
			return NextResponse.json(
				{ success: false, message: "Unauthorize" },
				{ status: 403 }
			);
		}

		const formData = await request.formData();
		const tanggal = new Date(formData.get("tanggal") as string);
		const unit_id = formData.get("unit_id") as string;
		const keterangan = formData.get("keterangan") as string;
		const user_id = user.id

		// Iterasi formData untuk mendapatkan items (barang & qty)
		const items: Array<{ barang_id: number; qty: number }> = [];
		// const itemss: Array<{ barang_id: number; qty: number }> = [];
		let currentItem: { barang_id?: number; qty?: number } = {};
		for (const [key, value] of formData.entries()) {
			if (key.includes("barang_id")) {
				currentItem.barang_id = Number(value); // Convert ke number
			} else if (key.includes("qty")) {
				currentItem.qty = Number(value); // Convert ke number
			}

			// Jika kedua nilai sudah ada, tambahkan ke array items
			if (currentItem.barang_id !== undefined && currentItem.qty !== undefined) {
				items.push({ barang_id: currentItem.barang_id, qty: currentItem.qty });
				currentItem = {}; // Reset currentItem untuk item berikutnya
			}
		}

		// Dapatkan nomor DPB terlebih dahulu (misal dengan fungsi SQL noautodpb)
		// Query ini diasumsikan mengembalikan satu record dengan field `nodpb`
		const [dpbRows] = await db.execute<RowDataPacket[]>(
			"SELECT noautodpbk(?) as nodpbk",
			[tanggal]
		);
		const nodpbk = dpbRows[0]?.nodpbk;
		if (!nodpbk) {
			return NextResponse.json(
				{ success: false, message: "Gagal mendapatkan nomor DPBK" },
				{ status: 422 }
			);
		}

		// Susun array values untuk multi insert
		// Setiap record: [nodpb, tanggal, barang_id, qty, user_id]
		const insertValues: any[] = [];
		items.forEach((item) => {
			insertValues.push([nodpbk, tanggal, item.barang_id, item.qty, user_id, unit_id, keterangan]);
		});

		// Buat query multi insert
		const placeholders = insertValues.map(() => "(?,?,?,?,?,?,?)").join(", ");
		const sql = `INSERT INTO dpbk (nodpbk, tanggal,barang_id, qty, user_id, unit_id, keterangan) VALUES ${placeholders}`;
		const flattenedValues = insertValues.flat();

		const [rows] = await db.execute<RowDataPacket[]>(sql, flattenedValues);
		const result: any = rows;
		if (result.affectedRows === 0) {
			return NextResponse.json(
				{ success: false, message: "No Record Affected" },
				{ status: 422 }
			);
		}

		return NextResponse.json(
			{ success: true, data: result },
			{ status: 200 }
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ success: false, message: "Internal Server Error", error },
			{ status: 500 }
		);
	}
}
