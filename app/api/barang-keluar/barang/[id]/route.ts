import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket,ProcedureCallPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

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
    // console.log(id)

    const [dataCheck] = await db.query<RowDataPacket[]>(
      `SELECT id FROM fifo_log WHERE id = ?`,
      [id]
    );
    // console.log(dataCheck)

    if (dataCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: "dataNotexist" },
        { status: 422 }
      );
    }
    const qDel = await db.query<ProcedureCallPacket<RowDataPacket[]>>(`CALL delete_bk_by_id_fifo(?);`, [id]);
    
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
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error },
      { status: 500 }
    );
  }
}
