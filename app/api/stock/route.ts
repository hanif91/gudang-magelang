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
		const [data] = await db.query<RowDataPacket[]>('SELECT s.*,b.nama AS "nama_barang"  FROM stock s LEFT JOIN barang b ON s.barang_id = b.id ORDER BY s.id ASC', []);

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

		const { barang_id, qty, tanggal_masuk, harga_masuk } = {
			barang_id: Number(formData.get("barang_id")),
			qty: Number(formData.get("qty")),
			tanggal_masuk: new Date(formData.get("tanggal_masuk") as string),
			harga_masuk: Number(formData.get("harga_masuk"))
		};


		const [rows] = await db.execute<RowDataPacket[]>('Insert into stock (barang_id,qty,tanggal_masuk,harga_masuk) values (?,?,?,?)', [barang_id, qty, tanggal_masuk, harga_masuk]);

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
