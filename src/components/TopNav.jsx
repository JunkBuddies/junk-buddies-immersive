// TopNav.jsx
import { motion } from "framer-motion";
import { Search, Menu } from "lucide-react";
import { useState } from "react";

export default function TopNav() {
  const [open, setOpen] = useState(true);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between px-4 sm:px-8 py-3 bg-black/90 backdrop-blur-md border-b border-gold sticky top-0 z-50"
    >
      {/* Left Section: Merge point (Menu + Logo) */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setOpen(!open)}
          className="text-gold hover:text-white transition"
          aria-label="Toggle navigation menu"
        >
          <Menu size={26} />
        </button>
        <h1 className="text-gold font-bold text-xl sm:text-2xl">
          Junk Buddies
        </h1>
      </div>

      {/* Center Section: Search Bar (desktop only) */}
      <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
        <input
          type="search"
          placeholder="Search items, pricing, or cities..."
          className="w-full px-4 py-2 rounded-full bg-zinc-900 border border-gold/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
        />
        <Search
          className="absolute right-3 top-2.5 text-gold pointer-events-none"
          size={20}
        />
      </div>

      {/* Right Section: Quick icons */}
      <div className="flex items-center gap-4">
        <button className="hover:text-gold transition">🧭</button>
        <button className="hover:text-gold transition">⚙️</button>
      </div>
    </motion.header>
  );
}
