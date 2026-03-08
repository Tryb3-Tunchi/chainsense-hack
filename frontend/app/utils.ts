export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  color: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  marketCapRank: number;
}

export interface Verdict {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  summary: string;
  btcPrice: number;
  btcChange: string;
  ethPrice: number;
  ethChange: string;
  timestamp: string;
}

export const CRYPTO_COINS = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    icon: "₿",
    color: "#f7931a",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    icon: "Ξ",
    color: "#627eea",
  },
  { id: "solana", symbol: "SOL", name: "Solana", icon: "◎", color: "#14f195" },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    icon: "₳",
    color: "#0033ad",
  },
  { id: "ripple", symbol: "XRP", name: "XRP", icon: "✕", color: "#23292f" },
  {
    id: "polkadot",
    symbol: "DOT",
    name: "Polkadot",
    icon: "●",
    color: "#e6007a",
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    icon: "🐕",
    color: "#ba9f33",
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    icon: "⛓",
    color: "#375bd2",
  },
  { id: "monero", symbol: "XMR", name: "Monero", icon: "₥", color: "#ff6600" },
  {
    id: "polygon",
    symbol: "MATIC",
    name: "Polygon",
    icon: "P",
    color: "#8247e5",
  },
  {
    id: "uniswap",
    symbol: "UNI",
    name: "Uniswap",
    icon: "∞",
    color: "#ff007a",
  },
  {
    id: "litecoin",
    symbol: "LTC",
    name: "Litecoin",
    icon: "Ł",
    color: "#345d9d",
  },
];

export const formatPrice = (price: number | undefined) => {
  if (!price) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatMarketCap = (value: number | undefined) => {
  if (!value) return "$0";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(0)}`;
};

export const formatChange = (change: number | string | undefined) => {
  if (!change) return "0%";
  const num = typeof change === "string" ? parseFloat(change) : change;
  return num >= 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`;
};

export const getRiskColor = (level: string) => {
  switch (level) {
    case "LOW":
      return "bg-green-500";
    case "MEDIUM":
      return "bg-yellow-500";
    case "HIGH":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export const getRiskTextColor = (level: string) => {
  switch (level) {
    case "LOW":
      return "text-green-400";
    case "MEDIUM":
      return "text-yellow-400";
    case "HIGH":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
};

export const getRiskBadgeStyle = (level: string | undefined) => {
  const l = level || "MEDIUM";
  switch (l) {
    case "LOW":
      return "bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30";
    case "MEDIUM":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/30";
    case "HIGH":
      return "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/50 hover:bg-gray-500/30";
  }
};

export const getChangeColor = (change: number | string | undefined) => {
  if (!change) return "text-gray-400";
  const num = typeof change === "string" ? parseFloat(change) : change;
  return num >= 0 ? "text-green-400" : "text-red-400";
};

export const fetchCryptoData = async (): Promise<CryptoData[]> => {
  const coinIds = CRYPTO_COINS.map((c) => c.id).join(",");
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_market_cap_rank=true`,
    { cache: "no-store" },
  );

  if (!response.ok) throw new Error("Failed to fetch crypto data");

  const data = await response.json();

  return CRYPTO_COINS.map((coin) => ({
    ...coin,
    price: data[coin.id]?.usd || 0,
    change24h: data[coin.id]?.usd_24h_change || 0,
    marketCap: data[coin.id]?.usd_market_cap || 0,
    volume24h: data[coin.id]?.usd_24h_vol || 0,
    marketCapRank: data[coin.id]?.market_cap_rank || 0,
  }));
};

export const fetchSingleCoinData = async (
  id: string,
): Promise<CryptoData | null> => {
  const coin = CRYPTO_COINS.find((c) => c.id === id);
  if (!coin) return null;

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_market_cap_rank=true`,
      { cache: "no-store" },
    );

    if (!response.ok) throw new Error("Failed to fetch coin data");

    const data = await response.json();

    return {
      ...coin,
      price: data[id]?.usd || 0,
      change24h: data[id]?.usd_24h_change || 0,
      marketCap: data[id]?.usd_market_cap || 0,
      volume24h: data[id]?.usd_24h_vol || 0,
      marketCapRank: data[id]?.market_cap_rank || 0,
    };
  } catch (err) {
    console.error(`Error fetching data for ${id}:`, err);
    return {
      ...coin,
      price: 0,
      change24h: 0,
      marketCap: 0,
      volume24h: 0,
      marketCapRank: 0,
    };
  }
};

export const fetchVerdict = async () => {
  const response = await fetch(
    `https://api.jsonbin.io/v3/b/${process.env.NEXT_PUBLIC_JSONBIN_BIN_ID}/latest`,
    {
      headers: {
        "X-Master-Key": process.env.NEXT_PUBLIC_JSONBIN_API_KEY!,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) throw new Error("Failed to fetch verdict");

  const data = await response.json();
  return data.record as Verdict;
};
