import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import moment from "moment";
// import { useSearchParams } from 'next/navigation'

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
interface BarangKeluarItems {
	id_barang_keluar: number;
	id_barang: number;
	nama_barang: string;
	qty: number;
	qty_minta: number;
	id_dpbk: number;
	harga: number;
	total : number;
	nodpb: string;
	nodpbk: string;
	stock: number;
	satuan: string;
}

interface BarangKeluar {
	id: number,
	nobpp: string,
	tanggal: string,
	keterangan: string,
	id_jenis_bk: number,
	total: number,
	nama_jenis_bk: string,
	kodekeper: number,
	nama_kodekeper: string,
	id_kodekeper: number,
	id_asset_perpipaan: number,
	nama_asset_perpipaan: string,
	id_bagminta: number,
	nama_bagminta: string,
	namattd_bagminta: string,
	barang_keluar_items: BarangKeluarItems[];
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
		const	[rows] = await db.query<RowDataPacket[]>(`
				SELECT 
					f.id,
					bk.nobpp,
					bk.tanggal,
					bk.keterangan,
					f.harga_masuk*f.qty AS total,
					f.harga_masuk AS harga,
					j.id AS id_jenis_bk,
					j.nama AS nama_jenis_bk,
					k.id AS id_kodekeper,
					k.kode AS kodekeper,
					k.nama AS nama_kodekeper,
					bm.namattd AS namattd_bagminta,
					a.id AS id_asset_perpipaan,
					a.nama AS nama_asset_perpipaan,
					b.id AS id_bagminta,
					bm.nama AS nama_bagminta,
					bi.id AS id_barang_keluar,
					b.id AS id_barang,
					b.nama AS nama_barang,
					f.qty,
					b.satuan,
					IF((ROW_NUMBER() OVER(PARTITION BY bk.nobpp,b.nama ORDER BY bk.nobpp DESC, b.nama ))>1,0,bi.qty) AS qty_minta,
					d.id AS id_dpbk,
					d.nodpbk,
					s.qty AS stock
				FROM barangkeluar bk
				LEFT JOIN web_admin_user u ON bk.user_id = u.id
				LEFT JOIN jenis_bk j ON bk.jenis_bk_id = j.id
				LEFT JOIN kodekeper k ON bk.kodekeper_id = k.id
				LEFT JOIN asset_perpipaan a ON bk.asset_perpipaan_id = a.id
				LEFT JOIN bagminta bm ON bk.bagminta_id = bm.id
				LEFT JOIN barangkeluar_item bi ON bi.barangkeluar_id = bk.id
				LEFT JOIN fifo_log f ON f.barangkeluar_item_id = bi.id
				LEFT JOIN barang b ON bi.barang_id = b.id
				LEFT JOIN (SELECT SUM(qty) AS qty,barang_id FROM stock GROUP BY barang_id) s ON s.barang_id = b.id
				LEFT JOIN dpbk d ON bi.dpbk_id = d.id
				WHERE DATE_FORMAT(bk.tanggal, '%Y%m') >= ? AND DATE_FORMAT(bk.tanggal, '%Y%m') <= ?
				ORDER BY bk.nobpp DESC, b.nama ASC
				`, [strStart, strEnd]
			);


		const [totalRows] = await db.query<RowDataPacket[]>(`
		SELECT 
		bk.id,
		bk.nobpp,
		bk.tanggal,
		bk.keterangan,
		j.id AS id_jenis_bk,
		j.nama AS nama_jenis_bk,
		k.id AS id_kodekeper,
		k.kode AS kodekeper,
		k.nama AS nama_kodekeper,
		bm.namattd AS namattd_bagminta,
		a.id AS id_asset_perpipaan,
		a.nama AS nama_asset_perpipaan,
		bm.id AS id_bagminta,
		bm.nama AS nama_bagminta,
		pm.total AS total
		
		FROM barangkeluar bk
		LEFT JOIN web_admin_user u ON bk.user_id = u.id
		LEFT JOIN jenis_bk j ON bk.jenis_bk_id = j.id
		LEFT JOIN kodekeper k ON bk.kodekeper_id = k.id
		LEFT JOIN asset_perpipaan a ON bk.asset_perpipaan_id = a.id
		LEFT JOIN bagminta bm ON bk.bagminta_id = bm.id
		left join (select sum(f.harga_masuk * f.qty) as total,barangkeluar_id from barangkeluar_item bi left join fifo_log f ON f.barangkeluar_item_id = bi.id group by barangkeluar_id) pm 
		on bk.id=pm.barangkeluar_id
		WHERE DATE_FORMAT(bk.tanggal, '%Y%m') >= ? AND DATE_FORMAT(bk.tanggal, '%Y%m') <= ?
		ORDER BY bk.created_at DESC
	`, [strStart, strEnd]);

