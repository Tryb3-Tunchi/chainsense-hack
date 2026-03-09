"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  CryptoData,
  formatPrice,
  formatMarketCap,
  formatChange,
  getChangeColor,
  getRiskBadgeStyle,
} from "@/app/utils";

interface CryptoCardProps {
  crypto: CryptoData;
  onFocus?: (crypto: CryptoData) => void;
}

export default function CryptoCard({ crypto, onFocus }: CryptoCardProps) {
  const getRiskBg = () => {
    const absChange = Math.abs(crypto.change24h);
    if (absChange < 2) return "hover:border-green-500/50 hover:shadow-green-500/10";
    if (absChange < 5) return "hover:border-yellow-500/50 hover:shadow-yellow-500/10";
    return "hover:border-red-500/50 hover:shadow-red-500/10";
  };

  const riskLevel = Math.abs(crypto.change24h) < 2 
    ? "LOW" 
    : Math.abs(crypto.change24h) < 5 
      ? "MEDIUM" 
      : "HIGH";

  return (
    <div
      onClick={() => onFocus?.(crypto)}
      className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-5 border border-gray-700 ${getRiskBg()} transition-all hover:shadow-xl cursor-pointer group h-full flex flex-col relative`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner"
            style={{ backgroundColor: crypto.color }}
          >
            {crypto.icon}
          </div>
          <div>
            <h3 className="font-semibold text-base group-hover:text-blue-400 transition-colors leading-tight">
              {crypto.name}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-gray-500 text-xs">{crypto.symbol}</p>
              <span className="text-[10px] text-yellow-500/80 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                #{crypto.marketCapRank}
              </span>
            </div>
          </div>
        </div>
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${getRiskBadgeStyle(riskLevel)}`}
        >
          {riskLevel}
        </span>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Price</p>
          <p className="text-2xl font-bold text-white leading-none tracking-tight">{formatPrice(crypto.price)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-700/50 pt-4">
          <div>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">24h Change</p>
            <p
              className={`flex items-center gap-1 text-sm font-bold ${getChangeColor(crypto.change24h)}`}
            >
              {crypto.change24h >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {formatChange(crypto.change24h)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Market Cap</p>
            <p className="text-sm font-bold text-cyan-400">
              {formatMarketCap(crypto.marketCap)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-700/30 flex items-center justify-between">
        <p className="text-[10px] text-gray-500 group-hover:text-blue-400 transition-colors">
          Click to spotlight ↑
        </p>
        <Link 
          href={`/coin/${crypto.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-2 py-1 rounded transition-all font-bold border border-blue-600/20"
        >
          Detailed Analysis →
        </Link>
      </div>
    </div>
  );
}
