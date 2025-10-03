import db from "@/lib/db";
import { NextRequest, NextResponse } from 'next/server';
import  { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';
import { getCurrentSession, getSessionOnServerSide } from "@/lib/session";
import { cookies } from "next/headers";

interface User {
	// 
	id : number,
	email : string,
	nama : string | null,
	image : string | null,
	status : boolean
}

export async function PUT(request : NextRequest,{ params }: { params:  Promise<{ id: string }> }) {
	try {
		const { user } = await getCurrentSession();
		if (user === null) {
			return NextResponse.json({
				success : false,
				message : 'Unauthorize'
			}, {status: 403})
		}
		const param =  await params
		const id =  param.id	

		const formData = await request.formData();
		
		const {nama,email,password,status} = {
			nama : formData.get("nama") as string,
			email : formData.get("email") as string,		
			password : formData.get("password") as string,
			status : formData.get("status") as string
		};
		const [dataCheck] = await db.query<RowDataPacket[]>('select id,nama,email,nama,image,status,password from web_admin_user where id=? order by nama asc',[id]);

		console.log(nama,email);
		if (dataCheck.length === 0 ) {
			return NextResponse.json({
				success : false,
				message : "dataNotexist"
			},{status: 422})	
		}

		const hashedPassword = bcrypt.hashSync(password, 10)
		const [rows] = await db.execute<RowDataPacket[]>('UPDATE web_admin_user set email=?,nama=?,status=? where id=?',[email,nama,status,id]);

		// const result : any = rows;
		// if (result.affectedRows === 0) {
		// 	return NextResponse.json({
		// 		success : false,
		// 		message : "No Record Affected"
		// 	},
		// 	{
		// 		status: 422
		// 	})				
		// }


		return NextResponse.json({
			success : true,
			data : rows
		}, {status: 200});
	} catch (error) {
		console.log(error);
		return NextResponse.json(error)
	}
}

export async function GET(request: Request,{ params }: { params:  Promise<{ id: string }> }) {
	try {
		const { user } = await getCurrentSession();
		if (user === null) {
			return NextResponse.json({
				success : false,
				message : 'Unauthorize'
			}, {status: 403})
		}

		const param =  await params
		const id =  param.id
		const [dataCheck] = await db.query<RowDataPacket[]>('select id,nama,email,nama,image,status,password from web_admin_user where id=? order by nama asc',[id]);

		if (dataCheck.length === 0 ) {
			return NextResponse.json({
				success : false,
				message : "dataNotexist"
			},{status: 422})	
		}

		const result = {
			id : dataCheck[0].id,
			nama : dataCheck[0].nama,
			email : dataCheck[0].email,
			status : dataCheck[0].status.toString(),
			image : dataCheck[0].image,
			password: dataCheck[0].password
		}
		return NextResponse.json( {
			success : true, 
			data : result
		},{status : 200})	
	} catch (error) {
		console.log(error);
		return NextResponse.json(error)	
	}
}

export async function POST(request : NextRequest) {
	try {

		const { user } = await getCurrentSession();

    // const cookieStore = await cookies();
    // const token = cookieStore.get("session")?.value;
		if (user === null) {
			return NextResponse.json({
				success : false,
				message : 'Unauthorize'
			}, {status: 403})
		}
		const formData = await request.formData();
		
		const {nama,email,password,status} = {
			nama : formData.get("nama") as string,
			email : formData.get("email") as string,		
			password : formData.get("password") as string,
			status : formData.get("status") as string
		};


		const [dataCheck] = await db.query<RowDataPacket[]>('select id,nama,email,nama,image,status from web_admin_user where email=? order by nama asc',[email]);
		console.log(dataCheck)
		if (dataCheck.length > 0 ) {
			return NextResponse.json({
				success : false,
				message : "Email Alrerady Exist"
			},
			{
				status: 422
			})	
		}

		const hashedPassword = bcrypt.hashSync(password, 10)
		const [rows] = await db.execute<RowDataPacket[]>('Insert into web_admin_user (email,nama,password,provider,status) values (?,?,?,?,?)',[email,nama,hashedPassword,"credential",status]);

		const result : any = rows;
		if (result.affectedRows === 0) {
			return NextResponse.json({
				success : false,
				message : "No Record Affected"
			},
			{
				status: 422
			})				
		}

		return NextResponse.json({
			success : true,
			message : "Success Created",
			data : result
		}, {status: 200});				
	} catch (error) {
		console.log(error);
		return NextResponse.json(error)	
	}




}


