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
        const { nama, aktif } = {
            nama: formData.get("nama") as string,
            aktif: Number(formData.get("aktif"))
        };


        const [dataCheck] = await db.query<RowDataPacket[]>('SELECT * FROM asset_wilayah WHERE id=? ORDER BY nama ASC', [id]);

        // console.log(nama);
        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 })
        }

        const [rows] = await db.execute<RowDataPacket[]>('UPDATE asset_wilayah set nama=?,aktif=? where id=?', [nama, aktif, id]);

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
        const [dataCheck] = await db.query<RowDataPacket[]>('SELECT * FROM asset_wilayah WHERE id=? ORDER BY nama ASC', [id]);

        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 })
        }

        // const result = {
        //     id: dataCheck[0].id,
        //     kategori_id: dataCheck[0].kategori_id,
        //     nama: dataCheck[0].nama,
        //     aktif: dataCheck[0].aktif.toString(),
        // }
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

        const [dataCheck] = await db.query<RowDataPacket[]>('SELECT * FROM asset_wilayah  WHERE id=?', [id]);

        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 });
        }

        await db.execute('DELETE FROM asset_wilayah WHERE id=?', [id]);

        return NextResponse.json({
            success: true,
            message: "Data deleted successfully"
        }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}


