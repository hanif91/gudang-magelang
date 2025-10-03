import db from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { user } = await getCurrentSession();
        if (user === null) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 403 }
            );
        }

        const url = new URL(request.url);
        const searchParams = url.searchParams;
        const id_barang = searchParams.get('id');
        const firstDay = searchParams.get('firstDay');
        const fromTanggal = searchParams.get('fromTanggal');
        const toTanggal = searchParams.get('toTanggal');

        if (!id_barang || !fromTanggal || !toTanggal || !firstDay) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required parameters",
                },
                { status: 400 }
            );
        }

        const rows = await db.query<RowDataPacket[]>(`
           SELECT t1.id,t1.nama,t1.tgl,t1.ref,t1.qtyawal,t1.qtymasuk,t1.qtykeluar,@saldo:=@saldo+t1.qtyawal+t1.qtymasuk-t1.qtykeluar AS qtyakhir FROM
            (
            SELECT a.nama,a.id,STR_TO_DATE(?,"%Y-%m-%d") AS tgl,"SALDO AWAL" AS ref,IFNULL(b.qty,0)-IFNULL(c.qty,0) AS qtyawal,0 AS qtymasuk,0 AS qtykeluar FROM masterbarang a 
            LEFT JOIN (
            SELECT SUM(qty) AS qty,barang_id FROM pembelian_item WHERE DATE_FORMAT(tanggal,"%Y%m")<? GROUP BY barang_id
            ) b ON a.id=b.barang_id
            LEFT JOIN (
            SELECT SUM(a.qty) AS qty,b.barang_id  FROM fifo_log a 
            LEFT JOIN barangkeluar_item b ON a.barangkeluar_item_id=b.id
            WHERE DATE_FORMAT(b.tanggal,"%Y%m")<? GROUP BY barang_id 
            ) c ON a.id=c.barang_id WHERE a.id=?
            UNION ALL
            SELECT "" AS nama,a.barang_id,a.tanggal,b.no_pembelian,0,a.qty,0 FROM pembelian_item a LEFT JOIN pembelian b ON a.pembelian_id=b.id WHERE DATE_FORMAT(a.tanggal,"%Y%m") BETWEEN ? AND ? AND a.barang_id=?
            UNION ALL
            SELECT "" AS nama,a.barang_id,a.tanggal,b.nobpp,0,0,a.qty FROM barangkeluar_item a LEFT JOIN barangkeluar b ON a.barangkeluar_id=b.id WHERE DATE_FORMAT(a.tanggal,"%Y%m") BETWEEN ? AND ? AND a.barang_id=?
            ORDER BY tgl
            ) t1
            JOIN (SELECT @saldo:=0) t3

        `, [firstDay,fromTanggal,fromTanggal,id_barang,fromTanggal,toTanggal,id_barang,fromTanggal,toTanggal,id_barang
            
        ]);
        // console.log(rows)

        if (rows[0].length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No data found",
                },
                { status: 404 }
            );
        }

        const formattedData = {
            nama: rows[0][0].nama,
            data: rows[0].map(row => ({
                id: row.id,
                tgl: row.tgl,
                ref: row.ref,
                qtyawal: row.qtyawal,
                qtymasuk: row.qtymasuk,
                qtykeluar: row.qtykeluar,
                qtyakhir: row.qtyakhir
            }))
        };

        return NextResponse.json(
            {
                success: true,
                data: formattedData,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            { status: 500 }
        );
    }
}