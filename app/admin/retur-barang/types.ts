export interface ReturBarang {
    noop: string
    tanggal: string
    items: ReturBarangItem[]
}

export interface ReturBarangItem {
    id_op: number
    noop: string
    id_barang: number
    nama_barang: string
    kode_barang: string
    id_supplier: number
    qty_op: string
    qty_proses: string
    sisa_qty: string
    harga_beli: string
    nama_supplier: string
    nama_user: string
    satuan_barang: string
    harga_jual_barang: string
    foto_barang: string | null
    nama_jenis: string
    nama_kategori: string
    nama_merek: string
}
