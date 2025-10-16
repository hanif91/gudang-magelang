import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import moment from "moment";

interface Barang {
	id_barang: number;
	id_pembelian_item: number;
	nodpb: string;
	nama_barang: string;
	merek: string;
	jenis: string;
	kategori: string;
	harga_beli: number;
	qty: number;
	// no_voucher: string,
	// keterangan: string,
	// supplier: string,
	satuan: string;
	qtyfifo: number;
}

interface Pembelian {
	id_pembelian: number;
	no_pembelian: number;
	tanggal: string;
	no_voucher: string;
	keterangan: string;
	supplier: string;
	// user: string;
	barang: Barang[];
	
}

function  olahMonth(tanggal: string) {
		
	const split = tanggal.split(' ');
	const bulan = 
    [
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

    ]
		const bulanvalue = bulan.find((b) => b.name === split[1])?.value;


	return `${split[3]}${bulanvalue}`;
}
function  olahMonthTgl(tanggal: string) {
		
	const split = tanggal.split(' ');
	const bulan = 
    [
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

    ]
		const bulanvalue = bulan.find((b) => b.name === split[1])?.value;


	return `${split[3]}-${bulanvalue}-01`;
}

export async function GET(request: NextRequest) {
	try {
		const { user } = await getCurrentSession();
		if (user === null) {
			return NextResponse.json(
				{
					success: false,
					message: "Unauthorized",
				},
				{ status: 403 }
			);
		}
    const searchParams = request.nextUrl.searchParams;

    const start = searchParams.get("start");
    const end = searchParams.get("end");

		if (!start || !end) {
			return NextResponse.json({
				success: false,
				message: "Missing required query parameters",
			});
		}
		// const strStart = moment(start).format('YYYYMM');
		// const strEnd = moment(end).format('YYYYMM');

			const strStart = olahMonth(start);
		const strEnd = olahMonth(end);
		const TglstrStart = olahMonthTgl(start);
		const TglstrEnd = olahMonthTgl(end);
		console.log(strStart, strEnd);

		const [rows] = await db.query<RowDataPacket[]>(`
			SELECT 
				p.id AS id_pembelian,
				b.id AS id_barang,
				pm.id AS id_pembelian_item,
				pm.tanggal,
				p.no_pembelian,
				p.no_voucher,
				d.nodpb,
				b.nama AS barang,
				m.nama AS merek,
				j.nama AS jenis,
				k.nama AS kategori,
				pm.harga_beli,
				pm.qty,
				st.qty as qtyfifo,
				b.satuan,
				p.keterangan,
				s.nama AS supplier,
				u.nama AS USER
			FROM pembelian_item pm	
			LEFT JOIN pembelian p ON pm.pembelian_id = p.id
			LEFT JOIN barang b ON pm.barang_id = b.id
			LEFT JOIN stock st on pm.id=st.pembelian_item_id
			LEFT JOIN dpb d ON d.id = pm.dpb_id
			LEFT JOIN suplier s ON p.suplier_id = s.id
			LEFT JOIN web_admin_user u ON p.user_id = u.id
			LEFT JOIN jenis j ON b.jenis_id = j.id
			LEFT JOIN merek m ON b.merek_id = m.id
			LEFT JOIN kategori k ON j.kategori_id = k.id
			where DATE_FORMAT(pm.tanggal, '%Y%m') >= ? AND DATE_FORMAT(pm.tanggal, '%Y%m') <= ?
			ORDER BY p.created_at DESC
	  `, [strStart, strEnd]);


		const [rows2] = await db.query<RowDataPacket[]>(`
			SELECT 
				p.id AS id_pembelian,
				p.no_pembelian,
				p.no_voucher,
				p.tanggal,
				p.keterangan,
				s.nama AS supplier,
				pm.total as total
			FROM pembelian p
			left join (select sum(qty*harga_beli) as total,pembelian_id from pembelian_item group by pembelian_id) pm on p.id=pm.pembelian_id
			LEFT JOIN suplier s ON p.suplier_id = s.id
			WHERE DATE_FORMAT(p.tanggal, '%Y%m') >= ? AND DATE_FORMAT(p.tanggal, '%Y%m') <= ?
			ORDER BY p.created_at DESC
	  `	, [strStart, strEnd]);		

		const dataResult = rows2.map((row) => {
			const { id_pembelian, no_pembelian, no_voucher, tanggal, keterangan, supplier, total  } = row;
			return {
				id_pembelian,
				no_pembelian,
				no_voucher,
				tanggal,
				keterangan,
				supplier,
				total : Number(total) || 0,
				barang: rows
					.filter((item) => item.id_pembelian === id_pembelian)
					.map((item) => ({
						id_barang: item.id_barang,
						id_pembelian_item: item.id_pembelian_item,
						nodpb: item.nodpb,
						nama_barang: item.barang,
						merek: item.merek,
						jenis: item.jenis,
						kategori: item.kategori,
						harga_beli: item.harga_beli,
						qty: item.qty,
						satuan: item.satuan,
						qtyfifo: item.qtyfifo
					})),
			};
		});

		// // Group data by no_pembelian
		// const groupedData = rows.reduce((acc, row) => {
		// 	const { no_voucher, keterangan, supplier, id_pembelian, no_pembelian, tanggal, ...barang } = row;
			
		// 	// Jika no_pembelian belum ada di accumulator, tambahkan
		// 	if (!acc[no_pembelian]) {
		// 		acc[no_pembelian] = {
		// 			id_pembelian,
		// 			no_pembelian,
		// 			tanggal,
		// 			no_voucher,
		// 			keterangan,
		// 			supplier,
		// 			// user,
		// 			barang: [],
		// 		};
		// 	}

		// 	// Tambahkan barang ke array barang untuk no_pembelian yang sesuai
		// 	acc[no_pembelian].barang.push({
		// 		id_barang: barang.id_barang,
		// 		id_pembelian_item: barang.id_pembelian_item,
		// 		nodpb: barang.nodpb,
		// 		nama_barang: barang.barang,
		// 		merek: barang.merek,
		// 		jenis: barang.jenis,
		// 		kategori: barang.kategori,
		// 		harga_beli: barang.harga_beli,
		// 		qty: barang.qty,
		// 		// no_voucher: barang.no_voucher,
		// 		// keterangan: barang.keterangan,
		// 		// supplier: barang.supplier,
		// 		satuan: barang.satuan,
		// 	});

		// 	return acc;
		// }, {} as Record<string, Pembelian>);

		// // Ubah hasil grouping menjadi array
		// console.log(dataResult);
		// const result = Object.values(groupedData);

		return NextResponse.json(
			{
				success: true,
				data: dataResult,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{
				success: false,
				message: "Internal Server Error",
			},
			{ status: 500 }
		);
	}
}



export async function POST(request: NextRequest) {
	try {

		const { user } = await getCurrentSession();

		// Cek apakah user terautentikasi
		if (!user) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 403 }
			);
		}

		const formData = await request.formData();

		// Validasi data yang diperlukan
		const requiredFields = [
			"dpb_id",
			"no_pembelian",
			// "no_voucher",
			// "qty",
			// "harga_beli",
			"tanggal",
			"supplier_id",
			// "user_id",
			// "barang_id",
			// "barang",
			// "keterangan",
		];
		for (const field of requiredFields) {
			if (!formData.get(field)) {
				return NextResponse.json(
					{ success: false, message: `Field ${field} is required` },
					{ status: 400 }
				);
			}
		}

		// Ekstrak data dari formData
		const no_pembelian = formData.get("no_pembelian") as string
		// const no_voucher = formData.get("no_voucher") as string
		const supplier_id = Number(formData.get("supplier_id"))
		const keterangan = formData.get("keterangan") as string
		const tanggal = formData.get("tanggal") as string
		const dpb_id = formData.get("dpb_id") as string

		// Ambil seluruh nilai untuk barang
		const dpbId = formData.getAll("barang[][dpb_id]")
		const barangIds = formData.getAll("barang[][barang_id]")
		const hargaBelis = formData.getAll("barang[][harga_beli]")
		const allQty = formData.getAll("barang[][qty]")

		// console.log(tanggal)

		if (barangIds.length === 0 || hargaBelis.length === 0) {
			return NextResponse.json(
				{ success: false, message: "Barang field is required" },
				{ status: 400 }
			)
		}

		const barang: { barang_id: number; qty: number; harga_beli: number, dpb_id: number }[] = barangIds.map((id, index) => ({
			barang_id: Number(id),
			qty: Number(allQty[index]),
			harga_beli: Number(hargaBelis[index]),
			dpb_id: Number(dpbId[index])
		}))


		// Insert data ke tabel `pembelian`
		const [pembelianResult] = await db.execute<RowDataPacket[]>(
			`INSERT INTO pembelian 
					(no_pembelian, tanggal, keterangan, suplier_id, user_id) 
				VALUES (?, ? , ?, ?, ?, ?)`,
			[no_pembelian, tanggal, keterangan, supplier_id, user.id]
		);

		const pembelianId = (pembelianResult as any).insertId;

		// Cek apakah insert ke tabel `pembelian` berhasil
		if (!pembelianId) {
			return NextResponse.json(
				{ success: false, message: "Failed to create pembelian record" },
				{ status: 422 }
			);
		}

		for (const item of barang) {

			const [pembelianItemResult] = await db.execute<RowDataPacket[]>(
				`INSERT INTO pembelian_item 
						(tanggal, pembelian_id, barang_id, qty, harga_beli,dpb_id) 
					VALUES (?, ?, ?, ?, ?, ?)`,
				[tanggal, pembelianId, item.barang_id, item.qty, item.harga_beli, item.dpb_id]
			);


			const [dpbResult] = await db.execute<RowDataPacket[]>(
				`UPDATE dpb SET flagproses = 1 WHERE id = ?`,
				[item.dpb_id]
			);

			// Cek apakah insert ke tabel `pembelian_item` berhasil
			if ((pembelianItemResult as any).affectedRows === 0 || (dpbResult as any).affectedRows === 0) {
				return NextResponse.json(
					{ success: false, message: "Failed to create pembelian item record OR Failed to update DPB flag" },
					{ status: 422 }
				);
			}

		}

		// Update flag ke dpb


		const [dpbResult] = await db.execute<RowDataPacket[]>(
			`UPDATE dpb SET flagproses = 1 WHERE id = ?`,
			[dpb_id]
		);

		// // Cek apakah update flagproses berhasil
		// if ((dpbResult as any).affectedRows === 0) {
		// 	return NextResponse.json(
		// 		{ success: false, message: "Failed to update DPB flag" },
		// 		{ status: 422 }
		// 	);
		// }




		// Jika semua berhasil, kembalikan respons sukses
		return NextResponse.json(
			{ success: true, data: { pembelianId } },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error in POST /api/pembelian:", error);
		return NextResponse.json(
			{ success: false, message: "Internal Server Error" },
			{ status: 500 }
		);

	}

}
