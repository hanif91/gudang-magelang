"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import formatHarga from "@/lib/format-harga"

interface ChartInterface {
    name: string,
    amount: number,
}

const chartConfig = {
    desktop: {
        label: "Desktop",
    },
} satisfies ChartConfig

const getMonthName = (monthIndex: number): string => {
    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return monthNames[monthIndex];
};

export function ChartLabel({ title, descriptions, data }: { title: string, descriptions: string, data: ChartInterface[] }) {
    const currentMonth = getMonthName(new Date().getMonth()); // Dapatkan nama bulan saat ini

    // Warna yang sama untuk semua bar
    const barColor = "hsl(var(--chart-1))"; // Ganti dengan warna yang Anda inginkan

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Jumlah BPP berdasarkan {title} Bulan {currentMonth}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    {title.toLocaleLowerCase() === "jenis" ? (
                        // Grafik untuk "jenis"
                        <BarChart
                            accessibilityLayer
                            data={data}
                            margin={{
                                top: 20,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value}
                            />
                            <ChartTooltip
                                cursor={false}
                                formatter={(value: number) => formatHarga(value, {shorten: true})}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="amount" fill={barColor} radius={8}>
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={12}
                                    formatter={(value: number) => formatHarga(value, {shorten: true})}
                                />
                            </Bar>
                        </BarChart>
                    ) : (
                        // Grafik untuk "kategori"
                        <BarChart
                            accessibilityLayer
                            data={data}
                            layout="vertical"
                            width={500} // Sesuaikan lebar grafik
                            height={300} // Sesuaikan tinggi grafik
                        >
                            <YAxis
                                dataKey="name"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => {
                                    // Potong teks jika terlalu panjang
                                    const maxLength = 20; // Maksimal panjang teks
                                    return value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;
                                }}
                                interval={0} // Pastikan semua label ditampilkan
                                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} // Sesuaikan ukuran font dan warna
                                width={100} // Sesuaikan lebar area label
                            />
                            <XAxis dataKey="amount" type="number" hide />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                                formatter={(value: number) => formatHarga(value, {shorten: true})}
                            />
                            <Bar dataKey="amount" fill={barColor} layout="vertical" radius={5}>
                                <LabelList
                                    dataKey="amount"
                                    position="right"
                                    offset={8}
                                    className="fill-foreground"
                                    fontSize={12}
                                    formatter={(value: number) => formatHarga(value, {shorten: true})} // Format nilai menjadi harga
                                />
                            </Bar>
                        </BarChart>
                    )}
                </ChartContainer>
            </CardContent>
        </Card>
    )
}