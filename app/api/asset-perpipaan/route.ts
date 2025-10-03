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
		const [data] = await db.query<RowDataPacket[]>('SELECT p.*, l.nama as lokasi FROM asset_perpipaan p LEFT JOIN asset_lokasi l ON p.lokasi_id = l.id ORDER BY p.nama ASC', []);

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

		const { tanggal, nama, alamat, nilai, lokasi_id, aktif } = {
			nama: formData.get("nama") as string,
			aktif: Number(formData.get("aktif")),
			alamat: formData.get("alamat") as string,
			tanggal: formData.get("tanggal") as string,
			nilai: Number(formData.get("nilai")),
			lokasi_id: Number(formData.get("lokasi_id")),
		};


		const [rows] = await db.execute<RowDataPacket[]>('INSERT INTO asset_perpipaan (tanggal,nama,alamat,nilai,lokasi_id,aktif) VALUES (?,?,?,?,?,?)', [tanggal, nama, alamat, nilai, lokasi_id, aktif]);

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
