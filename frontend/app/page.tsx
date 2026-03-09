"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
} from "lucide-react";
import CryptoCard from "./components/CryptoCard";
import {
  Verdict,
  CryptoData,
  getRiskColor,
  getRiskBadgeStyle,
  formatPrice,
  formatChange,
  fetchCryptoData,
} from "./utils";
import PriceChart from "./components/PriceChart";

export default function Home() {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [featuredCoin, setFeaturedCoin] = useState<CryptoData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch crypto data
      const cryptoList = await fetchCryptoData();
      if (cryptoList.length > 0) {
        setCryptoData(cryptoList);

        // Ensure featured coin has the latest data if it's already set
        if (featuredCoin) {
          const updatedFeatured = cryptoList.find(
            (c) => c.id === featuredCoin.id,
          );
          if (updatedFeatured) setFeaturedCoin(updatedFeatured);
        } else {
          setFeaturedCoin(cryptoList[0]);
        }
      }

      // Fetch verdict
      const verdictResponse = await fetch(
        `https://api.jsonbin.io/v3/b/${process.env.NEXT_PUBLIC_JSONBIN_BIN_ID}/latest`,
        {
          headers: {
            "X-Master-Key": process.env.NEXT_PUBLIC_JSONBIN_API_KEY!,
          },
          cache: "no-store",
        },
      );
      if (verdictResponse.ok) {
        const data = await verdictResponse.json();
        setVerdict(data.record);
      }

      setLastUpdate(new Date());
      setTimeRemaining(15);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Unable to load latest market data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [featuredCoin]);

  useEffect(() => {
    fetchData();
    const dataInterval = setInterval(fetchData, 10000);

    const timerInterval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 1 ? prev - 1 : 10));
    }, 1000);

    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(timerInterval);
      clearInterval(clockInterval);
    };
  }, [fetchData]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Market Sentinel
          </h1>
          <p className="text-gray-400 mt-2">
            Real-time AI-powered crypto market analysis
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold">
              {currentTime.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              |{" "}
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2">
            {loading ? (
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : error ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : (
              <RefreshCw className="w-4 h-4 text-cyan-400" />
            )}
            <span className="text-sm font-semibold">
              {loading
                ? "Refreshing..."
                : error
                  ? "Retrying..."
                  : `Next update in ${timeRemaining}s`}
            </span>
          </div>
        </div>
      </div>

      {/* AI Verdict Card */}
      {verdict && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">AI Market Assessment</h2>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <span
              className={`px-4 py-2 rounded-full text-white font-semibold text-lg ${getRiskColor(verdict.riskLevel)}`}
            >
              {verdict.riskLevel} RISK
            </span>
            <p className="text-gray-300 flex-1">{verdict.summary}</p>
          </div>

          <p className="text-sm text-gray-400">
            Last analysis:{" "}
            {verdict.timestamp
              ? new Date(verdict.timestamp).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "Unknown"}
          </p>
        </div>
      )}

      {loading && cryptoData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-400" />
          <p className="text-gray-400">Loading market data...</p>
        </div>
      )}

      {cryptoData.length > 0 && (
        <>
          {/* Featured Coin Spotlight - Dynamic & Interactive */}
          {featuredCoin && (
            <div className="mb-8">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700 p-8 shadow-2xl">
                {/* Animated Background Elements */}
                <div
                  className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
                  style={{ backgroundColor: featuredCoin.color }}
                ></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-5 blur-3xl bg-blue-500"></div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg"
                        style={{ backgroundColor: featuredCoin.color }}
                      >
                        {featuredCoin.icon}
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-white">
                          {featuredCoin.name}
                        </h2>
                        <p className="text-cyan-400 text-lg font-semibold">
                          Featured Today
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm mb-2">Market Rank</p>
                      <p className="text-3xl font-bold text-yellow-400">
                        #{featuredCoin.marketCapRank}
                      </p>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left Column: Price & Stats */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/50">
                        <p className="text-gray-400 text-sm mb-2">
                          Current Price
                        </p>
                        <p className="text-4xl font-bold text-cyan-400">
                          {formatPrice(featuredCoin.price)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {featuredCoin.symbol}
                        </p>
                      </div>

                      <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/50">
                        <p className="text-gray-400 text-sm mb-2">24h Change</p>
                        <div
                          className={`flex items-center gap-2 ${featuredCoin.change24h >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {featuredCoin.change24h >= 0 ? (
                            <TrendingUp className="w-6 h-6" />
                          ) : (
                            <TrendingDown className="w-6 h-6" />
                          )}
                          <p className="text-4xl font-bold">
                            {formatChange(featuredCoin.change24h)}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/50">
                        <p className="text-gray-400 text-sm mb-2">
                          Market Status
                        </p>
                        <p
                          className={`text-3xl font-bold ${featuredCoin.change24h >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {featuredCoin.change24h >= 0
                            ? "📈 Bullish"
                            : "📉 Bearish"}
                        </p>
                      </div>
                    </div>

                    {/* Right Column: Interactive Chart */}
                    <div className="lg:col-span-2">
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-gray-400 text-sm font-semibold">
                            24h Performance Visualization
                          </p>
                          <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full animate-pulse">
                            Live Feed
                          </span>
                        </div>
                        <div className="flex-1">
                          <PriceChart
                            coinId={featuredCoin.id}
                            currentPrice={featuredCoin.price}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Market Data Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-900/50 rounded p-3 border border-gray-700/50">
                      <p className="text-gray-400 text-xs mb-1">Market Cap</p>
                      <p className="text-lg font-bold text-purple-400">
                        {formatPrice(featuredCoin.marketCap)}
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded p-3 border border-gray-700/50">
                      <p className="text-gray-400 text-xs mb-1">24h Volume</p>
                      <p className="text-lg font-bold text-blue-400">
                        {formatPrice(featuredCoin.volume24h)}
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded p-3 border border-gray-700/50">
                      <p className="text-gray-400 text-xs mb-1">Next Update</p>
                      <p className="text-lg font-bold text-yellow-400 animate-pulse">
                        {timeRemaining}s
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded p-3 border border-gray-700/50">
                      <p className="text-gray-400 text-xs mb-1">Risk Level</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-default ${getRiskBadgeStyle(verdict?.riskLevel)}`}
                      >
                        {verdict?.riskLevel || "MEDIUM"}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <p className="text-sm text-gray-400 text-center">
                    💡{" "}
                    <span className="text-cyan-400">
                      Click on any coin below
                    </span>{" "}
                    to spotlight it here
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* All Crypto Assets */}
          <div>
            <h2 className="text-2xl font-bold mb-4">All Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cryptoData.map((crypto) => (
                <CryptoCard
                  key={crypto.id}
                  crypto={crypto}
                  onFocus={setFeaturedCoin}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
