import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";


type Barang = {
	barang_id: number;
	nama_barang: string;
	merek: string;
	jenis: string;
	kategori: string;
	stok_barang: number;
	qty: number;
};

// Define tipe data untuk DPB
type Paket = {
	id: string,
	nama_paket: string;
	barang: Barang[];
};

export async function GET(request: Request) {
	try {
		const { user } = await getCurrentSession();
		if (user === null) {
			return NextResponse.json({
				success: false,
				message: 'Unauthorize'
			}, { status: 403 })
		}
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status")
		const [data] = await db.query<RowDataPacket[]>(`
			SELECT 
				p.id, 
				p.nama, 
				p.qty,
				b.nama AS barang, 
				b.id AS id_barang,
				IF(s.qty IS NULL, 0, s.qty) AS stok_barang,
				b.satuan, 
				j.nama AS jenis, 
				m.nama AS merek, 
				k.nama AS kategori 
			FROM paket p 
			LEFT JOIN barang b ON p.barang_id = b.id 
			LEFT JOIN (SELECT SUM(qty) AS qty,barang_id FROM stock GROUP BY barang_id) s ON s.barang_id = b.id
			LEFT JOIN jenis j ON b.jenis_id = j.id 
			LEFT JOIN merek m ON b.merek_id = m.id 
			LEFT JOIN kategori k ON j.kategori_id = k.id 
			${status == 'tersedia' ? 'WHERE s.qty > 0' : ''}
			ORDER BY p.nama ASC
			`, []);
		const groupedData = data.reduce((acc, row) => {
			const { id, nama, ...barang } = row;

			// Jika nodpb belum ada di accumulator, tambahkan
			if (!acc[nama]) {
				acc[nama] = {
					id,
					nama_paket: nama,
					barang: [],
				};
			}

			// Tambahkan barang ke array barang untuk nodpb yang sesuai
			acc[nama].barang.push({
				barang_id: barang.id_barang,
				nama_barang: barang.barang,
				jenis: barang.jenis,
				kategori: barang.kategori,
				stok_barang: barang.stok_barang,
				merek: barang.merek,
				qty: barang.qty
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



export async function POST(request: NextRequest) {
	try {

		const { user } = await getCurrentSession();

		// const cookieStore = await cookies();
		// const token = cookieStore.get("session")?.value;
		if (user === null) {
			return NextResponse.json({
				success: false,
				message: 'Unauthorize'
			}, { status: 403 })
		}
		const formData = await request.formData();

		const { nama } = {
			nama: formData.get("nama") as string,
			// qty: Number(formData.get("qty")),
			// barang_id: Number(formData.get("barang_id"))
		};


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

		const insertValues: any[] = [];
		items.forEach((item) => {
			insertValues.push([nama, item.barang_id, item.qty]);
		});



		const placeholders = insertValues.map(() => "(?,?,?)").join(", ");
		const sql = `INSERT INTO paket (nama, barang_id, qty) VALUES ${placeholders}`;
		const flattenedValues = insertValues.flat();

		const [rows] = await db.execute<RowDataPacket[]>(sql, flattenedValues);
		const result: any = rows;
		if (result.affectedRows === 0) {
			return NextResponse.json(
				{ success: false, message: "No Record Affected" },
				{ status: 422 }
			);
		}


		return NextResponse.json({
			success: true,
			data: result
		}, { status: 200 });
	} catch (error) {
		console.log(error);
		return NextResponse.json(error)
	}




}
