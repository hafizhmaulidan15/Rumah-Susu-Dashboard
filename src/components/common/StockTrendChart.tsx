"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DataPoint {
  date: string;
  stock: number;
}

interface StockTrendChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
}

export function StockTrendChart({
  data,
  height = 200,
  color = "var(--color-mainColor)",
}: StockTrendChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-secondaryText text-xs"
        style={{ height }}
      >
        Data tidak tersedia
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--color-secondaryText)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--color-secondaryText)" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-primaryBg)",
            border: "1px solid var(--color-mainBorder)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "var(--color-primaryText)",
          }}
          formatter={(value) => [
            Number(value).toLocaleString("id-ID"),
            "Stock",
          ]}
        />
        <Bar
          dataKey="stock"
          fill={color}
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
