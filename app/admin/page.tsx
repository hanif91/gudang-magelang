"use client";

import AppHeaderAdmin from "@/components/header-admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AxiosClient from "@/lib/AxiosClient";
import { Fragment } from "react";
import useSWR from "swr";
import {
  Package,
  Search,
  Users2,
  AlertTriangle,
  ShoppingCart,
  Box,
  List,
  ChartBarStacked,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import formatHarga from "@/lib/format-harga";
import { ChartLabel } from "@/components/ui/chart-label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface DashboardData {
  card: {
    belum_verifikasi_bpp: number;
    dpbk: number;
    jumlah_min_stok: number;
    saldo_persediaan: number;
  };
  chart: {
    jenis: {
      name: string;
      amount: number;
    }[];
    kategori: {
      name: string;
      amount: number;
    }[];
  };
}

// Fetcher untuk SWR
const fetcher = (url: string) => AxiosClient.get(url).then((res) => res.data.data);

// Data untuk card statistik
const cardData = [
  {
    title: "Stock",
    description: "Total barang yang kurang dari minimal stock",
    icon: Box,
    valueKey: "jumlah_min_stok",
    link: "/admin/stock",
    gradient: "from-green-600 to-green-800",
    borderColor: "border-green-700",
    textColor: "text-green-200",
  },
  {
    title: "DPBK",
    description: "Total Daftar Permintaan Barang Keluar",
    icon: List,
    valueKey: "dpbk",
    link: "/admin/daftar-permintaan-barang-keluar",
    gradient: "from-pink-600 to-pink-800",
    borderColor: "border-pink-700",
    textColor: "text-pink-200",
  },
  {
    title: "Saldo Persediaan",
    description: "Total Saldo Persediaan",
    icon: ShoppingCart,
    link: "/admin/laporan-persediaan",
    valueKey: "saldo_persediaan",
    gradient: "from-red-600 to-red-800",
    borderColor: "border-red-700",
    textColor: "text-red-200",
  },
  {
    title: "BPP",
    description: "Total barang yang belum terverifikasi",
    icon: ChartBarStacked,
    link: "/admin/barang-keluar",
    valueKey: "belum_verifikasi_bpp",
    gradient: "from-red-600 to-red-800",
    borderColor: "border-red-700",
    textColor: "text-red-200",
  },
];

export default function Page() {
  const { data, error, isLoading } = useSWR<DashboardData>(
    "/api/gudang/dashboard",
    fetcher
  );

  if (error) {
    return (
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Barang Keluar</CardTitle>
            <CardDescription>Daftar Barang Keluar</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-5">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Fetching Data</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter />
        </Card>
      </main>
    );
  }

  // Handle loading
  if (isLoading || !data) {
    return (
      <main className="flex flex-col gap-5 justify-center content-center p-5">
        {/* Skeleton untuk Card Statistik */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <Card
              key={index}
              className="shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-[150px]" /> {/* Judul Card */}
                  <Skeleton className="h-8 w-8 rounded-full" /> {/* Icon */}
                </div>
                <Skeleton className="h-4 w-[200px] mt-2" /> {/* Deskripsi */}
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-[100px] mt-2" />{" "}
                {/* Nilai Statistik */}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton untuk Section Tambahan */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Skeleton untuk Chart */}
          <Card className="text-white shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" /> {/* Judul Chart */}
              <Skeleton className="h-4 w-[200px] mt-2" />{" "}
              {/* Deskripsi Chart */}
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />{" "}
              {/* Placeholder Chart */}
            </CardContent>
          </Card>

          {/* Skeleton untuk Quick Actions */}
          <Card className="text-white shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" /> {/* Judul Chart */}
              <Skeleton className="h-4 w-[200px] mt-2" />{" "}
              {/* Deskripsi Chart */}
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />{" "}
              {/* Placeholder Chart */}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <Fragment>
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Grid untuk Card Statistik */}
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {cardData.map((card, index) => (
            <Link
              key={index}
              href={card.link || "#"}
              className="hover:no-underline"
            >
              <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl text-foreground">
                      {card.title}
                    </CardTitle>
                    <card.icon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-4xl font-bold text-foreground">
                    {data?.card
                      ? card.valueKey === "saldo_persediaan"
                        ? formatHarga(data.card.saldo_persediaan, {
                          shorten: true,
                        })
                        : data.card[
                        card.valueKey as keyof DashboardData["card"]
                        ]
                      : "...."}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Section Tambahan (Opsional) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartLabel
            title="Jenis"
            descriptions="Jumlah BPP jenis bulan ini"
            data={data.chart.jenis}
          />
          <ChartLabel
            title="Kategori"
            descriptions="Jumlah BPP jenis bulan ini"
            data={data.chart.kategori}
          />

          {/* <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">Perform common tasks quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Link href="/admin/barang" className="text-blue-400 hover:underline">
                  Add New Item
                </Link>
                <Link href="/admin/users" className="text-blue-400 hover:underline">
                  Manage Users
                </Link>
                <Link href="/admin/supplier" className="text-blue-400 hover:underline">
                  View Suppliers
                </Link>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </Fragment>
  );
}
