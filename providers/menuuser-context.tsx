"use client"

import {
  type LucideIcon, SquareTerminal,
  User,
  Box,
  Boxes,
  User2,
  List,
  ShoppingCart,
  ShoppingBag,
  Archive,
  Building2
} from "lucide-react";
import React, { createContext, useContext } from "react";

// import { getUser } from "./auth-actions";

interface objMenu {
  title: string,
  icon?: LucideIcon,
  items: Tbreadcrumb[]
}

interface Tbreadcrumb {
  title: string,
  url: string,
  ismenu: boolean,
  id: number
}

const pageNames: { [key: string]: objMenu } = {
  "/admin": {
    title: "Dashboard",
    icon: SquareTerminal,
    items: [{ title: "Dashboard", url: "/admin", ismenu: true, id: 4 }]
  },
  "/admin/users": {
    title: "Users",
    icon: User,
    items: [
      { title: "Users", url: "/admin/users", ismenu: true, id: 3 }
    ]
  },
  "/admin/users/create": {
    title: "Create Users",
    items: [
      { title: "Users", url: "/admin/users", ismenu: false, id: 1 },
      { title: "create", url: "/admin/users/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/users/edit": {
    title: "Edit Users",
    items: [
      { title: "Users", url: "/admin/users", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/users/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/barang": {
    title: "Barang",
    icon: Box,
    items: [
      { title: "Barang", url: "/admin/barang", ismenu: true, id: 5 }
    ]
  },
  "/admin/barang/create": {
    title: "Create Barang",
    items: [
      { title: "Barang", url: "/admin/barang", ismenu: false, id: 1 },
      { title: "create", url: "/admin/barang/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/barang/edit": {
    title: "Edit Barang",
    items: [
      { title: "Barang", url: "/admin/barang", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/barang/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/merek": {
    title: "Merek",
    icon: Boxes,
    items: [
      { title: "Merek", url: "/admin/merek", ismenu: true, id: 6 }
    ]
  },
  "/admin/merek/create": {
    title: "Create Barang",
    items: [
      { title: "Barang", url: "/admin/merek", ismenu: false, id: 1 },
      { title: "create", url: "/admin/merek/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/merek/edit": {
    title: "Edit Merek",
    items: [
      { title: "Merek", url: "/admin/merek", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/merek/edit", ismenu: true, id: 2 }
    ]
  },

  "/admin/kategori": {
    title: "Kategori",
    icon: Box,
    items: [
      { title: "Kategori", url: "/admin/kategori", ismenu: true, id: 6 }
    ]
  },
  "/admin/kategori/create": {
    title: "Create Kategori",
    items: [
      { title: "Kategori", url: "/admin/kategori", ismenu: false, id: 1 },
      { title: "create", url: "/admin/kategori/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/kategori/edit": {
    title: "Edit Kategori",
    items: [
      { title: "Kategori", url: "/admin/kategori", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/kategori/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/user-paraf": {
    title: "User Paraf",
    icon: User2,
    items: [
      { title: "User Paraf", url: "/admin/user-paraf", ismenu: true, id: 7 }
    ]
  },
  "/admin/user-paraf/create": {
    title: "Create User Paraf",
    items: [
      { title: "User Paraf", url: "/admin/user-paraf", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/user-paraf/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/user-paraf/edit": {
    title: "Edit User Paraf",
    items: [
      { title: "Kategori", url: "/admin/user-paraf", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/user-paraf/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/jenis": {
    title: "Jenis",
    icon: List,
    items: [
      { title: "Jenis", url: "/admin/jenis", ismenu: true, id: 8 }
    ]
  },
  "/admin/jenis/create": {
    title: "Create User Paraf",
    items: [
      { title: "Jenis", url: "/admin/jenis", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/jenis/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/jenis/edit": {
    title: "Edit Jenis",
    items: [
      { title: "Jenis", url: "/admin/jenis", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/jenis/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/pembelian": {
    title: "Pembelian",
    icon: ShoppingCart,
    items: [
      { title: "Pembelian", url: "/admin/pembelian", ismenu: true, id: 9 }
    ]
  },
  "/admin/pembelian/create-rekanan": {
    title: "Create Pembelian Full Rekanan",
    items: [
      { title: "Pembelian Full Rekanan", url: "/admin/pembelian", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/pembelian/create-rekanan", ismenu: true, id: 2 }
    ]
  },
  "/admin/pembelian/create-non-rekanan": {
    title: "Create Pembelian Non Rekanan",
    items: [
      { title: "Pembelian Non Rekanan", url: "/admin/pembelian", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/pembelian/non-rekanan", ismenu: true, id: 2 }
    ]
  },
  "/admin/pembelian/edit": {
    title: "Edit Pembelian",
    items: [
      { title: "Pembelian", url: "/admin/pembelian", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/pembelian/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/daftar-permintaan-barang": {
    title: "Daftar Permintaan Barang",
    icon: ShoppingBag,
    items: [
      { title: "Daftar Permintaan Barang", url: "/admin/daftar-permintaan-barang", ismenu: true, id: 10 }
    ]
  },
  "/admin/daftar-permintaan-barang/create": {
    title: "Create User Daftar Permintaan Barang",
    items: [
      { title: "Daftar Permintaan Barang", url: "/admin/daftar-permintaan-barang", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/daftar-permintaan-barang/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/daftar-permintaan-barang/edit": {
    title: "Edit Daftar Permintaan Barang",
    items: [
      { title: "Daftar Permintaan Barang", url: "/admin/daftar-permintaan-barang", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/daftar-permintaan-barang/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/stock": {
    title: "Stock",
    icon: Archive,
    items: [
      { title: "Stock", url: "/admin/stock", ismenu: true, id: 11 }
    ]
  },
  "/admin/stock/create": {
    title: "Create Stock",
    items: [
      { title: "Stock", url: "/admin/stock", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/stock/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/stock/edit": {
    title: "Edit Stock",
    items: [
      { title: "Stock", url: "/admin/stock", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/stock/edit", ismenu: true, id: 2 }
    ]
  },

  "/admin/supplier": {
    title: "Supplier",
    icon: Building2,
    items: [
      { title: "Supplier", url: "/admin/supplier", ismenu: true, id: 12 }
    ]
  },
  "/admin/supplier/create": {
    title: "Create Supplier",
    items: [
      { title: "Supplier", url: "/admin/supplier", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/supplier/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/supplier/edit": {
    title: "Edit Supplier",
    items: [
      { title: "Supplier", url: "/admin/supplier", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/supplier/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/unit": {
    title: "Unit",
    icon: Building2,
    items: [
      { title: "Unit", url: "/admin/unit", ismenu: true, id: 13 }
    ]
  },
  "/admin/unit/create": {
    title: "Create unit",
    items: [
      { title: "unit", url: "/admin/unit", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/unit/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/unit/edit": {
    title: "Edit Unit",
    items: [
      { title: "Unit", url: "/admin/unit", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/unit/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/kodekeper": {
    title: "Kode Keperluan",
    icon: Building2,
    items: [
      { title: "Kode Keperluan", url: "/admin/kodekeper", ismenu: true, id: 14 }
    ]
  },
  "/admin/kodekeper/create": {
    title: "Create kodekeper",
    items: [
      { title: "kodekeper", url: "/admin/kodekeper", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/kodekeper/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/kodekeper/edit": {
    title: "Edit Kode Keperluan",
    items: [
      { title: "Kode Keperluan", url: "/admin/kodekeper", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/kodekeper/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/paket": {
    title: "Paket",
    icon: Building2,
    items: [
      { title: "Paket", url: "/admin/paket", ismenu: true, id: 15 }
    ]
  },
  "/admin/paket/create": {
    title: "Create paket",
    items: [
      { title: "Paket", url: "/admin/paket", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/paket/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/paket/edit": {
    title: "Edit Paket",
    items: [
      { title: "Paket", url: "/admin/paket", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/paket/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/jenis-barang-keluar": {
    title: "Barang Keluar",
    icon: Building2,
    items: [
      { title: "Barang Keluar", url: "/admin/jenis-barang-keluar", ismenu: true, id: 16 }
    ]
  },
  "/admin/jenis-barang-keluar/create": {
    title: "Create jenis-barang-keluar",
    items: [
      { title: "Barang Keluar", url: "/admin/jenis-barang-keluar", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/jenis-barang-keluar/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/jenis-barang-keluar/edit": {
    title: "Edit Barang Keluar",
    items: [
      { title: "Barang Keluar", url: "/admin/jenis-barang-keluar", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/jenis-barang-keluar/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/bagian-minta": {
    title: "Bagian Minta",
    icon: Building2,
    items: [
      { title: "Bagian Minta", url: "/admin/bagian-minta", ismenu: true, id: 17 }
    ]
  },
  "/admin/bagian-minta/create": {
    title: "Create Bagian Minta",
    items: [
      { title: "Bagian Minta", url: "/admin/bagian-minta", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/bagian-minta/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/bagian-minta/edit": {
    title: "Edit Bagian Minta",
    items: [
      { title: "Bagian Mita", url: "/admin/bagian-minta", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/bagian-minta/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/asset-wilayah": {
    title: "Asset Wilayah",
    icon: Building2,
    items: [
      { title: "Asset Wilayah", url: "/admin/asset-wilayah", ismenu: true, id: 18 }
    ]
  },
  "/admin/asset-wilayah/create": {
    title: "Create Asset Wilayah",
    items: [
      { title: "Asset Wilayah", url: "/admin/asset-wilayah", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/asset-wilayah/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/asset-wilayah/edit": {
    title: "Edit Asset Wilayah",
    items: [
      { title: "Asset Wilayah", url: "/admin/asset-wilayah", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/asset-wilayah/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/asset-perpipaan": {
    title: "Asset Perpipaan",
    icon: Building2,
    items: [
      { title: "Asset Perpipaan", url: "/admin/asset-perpipaan", ismenu: true, id: 19 }
    ]
  },
  "/admin/asset-perpipaan/create": {
    title: "Create Asset Perpipaan",
    items: [
      { title: "Asset Perpipaan", url: "/admin/asset-perpipaan", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/asset-perpipaan/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/asset-perpipaan/edit": {
    title: "Edit Asset Perpipaan",
    items: [
      { title: "Asset Perpipaan", url: "/admin/asset-perpipaan", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/asset-perpipaan/edit", ismenu: true, id: 2 }
    ]
  },

  "/admin/asset-lokasi": {
    title: "Asset Lokasi",
    icon: Building2,
    items: [
      { title: "Asset Lokasi", url: "/admin/asset-lokasi", ismenu: true, id: 20 }
    ]
  },
  "/admin/asset-lokasi/create": {
    title: "Create Asset Lokasi",
    items: [
      { title: "Asset Lokasi", url: "/admin/asset-lokasi", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/asset-lokasi/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/asset-lokasi/edit": {
    title: "Edit Asset Lokasi",
    items: [
      { title: "Asset Lokasi", url: "/admin/asset-lokasi", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/asset-lokasi/edit", ismenu: true, id: 2 }
    ]
  },

  "/admin/daftar-permintaan-barang-keluar": {
    title: "Daftar Permintaan Barang Keluar",
    icon: ShoppingBag,
    items: [
      { title: "Daftar Permintaan Barang Keluar", url: "/admin/daftar-permintaan-barang-keluar", ismenu: true, id: 21 }
    ]
  },
  "/admin/daftar-permintaan-barang-keluar/create": {
    title: "Create User Daftar Permintaan Barang Keluar",
    items: [
      { title: "Daftar Permintaan Barang Keluar", url: "/admin/daftar-permintaan-barang-keluar", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/daftar-permintaan-barang-keluar/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/daftar-permintaan-barang-keluar/edit": {
    title: "Edit Daftar Permintaan Barang Keluar",
    items: [
      { title: "Daftar Permintaan Barang Keluar", url: "/admin/daftar-permintaan-barang-keluar", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/daftar-permintaan-barang-keluar/edit", ismenu: true, id: 2 }
    ]
  },
  "/admin/barang-keluar": {
    title: "Barang Keluar",
    icon: ShoppingBag,
    items: [
      { title: "Barang Keluar", url: "/admin/barang-keluar", ismenu: true, id: 22 }
    ]
  },
  "/admin/barang-keluar/create": {
    title: "Create User Barang Keluar",
    items: [
      { title: "Barang Keluar", url: "/admin/barang-keluar", ismenu: false, id: 1 },
      { title: "Create", url: "/admin/barang-keluar/create", ismenu: true, id: 2 }
    ]
  },
  "/admin/barang-keluar/edit-keterangan": {
    title: "Edit Keterangan",
    items: [
      { title: "Barang Keluar", url: "/admin/barang-keluar", ismenu: false, id: 1 },
      { title: "Edit", url: "/admin/barang-keluar/edit-keterangan", ismenu: true, id: 2 }
    ]
  },
  "/admin/kartu-stok-barang": {
    title: "Kartu Stok Barang",
    icon: ShoppingBag,
    items: [
      { title: "Kartu Stok Barang", url: "/admin/kartu-stok-barang", ismenu: true, id: 23 }
    ]
  },
  "/admin/laporan-persediaan": {
    title: "Laporan Persediaan",
    icon: ShoppingBag,
    items: [
      { title: "Laporan Persediaan", url: "/admin/laporan-persediaan", ismenu: true, id: 24 }
    ]
  },
  "/admin/laporan-stok": {
    title: "Laporan Persediaan",
    icon: ShoppingBag,
    items: [
      { title: "Laporan Stok", url: "/admin/laporan-stok", ismenu: true, id: 25 }
    ]
  },




};
export const MenuUserContext = createContext(pageNames)



export function MenuUserProvider({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <MenuUserContext.Provider value={pageNames}>
      {children}
    </MenuUserContext.Provider>
  )
}

