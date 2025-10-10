// TopNav.jsx
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function TopNav({ sidebarOpen }) {
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`flex items-center justify-between px-6 py-3 bg-black border-b border-gold/50 z-50 ${
        sidebarOpen ? "pl-[250px]" : "pl-[90px]"
      } transition-all duration-300`}
    >
      <h1 className="text-gold font-bold text-xl sm:text-2xl">Junk Buddies</h1>

      <div className="hidden md:flex max-w-lg mx-8 relative w-full">
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
    </motion.header>
  );
}
