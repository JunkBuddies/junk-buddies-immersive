// TopNav.jsx
import { motion } from "framer-motion";
import { Search, Menu } from "lucide-react";

export default function TopNav({ sidebarOpen, setSidebarOpen }) {
  return (
    <motion.header
      initial={{ y: -25, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-black flex items-center justify-between border-b border-gold"
    >
      {/* Left: menu + logo */}
      <div className="flex items-center gap-3 pl-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gold hover:text-white transition mr-2"
          title="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        <img
          src="/images/logo-icon.png"
          alt="Junk Buddies Logo"
          className="w-9 h-9 object-contain"
        />
        <h1 className="text-gold font-bold text-lg hidden sm:block">Junk Buddies</h1>
      </div>

      {/* Center: search */}
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

      {/* Spacer right side */}
      <div className="w-8" />
    </motion.header>
  );
}
