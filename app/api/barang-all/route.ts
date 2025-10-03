import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

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
			b.id,
			j.nama AS jenis,
			j.id AS jenis_id,
			m.id AS merek_id,
			m.nama AS merek,
			b.nama,
			b.satuan,
			b.min_stok,
			IF(s.qty IS NULL, 0, s.qty) AS stok_barang,
			b.hargajual AS harga_jual,
			IF(b.aktif = 1, "Aktif", "Tidak Aktif") AS status 
			FROM
			barang b 
			LEFT JOIN jenis j 
				ON b.jenis_id = j.id 
			LEFT JOIN merek m 
				ON b.merek_id = m.id
			LEFT JOIN (SELECT SUM(qty) AS qty,barang_id FROM stock GROUP BY barang_id) s
			ON s.barang_id = b.id
			${status == 'aktif' ? 'WHERE b.aktif = 1' : ''}
			ORDER BY nama ASC
			`, []);

		// // await db.end();
		// console.log(data);
		return NextResponse.json({
			success: true,
			data: data
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

		const { jenis_id, merek_id, nama, satuan, min_stok, harga_jual, aktif } = {
			jenis_id: Number(formData.get("jenis")),
			merek_id: Number(formData.get("merek")),
			nama: formData.get("nama") as string,
			satuan: formData.get("satuan") as string,
			min_stok: Number(formData.get("minimalStok")),
			harga_jual: Number(formData.get("hargaJual")),
			aktif: Number(formData.get("aktif"))
		};
		console.log(harga_jual)
		console.log('tessdsf')



		const [rows] = await db.execute<RowDataPacket[]>('Insert into barang (jenis_id,merek_id,nama,satuan,min_stok,hargajual,aktif) values (?,?,?,?,?,?,?)', [jenis_id, merek_id, nama, satuan, min_stok, harga_jual, aktif]);

		const result: any = rows;
		if (result.affectedRows === 0) {
			return NextResponse.json({
				success: false,
				message: "No Record Affected"
			},
				{
					status: 422
				})
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