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
  symbol: string;
  coinId: string;
}

export default function PriceChart({ symbol, coinId }: PriceChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateMockData = () => {
      const now = new Date();
      const points: ChartDataPoint[] = [];

      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3600000);
        const variance = Math.sin(i / 5) * 1000 + Math.random() * 2000;
        points.push({
          time: time.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          price: 40000 + variance,
        });
      }

      setData(points);
      setLoading(false);
    };

    generateMockData();
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1)];
        const lastTime = new Date(new Date().getTime() - 1 * 3600000);
        newData.push({
          time: lastTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          price: 40000 + Math.random() * 5000 - 2500,
        });
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [coinId]);

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
            style={{ fontSize: "11px" }}
            tick={{ fill: "#888" }}
            interval={Math.floor(data.length / 6)}
          />
          <YAxis
            stroke="#888"
            style={{ fontSize: "11px" }}
            tick={{ fill: "#888" }}
            domain={["dataMin - 500", "dataMax + 500"]}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a2e",
              border: "1px solid #444",
              borderRadius: "6px",
            }}
            labelStyle={{ color: "#fff" }}
            formatter={(value: number) => `$${value.toFixed(2)}`}
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
