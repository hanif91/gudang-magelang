import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { user } = await getCurrentSession();
        if (user === null) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorize'
            }, { status: 403 })
        }
        const [data] = await db.query<RowDataPacket[]>('SELECT id,kode,nama,IF(aktif = 1,"Aktif","Tidak Aktif") AS status FROM kategori ORDER BY nama ASC', []);

        // // await db.end();
        // console.log(data);
        return NextResponse.json({
            success: true,
            data: data
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json(error)
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

        const { kode, nama, aktif } = {
            kode: formData.get("kode") as string,
            nama: formData.get("nama") as string,
            aktif: Number(formData.get("aktif"))
        };


        const [rows] = await db.execute<RowDataPacket[]>('Insert into kategori (kode,nama,aktif) values (?,?,?)', [kode,nama, aktif]);

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
            data: result
        }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error)
    }




}
