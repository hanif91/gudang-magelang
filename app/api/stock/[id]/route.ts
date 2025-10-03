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

        const { barang_id, qty, tanggal_masuk, harga_masuk } = {
            barang_id: Number(formData.get("barang_id")),
            qty: Number(formData.get("qty")),
            tanggal_masuk: new Date(formData.get("tanggal_masuk") as string),
            harga_masuk: Number(formData.get("harga_masuk"))
        };

        const [dataCheck] = await db.query<RowDataPacket[]>('select * from stock where id=? order by nama asc', [id]);

        // console.log(nama);
        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 })
        }

        const [rows] = await db.execute<RowDataPacket[]>('UPDATE stock set barang_id=?,qty=?,tanggal_masuk=?,harga_masuk=? where id=?', [barang_id, qty, tanggal_masuk, harga_masuk, id]);

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
        const [dataCheck] = await db.query<RowDataPacket[]>('SELECT s.*,b.nama AS "nama_barang"  FROM stock s LEFT JOIN barang b ON s.barang_id = b.id where s.id=? order by s.id asc', [id]);

        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 })
        }

        const result = {
            id: dataCheck[0].id,
            barang_id: dataCheck[0].barang_id,
            nama_barang: dataCheck[0].nama_barang,
            qty: dataCheck[0].qty,
            tanggal_masuk: dataCheck[0].tanggal_masuk,
            harga_masuk: dataCheck[0].harga_masuk,
        }
        return NextResponse.json({
            success: true,
            data: result
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

        const [dataCheck] = await db.query<RowDataPacket[]>('SELECT * FROM stock WHERE id=?', [id]);

        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 });
        }

        await db.execute('DELETE FROM stock WHERE id=?', [id]);

        return NextResponse.json({
            success: true,
            message: "Data deleted successfully"
        }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}


