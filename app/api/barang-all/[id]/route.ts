import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { user } = await getCurrentSession();
		if (user === null) {
			return NextResponse.json({
				success: false,
				message: 'Unauthorize'
			}, { status: 403 })
		}
		const param = await params
		const id = param.id

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


		const [dataCheck] = await db.query<RowDataPacket[]>('select * from barang where id=? order by nama asc', [id]);

		// console.log(nama);
		if (dataCheck.length === 0) {
			return NextResponse.json({
				success: false,
				message: "dataNotexist"
			}, { status: 422 })
		}

		const [rows] = await db.execute<RowDataPacket[]>('UPDATE barang set jenis_id=?,merek_id=?,nama=?,satuan=?,min_stok=?,hargajual=?,aktif=? where id=?', [jenis_id, merek_id, nama, satuan, min_stok, harga_jual, aktif, id]);

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
			success: true,
			data: rows
		}, { status: 200 });
	} catch (error) {
		console.log(error);
		return NextResponse.json(error)
	}
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { user } = await getCurrentSession();
		if (user === null) {
			return NextResponse.json({
				success: false,
				message: 'Unauthorize'
			}, { status: 403 })
		}

		const param = await params
		const id = param.id
		const [dataCheck] = await db.query<RowDataPacket[]>('SELECT b.id,j.id AS jenis ,m.id AS merek, b.nama, b.satuan, b.min_stok, b.hargajual AS harga_jual, b.aktif as status FROM barang b LEFT JOIN jenis j ON b.jenis_id = j.id LEFT JOIN merek m ON b.merek_id = m.id WHERE b.id = ?', [id]);

		if (dataCheck.length === 0) {
			return NextResponse.json({
				success: false,
				message: "dataNotexist"
			}, { status: 422 })
		}

		const result = {
			id: dataCheck[0].id,
			jenis_id: dataCheck[0].jenis_id,
			merek_id: dataCheck[0].merek_id,
			nama: dataCheck[0].nama,
			satuan: dataCheck[0].satuan,
			min_stok: dataCheck[0].min_stok,
			harga_jual: dataCheck[0].harga_jual,
			aktif: dataCheck[0].aktif
		}
		return NextResponse.json({
			success: true,
			data: dataCheck[0]
		}, { status: 200 })
	} catch (error) {
		console.log(error);
		return NextResponse.json(error)
	}
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { user } = await getCurrentSession();
		if (user === null) {
			return NextResponse.json({
				success: false,
				message: 'Unauthorize'
			}, { status: 403 });
		}

		const param = await params;
		const id = param.id;

		const [dataCheck] = await db.query<RowDataPacket[]>('SELECT * FROM barang WHERE id=?', [id]);

		if (dataCheck.length === 0) {
			return NextResponse.json({
				success: false,
				message: "dataNotexist"
			}, { status: 422 });
		}

		await db.execute('DELETE FROM barang WHERE id=?', [id]);

		return NextResponse.json({
			success: true,
			message: "Data deleted successfully"
		}, { status: 200 });
	} catch (error) {
		console.log(error);
		return NextResponse.json(error);
	}
}
