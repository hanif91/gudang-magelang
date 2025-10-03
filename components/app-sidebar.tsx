"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  User,
  Box,
  Boxes,
  List,
  User2,
  ShoppingCart,
  ShoppingBag,
  Archive,
  Book,
  BookUp,
  BookDown,
} from "lucide-react";

import { NavProjectsHome } from "@/components/nav-projects-home";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMainMenuTransaksi } from "./nav-main-menu-transaksi";
import { NavProjectsMasterData } from "./nav-projects-master-data";
import { NavProjectsMenuLaporan } from "./nav-projects-menu-laporan";

const data = {
  teams: [
    {
      name: "SIPAMIT - INVENTORY",
      logo: GalleryVerticalEnd,
      plan: "",
    },
  ],
  NavProjectsHome: [
    {
      name: "Dashboard",
      url: "/admin",
      icon: SquareTerminal,
    },
  ],
  NavMainMenuTransaksi: [
    {
      title: "Barang Masuk",
      icon: BookUp,
      url: "#",
      items: [
        {
          title: "Daftar Permintaan Barang",
          url: "/admin/daftar-permintaan-barang",
        },
        {
          title: "Pembelian",
          url: "/admin/pembelian",
        },
      ],
    },
    {
      title: "Barang Keluar",
      icon: BookDown,
      url: "#",
      items: [
        {
          title: "Request Barang Keluar",
          url: "/admin/daftar-permintaan-barang-keluar",
        },
        {
          title: "Barang Keluar",
          url: "/admin/barang-keluar",
        },
      ],
    },
  ],
  NavProjectsMasterData: [
    {
      name: "Barang",
      url: "/admin/barang",
      icon: Box,
      items: [
        {
          title: "Jenis",
          url: "/admin/jenis",
        },
        {
          title: "Kategori",
          url: "/admin/kategori",
        },
        {
          title: "Merek",
          url: "/admin/merek",
        },
        {
          title: "Stock",
          url: "/admin/stock",
        },
        {
          title: "Users",
          url: "/admin/users",
        },
        {
          title: "Supplier",
          url: "/admin/supplier",
        },
        {
          title: "Unit",
          url: "/admin/unit",
        },
        {
          title: "Paket",
          url: "/admin/paket",
        },
        {
          title: "Kode Keperluan",
          url: "/admin/kodekeper",
        },
        {
          title: "Jenis Barang Keluar",
          url: "/admin/jenis-barang-keluar",
        },
        {
          title: "Bagian Minta",
          url: "/admin/bagian-minta",
        },
        {
          title: "Asset Wilayah",
          url: "/admin/asset-wilayah",
        },
        {
          title: "Asset Perpipaan",
          url: "/admin/asset-perpipaan",
        },
        {
          title: "Asset Lokasi",
          url: "/admin/asset-lokasi",
        },

      ],
    },
  ],
  NavProjectsMenuLaporan: [
    {
      name: "Laporan Persedian",
      url: "/admin/laporan-persediaan",
      icon: Book,
    },
    {
      name: "Laporan Stok",
      url: "/admin/laporan-stok",
      icon: Book,
    },
    {
      name: "Kartu Stok Barang",
      url: "/admin/kartu-stok-barang",
      icon: Book,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = React.useState<string | null>(null);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <NavProjectsHome
          projects={data.NavProjectsHome}
        // activeItem={activeItem}
        // setActiveItem={setActiveItem}
        />
        <NavMainMenuTransaksi
          items={data.NavMainMenuTransaksi}
        // activeItem={activeItem}
        // setActiveItem={setActiveItem}
        />
        <NavProjectsMasterData
          projects={data.NavProjectsMasterData}
        // activeItem={activeItem}
        // setActiveItem={setActiveItem}
        />
        <NavProjectsMenuLaporan
          projects={data.NavProjectsMenuLaporan}
        // activeItem={activeItem}
        // setActiveItem={setActiveItem}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}