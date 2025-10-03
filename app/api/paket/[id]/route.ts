import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";


type Barang = {
    barang_id: string;
    paket_id: string;
    nama: string;
    qty: number;
};

// Define tipe data untuk DPB
type Paket = {
    id: string,
    nama: string;
    barang: Barang[];
};

export async function PUT(request: NextRequest) {
    try {
        const { user } = await getCurrentSession();
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 403 });
        }

        const formData = await request.formData();
        const nama = formData.get("nama") as string;

        if (!nama) {
            return NextResponse.json({
                success: false,
                message: 'Nama is required'
            }, { status: 400 });
        }
        console.log(nama)


        await db.execute('DELETE FROM paket WHERE nama = ?', [nama]);

        const items: Array<{ barang_id: number; qty: number }> = [];
        let currentItem: { barang_id?: number; qty?: number } = {};

        for (const [key, value] of formData.entries()) {
            if (key.includes("barang_id")) {
                currentItem.barang_id = Number(value);
            } else if (key.includes("qty")) {
                currentItem.qty = Number(value);
            }

            if (currentItem.barang_id !== undefined && currentItem.qty !== undefined) {
                items.push({ barang_id: currentItem.barang_id, qty: currentItem.qty });
                currentItem = {};
            }
        }

        if (items.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No items provided'
            }, { status: 400 });
        }

        const insertValues: any[] = [];
        items.forEach((item) => {
            insertValues.push([nama, item.barang_id, item.qty]);
        });

        const placeholders = insertValues.map(() => "(?,?,?)").join(", ");
        const sql = `INSERT INTO paket (nama, barang_id, qty) VALUES ${placeholders}`;
        const flattenedValues = insertValues.flat();

        const [rows] = await db.execute(sql, flattenedValues);
        const result: any = rows;

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: "No Record Affected" },
                { status: 422 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result
        }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        }, { status: 500 });
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
        console.log(id)
        const [data] = await db.query<RowDataPacket[]>('SELECT p.*, b.nama as barang, b.id as id_barang FROM paket p LEFT JOIN barang b ON p.barang_id = b.id WHERE p.id = ? ORDER BY p.id ASC', [id]);

        const groupedData = data.reduce((acc, row) => {
            const { id, nama, ...barang } = row;

            // Jika nodpb belum ada di accumulator, tambahkan
            if (!acc[nama]) {
                acc[nama] = {
                    id,
                    nama,
                    barang: [],
                };
            }

            // Tambahkan barang ke array barang untuk nodpb yang sesuai
            acc[nama].barang.push({
                barang_id: barang.id_barang.toString(),
                paket_id: id,
                nama: barang.barang,
                qty: barang.qty
            });

            return acc;
        }, {} as Record<string, Paket>);

        const result = Object.values(groupedData);


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

        const [dataCheck] = await db.query<RowDataPacket[]>('SELECT * FROM paket WHERE id=?', [id]);

        if (dataCheck.length === 0) {
            return NextResponse.json({
                success: false,
                message: "dataNotexist"
            }, { status: 422 });
        }

        await db.execute('DELETE FROM paket WHERE id=?', [id]);

        return NextResponse.json({
            success: true,
            message: "Data deleted successfully"
        }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}


