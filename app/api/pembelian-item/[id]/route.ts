import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket,ProcedureCallPacket } from "mysql2";
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

        const { pembelian_id, barang_id, qty, harga_beli } = {
            pembelian_id: Number(formData.get("pembelian_id")),
            barang_id: Number(formData.get("barang_id")),
            qty: Number(formData.get("qty")),
            harga_beli: Number(formData.get("harga_beli")),
        };

        const [dataCheck] = await db.query<RowDataPacket[]>(`select * from pembelian_item where id=? order by id asc`, [id]);

        // console.log(nama);
        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 })
        }

        const [rows] = await db.execute<RowDataPacket[]>('UPDATE pembelian_item set pembelian_id=?,barang_id=?,qty=?,harga_beli=? where id=?', [pembelian_id, barang_id, qty, harga_beli, id]);

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
        const [dataCheck] = await db.query<RowDataPacket[]>(`
            SELECT 
			  	pm.id,
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
				b.satuan,
				p.keterangan,
				s.nama AS supplier,
				u.nama AS user
			FROM pembelian_item pm	
			JOIN pembelian p ON pm.pembelian_id = p.id
			JOIN barang b ON pm.barang_id = b.id
			JOIN dpb d ON p.dpb_id = d.id
			JOIN suplier s ON p.suplier_id = s.id
			JOIN web_admin_user u ON p.user_id = u.id
			JOIN jenis j ON b.jenis_id = j.id
			JOIN merek m ON b.merek_id = m.id
			JOIN kategori k ON j.kategori_id = k.id
            WHERE pm.id = ?
		    ORDER BY pm.tanggal DESC
            `, [id]);
        // console.log(dataCheck)
        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 })
        }

        const result = {
            id: dataCheck[0].id,
            nama: dataCheck[0].nama,
            tanggal_pembelian: dataCheck[0].tanggal_pembelian,
            no_pembelian: dataCheck[0].no_pembelian,
            keterangan: dataCheck[0].keterangan,
            no_voucher: dataCheck[0].no_voucher,
            nodpb: dataCheck[0].nodpb,
            nama_barang: dataCheck[0].nama_barang,
            qty_pembelian: dataCheck[0].qty_pembelian,
            nama_supplier: dataCheck[0].nama_supplier,
            nama_user: dataCheck[0].nama_user,
            created_at: dataCheck[0].created_at,
            updated_at: dataCheck[0].updated_at,

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

        const [dataCheck] = await db.query<RowDataPacket[]>('SELECT * FROM pembelian WHERE id=?', [id]);

        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 });
        }

        const [dataCheck2] = await db.query<RowDataPacket[]>(`
        SELECT 
            CASE 
                WHEN COUNT(*) = SUM(CASE WHEN pm.qty = s.qty THEN 1 ELSE 0 END) THEN 'true'
                ELSE 'false'
            END AS status
        FROM 
            pembelian_item pm
        left JOIN 
            stock s ON pm.id = s.pembelian_item_id
        WHERE 
            pm.pembelian_id =  ?
            `, [id]);

     
        if (dataCheck2[0].status == 'false') {
            return NextResponse.json({
                success: false,
                message: "Tidak bisa di hapus, barang sudah dilakukan pengambilan"
            }, { status: 422 });
        }


        const qDel = await db.query<ProcedureCallPacket<RowDataPacket[]>>(`CALL delete_pembelian(?);`, [id]);
        
        if (qDel[0][0][0].rescode === 200) { 
            return NextResponse.json({
            success: true,
            message: "Data deleted successfully"
        }, { status: 200 });
        } else {
            return NextResponse.json({
                success: false,
                message: qDel[0][0][0].message
            }, { status: 500 });
        }

        
    } catch (error) {
        console.log(error);
        await db.query('ROLLBACK;');
        
        return NextResponse.json({
            success: false,
            message: error,
        }, { status: 500 });
    }
}


