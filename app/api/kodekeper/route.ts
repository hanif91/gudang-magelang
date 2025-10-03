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
		const [data] = await db.query<RowDataPacket[]>('SELECT * FROM kodekeper ORDER BY nama ASC', []);

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

		const { nama, kode } = {
			nama: formData.get("nama") as string,
			kode: formData.get("kode") as string,
		};


		const [rows] = await db.execute<RowDataPacket[]>('INSERT INTO kodekeper (kode,nama) VALUES (?,?)', [kode, nama]);

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
