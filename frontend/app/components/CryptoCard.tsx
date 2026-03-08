"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  CryptoData,
  formatPrice,
  formatMarketCap,
  formatChange,
  getChangeColor,
} from "@/app/utils";

interface CryptoCardProps {
  crypto: CryptoData;
  onFocus?: (crypto: CryptoData) => void;
}

export default function CryptoCard({ crypto }: CryptoCardProps) {
  const getRiskBg = () => {
    const absChange = Math.abs(crypto.change24h);
    if (absChange < 2) return "border-green-500 hover:shadow-green-500/30";
    if (absChange < 5) return "border-yellow-500 hover:shadow-yellow-500/30";
    return "border-red-500 hover:shadow-red-500/30";
  };

  const getRiskIndicator = () => {
    const absChange = Math.abs(crypto.change24h);
    if (absChange < 2) return { color: "bg-green-500", label: "LOW RISK" };
    if (absChange < 5) return { color: "bg-yellow-500", label: "MEDIUM RISK" };
    return { color: "bg-red-500", label: "HIGH RISK" };
  };

  const risk = getRiskIndicator();

  return (
    <Link href={`/coin/${crypto.id}`}>
      <div
        onClick={() => onFocus?.(crypto)}
        className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 border-gray-700 ${getRiskBg()} transition-all hover:shadow-lg cursor-pointer group`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: crypto.color }}
            >
              {crypto.icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                {crypto.name}
              </h3>
              <p className="text-gray-400 text-sm">{crypto.symbol}</p>
            </div>
          </div>
          <div
            className={`px-2 py-1 rounded text-xs font-bold text-white ${risk.color}`}
          >
            {risk.label}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-gray-400 text-sm mb-1">Price</p>
            <p className="text-3xl font-bold">{formatPrice(crypto.price)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-400 text-xs mb-1">24h Change</p>
              <p
                className={`flex items-center gap-1 font-semibold ${getChangeColor(crypto.change24h)}`}
              >
                {crypto.change24h >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {formatChange(crypto.change24h)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Market Cap</p>
              <p className="text-sm font-semibold text-cyan-400">
                {formatMarketCap(crypto.marketCap)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-xs mb-1">24h Volume</p>
            <p className="text-sm font-semibold text-purple-400">
              {formatMarketCap(crypto.volume24h)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 group-hover:text-blue-400 transition-colors">
            Click to view analysis and chart →
          </p>
        </div>
      </div>
    </Link>
  );
}
