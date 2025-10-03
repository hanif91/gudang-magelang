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

        const { tanggal, nama, alamat, nilai, lokasi_id, aktif } = {
            nama: formData.get("nama") as string,
            aktif: Number(formData.get("aktif")),
            alamat: formData.get("alamat") as string,
            tanggal: formData.get("tanggal") as string,
            nilai: Number(formData.get("nilai")),
            lokasi_id: Number(formData.get("lokasi_id")),
        };


        const [dataCheck] = await db.query<RowDataPacket[]>('SELECT * FROM asset_perpipaan WHERE id=? ORDER BY nama ASC', [id]);

        // console.log(nama);
        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 })
        }

        const [rows] = await db.execute<RowDataPacket[]>('UPDATE asset_perpipaan set tanggal=?,nama=?,alamat=?,nilai=?,lokasi_id=?,aktif=? where id=?', [tanggal, nama, alamat, nilai, lokasi_id, aktif, id]);

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
        const [dataCheck] = await db.query<RowDataPacket[]>('SELECT * FROM asset_perpipaan WHERE id=? ORDER BY nama ASC', [id]);

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

        const [dataCheck] = await db.query<RowDataPacket[]>('SELECT * FROM asset_perpipaan  WHERE id=?', [id]);

        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 });
        }

        await db.execute('DELETE FROM asset_perpipaan WHERE id=?', [id]);

        return NextResponse.json({
            success: true,
            message: "Data deleted successfully"
        }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}


