import db from "@/lib/db";
import moment from "moment";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

function olahMonth(tanggal: string) {
	const split = tanggal.split(' ');
	const bulan = [
		{ value: "01", name: "Jan"},
		{ value: "02", name: "Feb"},
		{ value: "03", name: "Mar"},
		{ value: "04", name: "Apr"},
		{ value: "05", name: "May"},
		{ value: "06", name: "Jun"},
		{ value: "07", name: "Jul"},
		{ value: "08", name: "Aug"},
		{ value: "09", name: "Sep"},
		{ value: "10", name: "Oct"},
		{ value: "11", name: "Nov"},
		{ value: "12", name: "Dec"},
	];
	const bulanvalue = bulan.find((b) => b.name === split[1])?.value;
	return `${split[3]}${bulanvalue}`;
}

function olahMonthTgl(tanggal: string) {
	const split = tanggal.split(' ');
	const bulan = [
		{ value: "01", name: "Jan"},
		{ value: "02", name: "Feb"},
		{ value: "03", name: "Mar"},
		{ value: "04", name: "Apr"},
		{ value: "05", name: "May"},
		{ value: "06", name: "Jun"},
		{ value: "07", name: "Jul"},
		{ value: "08", name: "Aug"},
		{ value: "09", name: "Sep"},
		{ value: "10", name: "Oct"},
		{ value: "11", name: "Nov"},
		{ value: "12", name: "Dec"},
	];
	const bulanvalue = bulan.find((b) => b.name === split[1])?.value;
	return `${split[3]}-${bulanvalue}-01`;
}

export async function GET(request: NextRequest) {
	try {
		const { user } = await getCurrentSession();
		if (user === null) {
			return NextResponse.json({
				success: false,
				message: 'Unauthorized'
			}, { status: 403 })
		}
		
		const searchParams = request.nextUrl.searchParams;
		console.log(searchParams);
		const start = searchParams.get("start");
		const end = searchParams.get("end");

		if (!start || !end) {
			return NextResponse.json({
				success: false,
				message: "Missing required query parameters",
			});
		}
		
		const strStart = olahMonth(start);
		const strEnd = olahMonth(end);
		const TglstrStart = olahMonthTgl(start);
		const TglstrEnd = olahMonthTgl(end);
		console.log(strStart, strEnd);

		const [data] = await db.query<RowDataPacket[]>(
			`SELECT * FROM pembelian 
			WHERE DATE_FORMAT(tanggal, '%Y%m') >= ? AND DATE_FORMAT(tanggal, '%Y%m') <= ?
			ORDER BY id ASC`, 
			[strStart, strEnd]
		);

		return NextResponse.json({
			success: true,
			data: data.length > 0 ? data : []
		}, { status: 200 })
	} catch (error) {
		console.log(error);
		return NextResponse.json({
			success: false,
			message: "Internal Server Error"
		}, { status: 500 })
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

		const { no_pembelian, tanggal, keterangan, no_voucher, dpb_id, supplier_id, user_id } = {
			no_pembelian: formData.get("no_pembelian") as string,
			tanggal: new Date(formData.get("tanggal") as string),
			keterangan: formData.get("keterangan") as string,
			no_voucher: formData.get("no_voucher") as string,
			dpb_id: Number(formData.get("dpb_id")),
			supplier_id: Number(formData.get("supplier_id")),
			user_id: Number(formData.get("user_id"))
		};


		const [rows] = await db.execute<RowDataPacket[]>('Insert into pembelian (no_pembelian,tanggal,keterangan,no_voucher,dpb_id,supplier_id,user_id) values (?,?,?,?,?,?,?)', [no_pembelian, tanggal, keterangan, no_voucher, dpb_id, supplier_id, user_id]);

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
			parameter: {
				start: moment(tanggal).format("YYYY-MM-DD"),
				end: moment(tanggal).format("YYYY-MM-DD")
			},
			data: result
		}, { status: 200 });
	} catch (error) {
		console.log(error);
		return NextResponse.json(error)
	}
}
