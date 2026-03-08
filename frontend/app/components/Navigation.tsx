"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  MessageSquare,
  Activity,
  TrendingUp,
  Star,
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              ChainSense
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive("/")
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/portfolio"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive("/portfolio")
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Portfolio</span>
            </Link>

            <Link
              href="/watchlist"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive("/watchlist")
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Watchlist</span>
            </Link>

            <Link
              href="/chat"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive("/chat")
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Chat</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
