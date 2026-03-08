"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, RefreshCw } from "lucide-react";
import CryptoCard from "../components/CryptoCard";
import { CryptoData, formatPrice, getChangeColor } from "../utils";

interface CustomCoin {
  id: string;
  name: string;
  symbol: string;
  customName: string;
}

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
}

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<CustomCoin[]>([]);
  const [watchlistData, setWatchlistData] = useState<CryptoData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Load watchlist from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("watchlist");
    if (stored) {
      setWatchlist(JSON.parse(stored));
    }
  }, []);

  // Search for coins
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${query}`,
      );
      const data = await response.json();
      const results = data.coins.slice(0, 10).map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
      }));
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  // Add coin to watchlist
  const addToWatchlist = (result: SearchResult) => {
    if (watchlist.some((c) => c.id === result.id)) {
      alert("Already in watchlist!");
      return;
    }

    const newCoin: CustomCoin = {
      id: result.id,
      name: result.name,
      symbol: result.symbol,
      customName: result.name,
    };

    const updated = [...watchlist, newCoin];
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  // Remove from watchlist
  const removeFromWatchlist = (id: string) => {
    const updated = watchlist.filter((c) => c.id !== id);
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  // Fetch watchlist data
  const fetchWatchlistData = async () => {
    if (watchlist.length === 0) return;

    setLoading(true);
    try {
      const ids = watchlist.map((c) => c.id).join(",");
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_market_cap_rank=true`,
      );
      const data = await response.json();

      const cryptoList = watchlist.map((coin) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.customName,
        icon: "⭐",
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        price: data[coin.id]?.usd || 0,
        change24h: data[coin.id]?.usd_24h_change || 0,
        marketCap: data[coin.id]?.usd_market_cap || 0,
        volume24h: data[coin.id]?.usd_24h_vol || 0,
        marketCapRank: data[coin.id]?.market_cap_rank || 0,
      }));

      setWatchlistData(cryptoList);
    } catch (err) {
      console.error("Error fetching watchlist data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlistData();
    const interval = setInterval(fetchWatchlistData, 15000);
    return () => clearInterval(interval);
  }, [watchlist]);

  const getRiskBg = (change: number) => {
    const absChange = Math.abs(change);
    if (absChange < 2) return "border-green-500";
    if (absChange < 5) return "border-yellow-500";
    return "border-red-500";
  };

  const getRiskLabel = (change: number) => {
    const absChange = Math.abs(change);
    if (absChange < 2) return { color: "bg-green-600", text: "LOW VOLATILITY" };
    if (absChange < 5)
      return { color: "bg-yellow-600", text: "MEDIUM VOLATILITY" };
    return { color: "bg-red-600", text: "HIGH VOLATILITY" };
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Custom Watchlist
          </h1>
          <p className="text-gray-400 mt-2">
            Add any cryptocurrency to track and analyze
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Coin
          </button>

          {watchlistData.length > 0 && (
            <button
              onClick={fetchWatchlistData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Search Section */}
      {showSearch && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Search for Cryptocurrency</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name or symbol (e.g., BNB, Ethereum, Ripple)..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-3 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Close
              </button>
            </div>

            {searching && <p className="text-gray-400">Searching...</p>}

            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => addToWatchlist(result)}
                    className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-left transition-all border border-gray-600 hover:border-blue-500"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{result.name}</p>
                        <p className="text-sm text-gray-400">{result.symbol}</p>
                      </div>
                      <Plus className="w-5 h-5 text-blue-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Watchlist Display */}
      {watchlistData.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <p className="text-gray-400 mb-4">No coins in your watchlist yet</p>
          <button
            onClick={() => setShowSearch(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Your First Coin
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {watchlistData.map((crypto) => (
              <div
                key={crypto.id}
                className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 border-gray-700 ${getRiskBg(crypto.change24h)} transition-all hover:shadow-lg group relative`}
              >
                <button
                  onClick={() => removeFromWatchlist(crypto.id)}
                  className="absolute top-3 right-3 p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-all"
                  title="Remove from watchlist"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>

                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{crypto.name}</h3>
                      <p className="text-gray-400 text-sm">{crypto.symbol}</p>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-bold text-white inline-block ${getRiskLabel(crypto.change24h).color}`}
                  >
                    {getRiskLabel(crypto.change24h).text}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Price</p>
                    <p className="text-2xl font-bold">
                      {formatPrice(crypto.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">24h Change</p>
                    <p
                      className={`text-lg font-semibold ${getChangeColor(crypto.change24h)}`}
                    >
                      {crypto.change24h >= 0 ? "↑" : "↓"}{" "}
                      {Math.abs(crypto.change24h).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Full Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {watchlistData.map((crypto) => (
                <CryptoCard key={crypto.id} crypto={crypto} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
