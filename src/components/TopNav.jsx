// TopNav.jsx
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function TopNav() {
  return (
    <motion.header
      initial={{ y: -25, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-black border-b border-gold flex items-center justify-between px-6"
    >
      {/* Left: logo / name */}
      <div className="flex items-center gap-3">
        <img
          src="/logo192.png"
          alt="Junk Buddies Logo"
          className="w-8 h-8 object-contain"
        />
        <h1 className="text-gold font-bold text-lg">Junk Buddies</h1>
      </div>

      {/* Center: search bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <input
            type="search"
            placeholder="Search items, pricing, or cities..."
            className="w-full px-4 py-2 rounded-full bg-zinc-900 border border-gold/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
          <Search
            className="absolute right-3 top-2.5 text-gold pointer-events-none"
            size={20}
          />
        </div>
      </div>

      {/* Right side space left open for symmetry */}
      <div className="w-8" />
    </motion.header>
  );
}
