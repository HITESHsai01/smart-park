"use client";

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

interface MapNavbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSearchClick: () => void;
}

export default function MapNavbar({
  searchInput,
  onSearchChange,
  onSearchKeyDown,
  onSearchClick,
}: MapNavbarProps) {
  return (
    <div className="flex-shrink-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1f1f1f] py-4">
      <div className="flex items-center justify-between">
        {/* Back + Title */}
        <div className="flex items-center gap-4 text-white pl-2">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 bg-[#1a1a1a] rounded-full hover:bg-[#2a2a2a] transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="pl-2">
            <h1 className="text-lg font-semibold">Find Parking</h1>
            <p className="text-gray-500 text-xs">Choose your parking spot easily</p>
          </div>
        </div>

        {/* Search Bar (desktop) */}
        <div className="hidden md:flex flex-1 justify-center pr-6">
          <div className="w-full max-w-md relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Search location..."
              className="w-full bg-[#111111] text-white placeholder-gray-500 px-5 py-2.5 rounded-full border border-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
            <button
              onClick={onSearchClick}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="w-[120px]" />
      </div>
    </div>
  );
}