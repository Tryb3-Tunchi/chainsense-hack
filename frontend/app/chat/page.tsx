"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm ChainSense AI, your crypto market analyst. Ask me anything about cryptocurrency markets, risk analysis, or trading strategies. I can help you understand market trends and make informed decisions.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Simulate AI response based on keywords
      let responseText = "";

      if (
        input.toLowerCase().includes("bitcoin") ||
        input.toLowerCase().includes("btc")
      ) {
        responseText =
          "Bitcoin is the leading cryptocurrency with the largest market cap. Recent market data shows BTC has strong correlation with overall market sentiment. Consider checking our dashboard for real-time BTC prices and AI-generated risk assessment.";
      } else if (
        input.toLowerCase().includes("ethereum") ||
        input.toLowerCase().includes("eth")
      ) {
        responseText =
          "Ethereum is the largest smart contract platform. With its shift to Proof-of-Stake, the network has become more efficient and environmentally friendly. Current ETH trading activity often reflects developer sentiment and DeFi usage patterns.";
      } else if (
        input.toLowerCase().includes("risk") ||
        input.toLowerCase().includes("analysis")
      ) {
        responseText =
          "Our AI continuously analyzes market data to assess risk levels. We evaluate 24-hour price changes, market volatility, and trading volume. Risk is classified as LOW, MEDIUM, or HIGH to help you make informed decisions.";
      } else if (
        input.toLowerCase().includes("portfolio") ||
        input.toLowerCase().includes("holdings")
      ) {
        responseText =
          "You can track your crypto holdings in the Portfolio section. Add your assets, set your cost basis, and monitor real-time gains/losses. The portfolio automatically calculates your P&L based on current market prices.";
      } else if (
        input.toLowerCase().includes("price") ||
        input.toLowerCase().includes("cost")
      ) {
        responseText =
          "Prices update every 15 seconds in real-time from multiple sources. Visit the Dashboard to see current prices for Bitcoin, Ethereum, Solana, Cardano, and other major cryptocurrencies with 24-hour changes and market data.";
      } else {
        responseText = `That's an interesting question about crypto markets. The cryptocurrency space is dynamic and involves various factors like adoption, regulation, technology updates, and market sentiment. For specific price information and market analysis, check our real-time Dashboard. Would you like to know about any specific coin or market condition?`;
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-950">
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md lg:max-w-xl px-4 py-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-100 border border-gray-700"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-100 border border-gray-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin text-blue-400" />
                <p className="text-sm">AI is thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about crypto markets, risk analysis, or trading strategies..."
              disabled={loading}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            💡 Ask about specific coins (Bitcoin, Ethereum), risk levels,
            portfolio tracking, or market trends.
          </p>
        </div>
      </div>
    </div>
  );
}
