import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getCurrentSession();
    if (user === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorize",
        },
        { status: 403 }
      );
    }
    const param = await params;
    const id = param.id;

    const formData = await request.formData();

    const jenisBk = Number(formData.get("jenis"));
    const assetPipa = Number(formData.get("asset"));
    const bagminta = Number(formData.get("bagminta"));
    const keterangan = formData.get("keterangan");

    const [dataCheck] = await db.query<RowDataPacket[]>(
      `select * from barangkeluar where id=? order by id asc`,
      [id]
    );

    // console.log(nama);
    if (dataCheck.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "dataNotexist",
        },
        { status: 422 }
      );
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      "UPDATE barangkeluar set jenis_bk_id=?, asset_perpipaan_id=?, bagminta_id=?, keterangan=? where id=?",
      [jenisBk, assetPipa, bagminta, keterangan, id]
    );

    return NextResponse.json(
      {
        success: true,
        data: rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
