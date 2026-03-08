"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import PriceChart from "@/app/components/PriceChart";
import {
  CryptoData,
  formatPrice,
  formatMarketCap,
  formatChange,
  getChangeColor,
  getRiskBadgeStyle,
  getRiskColor,
  fetchSingleCoinData,
} from "@/app/utils";

interface AIAnalysis {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  sentiment: string;
  recommendation: string;
  volatility: number;
}

export default function CoinDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [crypto, setCrypto] = useState<CryptoData | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params;
      const data = await fetchSingleCoinData(id);
      if (data) {
        setCrypto(data);
      }
      setLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [params]);

  const performAIAnalysis = async () => {
    if (!crypto) return;

    setAnalyzing(true);
    try {
      // Simulate AI analysis based on volatility
      const volatility = Math.abs(crypto.change24h);
      let riskLevel: "LOW" | "MEDIUM" | "HIGH";
      let sentiment: string;
      let recommendation: string;

      if (volatility < 2) {
        riskLevel = "LOW";
        sentiment = "Stable and consolidating";
        recommendation =
          "Good for conservative investors. Consider accumulating.";
      } else if (volatility < 5) {
        riskLevel = "MEDIUM";
        sentiment = "Moderate volatility detected";
        recommendation =
          "Watch for breakout signals. Use proper position sizing.";
      } else {
        riskLevel = "HIGH";
        sentiment = "High volatility environment";
        recommendation =
          "High risk/reward. Use strict risk management and stops.";
      }

      // Add some randomness for demonstration
      if (Math.random() > 0.5) {
        sentiment += " with buying pressure";
      } else {
        sentiment += " with selling pressure";
      }

      setAnalysis({
        riskLevel,
        sentiment,
        recommendation,
        volatility,
      });
    } catch (err) {
      console.error("Error performing analysis:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case "LOW":
        return "bg-green-500/20 border-green-500/50 hover:bg-green-500/30";
      case "MEDIUM":
        return "bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30";
      case "HIGH":
        return "bg-red-500/20 border-red-500/50 hover:bg-red-500/30";
      default:
        return "bg-gray-500/20 border-gray-500/50 hover:bg-gray-500/30";
    }
  };

  if (loading && !crypto) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center pt-20 pb-8 px-4">
        <p className="text-gray-400 text-base sm:text-lg">Loading...</p>
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="w-full min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg mb-6 transition-all text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <p className="text-gray-400 text-base sm:text-lg">Coin not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg mb-6 transition-all text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          <span>Back</span>
        </button>

        {/* Header - Responsive Stacking */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl flex-shrink-0"
            style={{ backgroundColor: crypto.color }}
          >
            {crypto.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold break-words">
              {crypto.name}
            </h1>
            <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
              Market Cap Rank: #{crypto.marketCapRank}
            </p>
          </div>
        </div>

        {/* Price Section - Responsive Layout */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 sm:p-6 mb-6 border border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 sm:gap-4">
            <div className="flex-1">
              <p className="text-gray-400 text-xs sm:text-sm mb-2">
                Current Price
              </p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold break-words">
                {formatPrice(crypto.price)}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-gray-400 text-xs sm:text-sm mb-2">
                24h Change
              </p>
              <p
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-2 ${getChangeColor(crypto.change24h)}`}
              >
                {crypto.change24h >= 0 ? (
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                )}
                <span className="break-words">
                  {formatChange(crypto.change24h)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* AI Analysis Button & Results - Responsive */}
        <div className="mb-8">
          <button
            onClick={performAIAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold mb-4 disabled:opacity-50 transition-all text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
          >
            <Zap
              className={`w-5 h-5 flex-shrink-0 ${analyzing ? "animate-spin" : ""}`}
            />
            {analyzing ? "Analyzing..." : "Analyze with AI"}
          </button>

          {analysis && (
            <div
              className={`rounded-lg p-4 sm:p-6 border-2 ${getRiskBg(analysis.riskLevel)}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-default ${getRiskBadgeStyle(analysis.riskLevel)}`}
                >
                  {analysis.riskLevel} RISK
                </span>
                <p
                  className={`text-lg sm:text-xl ${getRiskColor(analysis.riskLevel)} break-words`}
                >
                  {analysis.sentiment}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">
                    Price Volatility
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-cyan-400">
                    {analysis.volatility.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">
                    Market Status
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {crypto.change24h >= 0 ? "📈 Bullish" : "📉 Bearish"}
                  </p>
                </div>
              </div>

              <p className="text-base sm:text-lg text-gray-300 bg-gray-900/50 rounded p-3 sm:p-4 break-words">
                <strong>Recommendation:</strong> {analysis.recommendation}
              </p>
            </div>
          )}
        </div>

        {/* Price Chart */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            24-Hour Price Movement
          </h2>
          <PriceChart coinId={crypto.id} currentPrice={crypto.price} />
        </div>

        {/* Market Data Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">Market Cap</p>
            <p className="text-xl sm:text-2xl font-bold text-cyan-400 break-words">
              {formatMarketCap(crypto.marketCap)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">24h Volume</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-400 break-words">
              {formatMarketCap(crypto.volume24h)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">Symbol</p>
            <p className="text-xl sm:text-2xl font-bold break-words">
              {crypto.symbol}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">Rank</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-400">
              #{crypto.marketCapRank}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
