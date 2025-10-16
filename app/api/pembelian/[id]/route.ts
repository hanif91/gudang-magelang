import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import moment from "moment";
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

        const { no_pembelian, tanggal, keterangan, dpb_id, supplier_id, user_id } = {
            no_pembelian: formData.get("no_pembelian") as string,
            tanggal: new Date(formData.get("tanggal") as string),
            keterangan: formData.get("keterangan") as string,
            dpb_id: Number(formData.get("dpb_id")),
            supplier_id: Number(formData.get("supplier_id")),
            user_id: Number(formData.get("user_id"))
        };


        const [dataCheck] = await db.query<RowDataPacket[]>('select * from pembelian where id=? order by nama asc', [id]);

        // console.log(nama);
        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 })
        }

        const [rows] = await db.execute<RowDataPacket[]>('UPDATE pembelian set no_pembelian=?,tanggal=?,keterangan=?,dpb_id=?,supplier_id=?,user_id=? where id=?', [no_pembelian, tanggal, keterangan, dpb_id, supplier_id, user_id, id]);

        return NextResponse.json({
            success: true,
            parameter: {
                start: moment(tanggal).format("YYYY-MM-DD"),
                end: moment(tanggal).format("YYYY-MM-DD"),
            },
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
        const [dataCheck] = await db.query<RowDataPacket[]>('select * from pembelian where id=? order by nama asc', [id]);

        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 })
        }

        const result = {
            id: dataCheck[0].id,
            no_pembelian: dataCheck[0].no_pembelian,
            tanggal: dataCheck[0].tanggal,
            keterangan: dataCheck[0].keterangan,
            no_voucher: dataCheck[0].no_voucher,
            dpb_id: dataCheck[0].dpb_id,
            supplier_id: dataCheck[0].supplier_id,
            user_id: dataCheck[0].user_id,
            created_at: dataCheck[0].created_at,
            updated_at: dataCheck[0].updated_at
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

        const [dataCheck] = await db.query<RowDataPacket[]>('SELECT * FROM pembelian WHERE id=?', [id]);

        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 });
        }

        await db.execute('DELETE FROM pembelian WHERE id=?', [id]);

        return NextResponse.json({
            success: true,
            message: "Data deleted successfully"
        }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}


