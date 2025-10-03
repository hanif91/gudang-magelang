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
        const month = searchParams.get('month');

        if (!month) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required parameters",
                },
                { status: 400 }
            );
        }

        const laporan = await db.query<RowDataPacket[]>(`
           SELECT 
            b.nama,b.satuan,b.jenis,b.kategori,s1.*,s1.qtyawal*harga AS saldoawal,s1.qtymasuk*s1.harga AS saldomasuk,s1.qtykeluar*s1.harga AS saldokeluar,
            s1.qtyawal+s1.qtymasuk-s1.qtykeluar AS qtyakhir,
            (s1.qtyawal+s1.qtymasuk-s1.qtykeluar)*harga AS saldoakhir

            FROM (
            SELECT a.id,a.barang_id,a.harga_masuk AS harga,IFNULL(b.qty,0)-IFNULL(c.qty,0) AS qtyawal,IFNULL(b1.qty,0) AS qtymasuk,IFNULL(c1.qty,0) AS qtykeluar,a.tanggal_masuk FROM stock a 
            LEFT JOIN (
            SELECT qty,id FROM pembelian_item WHERE DATE_FORMAT(tanggal,"%Y%m")<?
            ) b ON a.pembelian_item_id=b.id
            LEFT JOIN (
            SELECT qty,id FROM pembelian_item WHERE DATE_FORMAT(tanggal,"%Y%m")=?
            ) b1 ON a.pembelian_item_id=b1.id
            LEFT JOIN (
            SELECT SUM(a.qty) AS qty,a.stock_id  FROM fifo_log a 
            LEFT JOIN barangkeluar_item b ON a.barangkeluar_item_id=b.id
            WHERE DATE_FORMAT(b.tanggal,"%Y%m")<? GROUP BY stock_id
            ) c ON a.id=c.stock_id
            LEFT JOIN (
            SELECT SUM(a.qty) AS qty,a.stock_id  FROM fifo_log a 
            LEFT JOIN barangkeluar_item b ON a.barangkeluar_item_id=b.id
            WHERE DATE_FORMAT(b.tanggal,"%Y%m")=? GROUP BY stock_id
            ) c1 ON a.id=c1.stock_id
            ) s1 
            LEFT JOIN masterbarang b ON s1.barang_id=b.id WHERE (s1.qtyawal+s1.qtymasuk+s1.qtykeluar)<>0 
            ORDER BY nama,barang_id,tanggal_masuk


        `, [month, month, month, month]);

        const rekapitulasi = await db.query<RowDataPacket[]>(`
            SELECT 
            b.kategori,SUM(s1.qtyawal*harga) AS saldoawal,SUM( s1.qtymasuk*s1.harga) AS saldomasuk, SUM(s1.qtykeluar*s1.harga) AS saldokeluar,
            SUM((s1.qtyawal+s1.qtymasuk-s1.qtykeluar)*harga) AS saldoakhir
            FROM (
            SELECT a.id,a.barang_id,a.harga_masuk AS harga,IFNULL(b.qty,0)-IFNULL(c.qty,0) AS qtyawal,IFNULL(b1.qty,0) AS qtymasuk,IFNULL(c1.qty,0) AS qtykeluar,a.tanggal_masuk FROM stock a 
            LEFT JOIN (
            SELECT qty,id FROM pembelian_item WHERE DATE_FORMAT(tanggal,"%Y%m")<?
            ) b ON a.pembelian_item_id=b.id
            LEFT JOIN (
            SELECT qty,id FROM pembelian_item WHERE DATE_FORMAT(tanggal,"%Y%m")=?
            ) b1 ON a.pembelian_item_id=b1.id
            LEFT JOIN (
            SELECT SUM(a.qty) AS qty,a.stock_id  FROM fifo_log a 
            LEFT JOIN barangkeluar_item b ON a.barangkeluar_item_id=b.id
            WHERE DATE_FORMAT(b.tanggal,"%Y%m")<? GROUP BY stock_id
            ) c ON a.id=c.stock_id
            LEFT JOIN (
            SELECT SUM(a.qty) AS qty,a.stock_id  FROM fifo_log a 
            LEFT JOIN barangkeluar_item b ON a.barangkeluar_item_id=b.id
            WHERE DATE_FORMAT(b.tanggal,"%Y%m")=? GROUP BY stock_id
            ) c1 ON a.id=c1.stock_id
            ) s1 
            LEFT JOIN masterbarang b ON s1.barang_id=b.id WHERE (s1.qtyawal+s1.qtymasuk+s1.qtykeluar)<>0 
            GROUP BY b.kategori
            ORDER BY nama,barang_id,tanggal_masuk

         `, [month, month, month, month]);

        console.log(laporan[0])
        // console.log(rows)

        if (laporan[0].length === 0 || rekapitulasi[0].length === 0) {
            return NextResponse.json(
                {
                    success: true,
                    message: "No data found",
                },
                { status: 200 }
            );
        }

        const groupedData = laporan[0].reduce((acc: any, row) => {
            const { kategori, ...detail } = row;

            if (!acc[kategori]) {
                acc[kategori] = {
                    kategori, // Simpan kategori di sini
                    detail: []
                };
            }

            acc[kategori].detail.push({
                nama: detail.nama,
                satuan: detail.satuan,
                jenis: detail.jenis,
                id: detail.id,
                barang_id: detail.barang_id,
                harga: detail.harga,
                qtyawal: detail.qtyawal,
                qtymasuk: detail.qtymasuk,
                qtykeluar: detail.qtykeluar,
                tanggal_masuk: detail.tanggal_masuk,
                saldoawal: detail.saldoawal,
                saldomasuk: detail.saldomasuk,
                saldokeluar: detail.saldokeluar,
                qtyakhir: detail.qtyakhir,
                saldoakhir: detail.saldoakhir,
            });

            return acc;
        }, {});

        // Konversi object groupedData menjadi array
        const formattedLaporan = Object.values(groupedData);

        const formattedData = {
            laporan: formattedLaporan, // Ini akan menghasilkan array seperti yang Anda inginkan
            rekapitulasi: rekapitulasi[0],
        };

        console.log(formattedData)
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