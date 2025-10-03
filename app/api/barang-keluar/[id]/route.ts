import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import moment from "moment";
import { RowDataPacket,ProcedureCallPacket } from "mysql2";
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

    const tanggal = new Date(formData.get("tanggal") as string);

    const id_kodekeper = Number(formData.get("id_kodekeper"));

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
      "UPDATE barangkeluar set kodekeper_id=? where id=?",
      [id_kodekeper, id]
    );

    return NextResponse.json(
      {
        success: true,
        parameter: {
          start: moment(tanggal).format("YYYY-MM-DD"),
          end: moment(tanggal).format("YYYY-MM-DD"),
        },
        data: rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}

export async function GET(
  request: Request,
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
    const [dataCheck] = await db.query<RowDataPacket[]>(
      `SELECT * FROM barangkeluar b WHERE b.id = ?`,
      [id]
    );
    // console.log(dataCheck)
    if (dataCheck.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "dataNotexist",
        },
        { status: 422 }
      );
    }

    // const result = {
    //     id: dataCheck[0].id,
    //     nama: dataCheck[0].nama,
    //     tanggal_pembelian: dataCheck[0].tanggal_pembelian,
    //     no_pembelian: dataCheck[0].no_pembelian,
    //     keterangan: dataCheck[0].keterangan,
    //     no_voucher: dataCheck[0].no_voucher,
    //     nodpb: dataCheck[0].nodpb,
    //     nama_barang: dataCheck[0].nama_barang,
    //     qty_pembelian: dataCheck[0].qty_pembelian,
    //     nama_supplier: dataCheck[0].nama_supplier,
    //     nama_user: dataCheck[0].nama_user,
    //     created_at: dataCheck[0].created_at,
    //     updated_at: dataCheck[0].updated_at,

    // }
    return NextResponse.json(
      {
        success: true,
        data: dataCheck[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getCurrentSession();
    if (user === null) {
      return NextResponse.json(
        { success: false, message: "Unauthorize" },
        { status: 403 }
      );
    }

    const param = await params;
    const id = param.id;

    const [dataCheck] = await db.query<RowDataPacket[]>(
      `SELECT 
         b.id AS barangkeluar_id, 
         bi.id AS barangkeluar_item_id 
       FROM barangkeluar b 
       LEFT JOIN barangkeluar_item bi 
         ON b.id = bi.barangkeluar_id 
       WHERE b.id = ?`,
      [id]
    );

    if (dataCheck.length === 0 || !dataCheck[0].barangkeluar_id) {
      return NextResponse.json(
        { success: false, message: "dataNotexist" },
        { status: 422 }
      );
    }

    // // Dapatkan semua ID item yang akan dihapus (jika diperlukan)
    // const itemIds = dataCheck
    //   .filter(item => item.barangkeluar_item_id !== null)
    //   .map(item => item.barangkeluar_item_id);

    // // Jika perlu log atau validasi itemIds, bisa lakukan di sini
    // console.log("barangkeluar_item_id yang akan dihapus:", itemIds);
    const qDel = await db.query<ProcedureCallPacket<RowDataPacket[]>>(`CALL delete_bk_by_id_bk(?);`, [id]);
    
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


    return NextResponse.json(
      { success: true, message: "Data deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error },
      { status: 500 }
    );
  }
}
