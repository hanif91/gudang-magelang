import React from 'react'

interface Barang {
    id: number,
    nama_barang: string,
    satuan_barang: string,
    stok_barang: number,
    qty: number
}

export default interface Dpbk {
    id: number,
    nodpbk: string,
    nama_unit: string,
    tanggal: string,
    keterangan: string,
    barang: Barang[]
}
