"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  time: string;
  price: number;
}

interface PriceChartProps {
  coinId: string;
  currentPrice: number;
}

export default function PriceChart({ coinId, currentPrice }: PriceChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateMockData = () => {
      const now = new Date();
      const points: ChartDataPoint[] = [];
      const basePrice = currentPrice || 40000;

      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3600000);
        const variance =
          Math.sin(i / 5) * (basePrice * 0.02) +
          Math.random() * (basePrice * 0.03);
        points.push({
          time: time.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          price: basePrice + variance,
        });
      }

      setData(points);
      setLoading(false);
    };

    generateMockData();
    const interval = setInterval(() => {
      setData((prev) => {
        if (prev.length === 0) return prev;
        const newData = [...prev.slice(1)];
        const lastTime = new Date();
        const basePrice = currentPrice || 40000;
        newData.push({
          time: lastTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          price:
            basePrice + (Math.random() * (basePrice * 0.04) - basePrice * 0.02),
        });
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [coinId, currentPrice]);

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-8">Loading chart...</div>
    );
  }

  return (
    <div
      className="w-full bg-gray-800 rounded-lg p-2 sm:p-4 border border-gray-700"
      style={{ height: "300px", minHeight: "250px" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="time"
            stroke="#888"
            fontSize={11}
            tick={{ fill: "#888" }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#888"
            fontSize={11}
            tick={{ fill: "#888" }}
            domain={["auto", "auto"]}
            width={60}
            tickFormatter={(value: number) => {
              if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
              return `$${value.toFixed(2)}`;
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a2e",
              border: "1px solid #444",
              borderRadius: "6px",
            }}
            labelStyle={{ color: "#fff" }}
            formatter={(value: any) => [
              `$${parseFloat(value).toFixed(2)}`,
              "Price",
            ]}
            cursor={{ stroke: "#06b6d4", strokeDasharray: "5 5" }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