	console.log(totalRows);
		
	const dataResult = totalRows.map((row) => {
			const { id, nobpp, tanggal, keterangan, id_jenis_bk, nama_jenis_bk, id_kodekeper, kodekeper, nama_kodekeper, namattd_bagminta, id_asset_perpipaan, nama_asset_perpipaan, id_bagminta, nama_bagminta, total } = row;
			return {
				id,
				nobpp,
				tanggal,
				keterangan,
				id_jenis_bk,
				nama_jenis_bk,
				id_kodekeper,
				kodekeper,
				nama_kodekeper,
				namattd_bagminta,
				id_asset_perpipaan,
				nama_asset_perpipaan,
				id_bagminta,
				nama_bagminta,
				total: Number(total) || 0, // Pastikan total adalah angka
				barang_keluar_items: rows.filter((item: any) => item.nobpp === nobpp).map((item: any) => ({
						id_fifo: item.id,
						id_barang: item.id_barang,
						id_barang_keluar: item.id_barang_keluar,
						id_dpbk: item.id_dpbk,
						nama_barang: item.nama_barang,
						nodpb : item.nodpb,
						nodpbk: item.nodpbk,
						qty_minta: Number(item.qty_minta) || 0, // Pastikan qty_minta adalah angka
						qty: Number(item.qty) || 0, // Pastikan qty adalah angka
						stock: Number(item.stock) || 0, // Pastikan stock adalah angka
						harga: Number(item.harga) || 0, // Pastikan harga adalah angka
						total: Number(item.total) || 0, // Pastikan total adalah angka
						satuan: item.satuan,
					})),
			};
		});
		console.log(dataResult)
		// // Group data by no_pembelian
		// const groupedData = rows[0].reduce((acc, row) => {
		// 	const { id, id_kodekeper, namattd_bagminta, nobpp, tanggal, keterangan, id_jenis_bk, total, nama_jenis_bk, kodekeper, nama_kodekeper, id_asset_perpipaan, nama_asset_perpipaan, id_bagminta, nama_bagminta, ...barang_keluar_items } = row;

		// 	// Jika nobpp belum ada di accumulator, tambahkan
		// 	if (!acc[nobpp]) {
		// 		acc[nobpp] = {
		// 			id,
		// 			nobpp,
		// 			tanggal,
		// 			keterangan,
		// 			id_jenis_bk,
		// 			nama_jenis_bk,
		// 			id_kodekeper,
		// 			total: 0,
		// 			kodekeper,
		// 			nama_kodekeper,
		// 			id_asset_perpipaan,
		// 			namattd_bagminta,
		// 			nama_asset_perpipaan,
		// 			id_bagminta,
		// 			nama_bagminta,
		// 			// user,
		// 			barang_keluar_items: [],
		// 		};
		// 	}

		// 	// Tambahkan barang ke array barang untuk no_pembelian yang sesuai
		// 	acc[nobpp].barang_keluar_items.push({
		// 		id_barang: barang_keluar_items.id_barang,
		// 		id_barang_keluar: barang_keluar_items.id_barang_keluar,
		// 		id_dpbk: barang_keluar_items.id_dpbk,
		// 		nama_barang: barang_keluar_items.nama_barang,
		// 		nodpbk: barang_keluar_items.nodpbk,
		// 		qty_minta: barang_keluar_items.qty_minta,
		// 		qty: barang_keluar_items.qty,
		// 		stock: barang_keluar_items.stock,
		// 		harga: barang_keluar_items.harga,
		// 		satuan: barang_keluar_items.satuan,
		// 	});

		// 	return acc;
		// }, {} as Record<string, BarangKeluar>);

		// totalRows.forEach((totalRow) => {
		// 	if (groupedData[totalRow.nobpp]) {
		// 		groupedData[totalRow.nobpp].total = totalRow.total || 0;
		// 	}
		// });

		// Ubah hasil grouping menjadi array
		// const result = Object.values(groupedData);

