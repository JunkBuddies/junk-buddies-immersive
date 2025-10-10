// TopNavMobile.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Search, Home, Menu } from "lucide-react";
import { Link } from "react-router-dom";

export default function TopNavMobile() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <motion.header
        className="flex items-center justify-between px-4 py-3 bg-black border-b border-gold/30 fixed top-0 left-0 right-0 z-50"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <button className="text-gold"><Menu /></button>
        <h1 className="text-gold font-bold text-lg">Junk Buddies</h1>
        <button className="text-gold" onClick={() => setSearchOpen(true)}>
          <Search />
        </button>
      </motion.header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed inset-0 bg-black flex flex-col items-center justify-start pt-20 px-6 z-50"
          >
            <input
              autoFocus
              type="text"
              placeholder="Search items, pricing, or cities..."
              className="w-full p-3 rounded-full bg-zinc-900 border border-gold/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <div className="mt-6 flex flex-col gap-3 text-center">
              <QuickLink to="/itemized" label="💬 Junk Buddies Assistant" />
              <QuickLink to="/itemized" label="💰 Instant Price Calculator" />
              <QuickLink to="/load-size" label="🚛 Load Sizes" />
              <QuickLink to="/schedule" label="📅 Schedule Pickup" />
              <button
                className="text-gold mt-8 text-sm underline"
                onClick={() => setSearchOpen(false)}
              >
                Close Search
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function QuickLink({ to, label }) {
  return (
    <Link
      to={to}
      className="bg-zinc-900/60 border border-gold/30 text-gold px-5 py-2 rounded-full text-sm hover:bg-gold hover:text-black transition"
    >
      {label}
    </Link>
  );
}
