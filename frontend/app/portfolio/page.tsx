"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Plus, Trash2 } from "lucide-react";
import CryptoCard from "../components/CryptoCard";
import { CryptoData, formatPrice, fetchCryptoData } from "../utils";

interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  cost: number;
}

export default function Portfolio() {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    amount: "",
    cost: "",
  });

  const loadCryptoData = async () => {
    setLoading(true);
    try {
      const data = await fetchCryptoData();
      setCryptoData(data);
    } catch (err) {
      console.error("Error fetching crypto data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCryptoData();
    const interval = setInterval(loadCryptoData, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("portfolio");
    if (stored) setAssets(JSON.parse(stored));
  }, []);

  const savePortfolio = (newAssets: PortfolioAsset[]) => {
    setAssets(newAssets);
    localStorage.setItem("portfolio", JSON.stringify(newAssets));
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.amount || !formData.cost) return;

    const crypto = cryptoData.find(
      (c) => c.symbol === formData.symbol.toUpperCase(),
    );
    if (!crypto) return;

    const newAsset: PortfolioAsset = {
      id: Date.now().toString(),
      symbol: crypto.symbol,
      name: crypto.name,
      amount: parseFloat(formData.amount),
      cost: parseFloat(formData.cost),
    };

    savePortfolio([...assets, newAsset]);
    setFormData({ symbol: "", amount: "", cost: "" });
  };

  const handleRemoveAsset = (id: string) => {
    savePortfolio(assets.filter((a) => a.id !== id));
  };

  const calculateStats = () => {
    let totalValue = 0;
    let totalInvested = 0;

    assets.forEach((asset) => {
      const crypto = cryptoData.find((c) => c.symbol === asset.symbol);
      if (crypto) {
        totalValue += asset.amount * crypto.price;
      }
      totalInvested += asset.amount * asset.cost;
    });

    const gain = totalValue - totalInvested;
    const gainPercent = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

    return { totalValue, totalInvested, gain, gainPercent };
  };

  const stats = calculateStats();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
        My Portfolio
      </h1>
      <p className="text-gray-400 mb-8">
        Track and manage your crypto holdings
      </p>

      {/* Portfolio Summary */}
      {assets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Total Value</p>
            <p className="text-2xl font-bold text-cyan-400">
              {formatPrice(stats.totalValue)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Total Invested</p>
            <p className="text-2xl font-bold text-gray-300">
              {formatPrice(stats.totalInvested)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Total Gain/Loss</p>
            <p
              className={`text-2xl font-bold ${stats.gain >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {formatPrice(stats.gain)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Return %</p>
            <p
              className={`text-2xl font-bold ${stats.gainPercent >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {stats.gainPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {/* Add Asset Form */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Add Asset</h2>
        <form
          onSubmit={handleAddAsset}
          className="flex flex-col md:flex-row gap-4"
        >
          <select
            value={formData.symbol}
            onChange={(e) =>
              setFormData({ ...formData, symbol: e.target.value })
            }
            className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select Cryptocurrency</option>
            {cryptoData.map((crypto) => (
              <option key={crypto.id} value={crypto.symbol}>
                {crypto.name} ({crypto.symbol})
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount"
            step="0.00000001"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
          />

          <input
            type="number"
            placeholder="Cost per unit"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>
      </div>

      {/* Portfolio Holdings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Holdings</h2>
          <button
            onClick={fetchCryptoData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {assets.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <p className="text-gray-400">
              No assets yet. Add one to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assets.map((asset) => {
              const crypto = cryptoData.find((c) => c.symbol === asset.symbol);
              if (!crypto) return null;

              const currentValue = asset.amount * crypto.price;
              const investedValue = asset.amount * asset.cost;
              const assetGain = currentValue - investedValue;
              const assetGainPercent =
                investedValue > 0 ? (assetGain / investedValue) * 100 : 0;

              return (
                <div
                  key={asset.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: crypto.color }}
                    >
                      {crypto.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {asset.name} ({asset.symbol})
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {asset.amount} {asset.symbol} @{" "}
                        {formatPrice(asset.cost)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <p className="font-bold text-lg">
                      {formatPrice(currentValue)}
                    </p>
                    <p
                      className={`text-sm font-semibold ${assetGainPercent >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {assetGainPercent >= 0 ? "+" : ""}
                      {assetGainPercent.toFixed(2)}%
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemoveAsset(asset.id)}
                    className="p-2 hover:bg-red-600/20 rounded-lg transition-all text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Coins */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Cryptocurrencies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cryptoData.map((crypto) => (
            <CryptoCard key={crypto.id} crypto={crypto} />
          ))}
        </div>
      </div>
    </div>
  );
}