		return NextResponse.json(
			{
				success: true,

				data: dataResult.length > 0 ? dataResult : [],
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
			"tanggal",
			"jenis_bk_id",
			// "kodekeper_id",
			"asset_perpipaan_id",
			"bagminta_id",
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
		const jenis_bk_id = formData.get("jenis_bk_id") as string
		const keterangan = formData.get("keterangan") as string
		const bagminta_id = formData.get("bagminta_id") as string
		// const kodekeper_id = Number(formData.get("kodekeper_id"))
		const asset_perpipaan_id = formData.get("asset_perpipaan_id") as string
		const tanggal = formData.get("tanggal") as string


		// Ambil seluruh nilai untuk barang
		const dpbkId = formData.getAll("barang[][dpbk_id]")
		const barangIds = formData.getAll("barang[][barang_id]")
		const allQty = formData.getAll("barang[][qty]")

		// console.log(tanggal)

		if (barangIds.length === 0) {
			return NextResponse.json(
				{ success: false, message: "Barang field is required" },
				{ status: 400 }
			)
		}

		const barang: { barang_id: number; qty: number; dpbk_id: number }[] = barangIds.map((id, index) => ({
			barang_id: Number(id),
			qty: Number(allQty[index]),
			dpbk_id: Number(dpbkId[index])
		}))

		const [bppRows] = await db.execute<RowDataPacket[]>(
			"SELECT noautobpp(?) as nobpp",
			[tanggal]
		);
		const nobpp = bppRows[0]?.nobpp;
		if (!nobpp) {
			return NextResponse.json(
				{ success: false, message: "Gagal mendapatkan nomor BPP" },
				{ status: 422 }
			);
		}



		// Insert data ke tabel `pembelian`
		const [barangKeluarResult] = await db.execute<RowDataPacket[]>(
			`INSERT INTO barangkeluar 
					(nobpp, tanggal, keterangan, user_id, jenis_bk_id, asset_perpipaan_id, bagminta_id) 
				VALUES (?, ? , ?, ?, ?, ?, ?)`,
			[nobpp, tanggal, keterangan, user.id, jenis_bk_id, asset_perpipaan_id, bagminta_id]
		);

		const barangKeluarId = (barangKeluarResult as any).insertId;

		// Cek apakah insert ke tabel `barangKeluar` berhasil
		if (!barangKeluarId) {
			return NextResponse.json(
				{ success: false, message: "Failed to create Barang Keluar record" },
				{ status: 422 }
			);
		}

		for (const item of barang) {

			const [barangKeluarItemResult] = await db.execute<RowDataPacket[]>(
				`INSERT INTO barangkeluar_item 
						(tanggal, barangKeluar_id, barang_id, qty,dpbk_id) 
					VALUES (?, ?, ?, ?, ?)`,
				[tanggal, barangKeluarId, item.barang_id, item.qty, item.dpbk_id]
			);

			const [dpbkResult] = await db.execute<RowDataPacket[]>(
				`UPDATE dpbk SET flagproses = 1 WHERE id = ?`,
				[item.dpbk_id]
			);

			// Cek apakah insert ke tabel `barangKeluar_item` berhasil
			if ((barangKeluarItemResult as any).affectedRows === 0 || (dpbkResult as any).affectedRows === 0) {
				return NextResponse.json(
					{ success: false, message: "Failed to create Barang Keluar item record OR Failed to update DPB flag" },
					{ status: 422 }
				);
			}

		}

		// Update flag ke dpb


		// const [dpbkResult] = await db.execute<RowDataPacket[]>(
		// 	`UPDATE dpbk SET flagproses = 1 WHERE id = ?`,
		// 	[dpbkId]
		// );

		// // Cek apakah update flagproses berhasil
		// if ((dpbResult as any).affectedRows === 0) {
		// 	return NextResponse.json(
		// 		{ success: false, message: "Failed to update DPB flag" },
		// 		{ status: 422 }
		// 	);
		// }




		// Jika semua berhasil, kembalikan respons sukses
		return NextResponse.json(
			{ success: true,
				parameter: {
					start :				moment(tanggal).format("YYYY-MM-DD"),
					end :				moment(tanggal).format("YYYY-MM-DD"),
				},
				data: { barangKeluarId } },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error in POST /api/barang-keluar:", error);
		return NextResponse.json(
			{ success: false, message: "Internal Server Error" },
			{ status: 500 }
		);

	}

}
