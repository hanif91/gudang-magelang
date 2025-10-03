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
		const [data] = await db.query<RowDataPacket[]>('SELECT j.id, k.nama AS kategori_nama, j.nama AS jenis_nama, IF(j.aktif = 1, "Aktif", "Tidak Aktif") AS status FROM jenis j LEFT JOIN kategori k ON j.kategori_id = k.id  ORDER BY j.nama ASC', []);

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

		const { kategori_id, nama, aktif } = {
			kategori_id: Number(formData.get("kategori_id")),
			nama: formData.get("nama") as string,
			aktif: Number(formData.get("aktif"))
		};


		const [rows] = await db.execute<RowDataPacket[]>('Insert into jenis (kategori_id,nama,aktif) values (?,?,?)', [kategori_id, nama, aktif]);

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
