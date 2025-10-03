import db from "@/lib/db";
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import { getCurrentSession, getSessionOnServerSide } from "@/lib/session";
import { cookies } from "next/headers";
import bcrypt from 'bcrypt'

interface User {
	// 
	id: number,
	email: string,
	nama: string | null,
	image: string | null,
	status: boolean
}

export async function GET(request: Request) {
	try {
		const { user } = await getCurrentSession();
		if (user === null) {
			return NextResponse.json({
				success: false,
				message: 'Unauthorize'
			}, { status: 403 })
		}
		const [data] = await db.query<RowDataPacket[]>('select id,nama,email,nama,image,status from web_admin_user order by nama asc', []);

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

		const { nama, email, password, status } = {
			nama: formData.get("nama") as string,
			email: formData.get("email") as string,
			password: formData.get("password") as string,
			status: formData.get("status") as string
		};


		const [dataCheck] = await db.query<RowDataPacket[]>('select id,nama,email,nama,image,status from web_admin_user where email=? order by nama asc', [email]);
		console.log(dataCheck)
		if (dataCheck.length > 0) {
			return NextResponse.json({
				success: false,
				message: "Email Alrerady Exist"
			},
				{
					status: 422
				})
		}

		const hashedPassword = bcrypt.hashSync(password, 10)
		const [rows] = await db.execute<RowDataPacket[]>('Insert into web_admin_user (email,nama,password,provider,status) values (?,?,?,?,?)', [email, nama, hashedPassword, "credential", status]);

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


