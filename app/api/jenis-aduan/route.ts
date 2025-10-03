import { NextResponse } from 'next/server';
import db from "@/lib/db";
// import mysqlpromise from 'mysql2/promise';
import mysql, { ConnectionOptions } from 'mysql2/promise';





export async function GET(request : Request) {
	try {
		const [data] = await db.query('select id,nama from jenis_aduan where aktif=1 order by nama asc',[]);
	
		// conn.query('select id,nama from jenis_aduan where aktif=1 order by nama asc', (_err, rows) => {
		// 	conso
		// 	return rows
		// }).then();
		// const jenisAduan = await db.select('id','nama as jenis_aduan').from('jenis_aduan').where('aktif',"1").orderBy('nama','asc');

		return NextResponse.json(data)	
	} catch (error) {
		console.log(error);
		return NextResponse.json(error)	
	}




}