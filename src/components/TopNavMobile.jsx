// File: src/components/TopNavMobile.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { Search, Home, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function TopNavMobile() {
  const [searchOpen, setSearchOpen] = useState(false);

  // ⬇️ Trigger the AI Chat Widget (same as desktop)
  const openChatWidget = useCallback(() => {
    const trigger = document.querySelector(".jb-chat-bubble, .chat-widget-trigger");
    if (trigger) trigger.click();
    setSearchOpen(false);
  }, []);

  return (
    <>
      {/* === TOP NAV BAR (mobile only) === */}
      <motion.header
        className="lg:hidden flex items-center justify-between px-4 py-3 bg-black border-b border-gold/40 fixed top-0 left-0 right-0 z-50"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {/* Left: menu icon (can later toggle a bottom nav or drawer if needed) */}
        <button className="text-gold">
          <Menu />
        </button>

        {/* Center: logo / brand */}
        <div className="flex items-center gap-2">
          <img
            src="/images/logo-icon.png"
            alt="Junk Buddies Logo"
            className="w-7 h-7 object-contain"
          />
          <h1 className="text-gold font-bold text-lg">Junk Buddies</h1>
        </div>

        {/* Right: search icon */}
        <button
          className="text-gold"
          onClick={() => setSearchOpen(true)}
          aria-label="Open search"
        >
          <Search />
        </button>
      </motion.header>

      {/* === FULLSCREEN SEARCH OVERLAY === */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="searchOverlay"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-start pt-20 px-6 z-[100]"
          >
            {/* Header Row */}
            <div className="flex items-center justify-between w-full mb-6">
              <h2 className="text-gold text-lg font-semibold">Search Junk Buddies</h2>
              <button
                className="text-gold hover:text-white transition"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full mb-6">
              <input
                autoFocus
                type="text"
                placeholder="Search items, pricing, or cities..."
                className="w-full p-3 rounded-full bg-zinc-900 border border-gold/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
              <Search
                className="absolute right-3 top-3 text-gold pointer-events-none"
                size={18}
              />
            </div>

            {/* Suggested Quick Links */}
            <div className="flex flex-col gap-3 w-full text-center">
              <QuickLink onClick={openChatWidget} label="💬 Instant Pricing (AI Assistant)" />
              <QuickLink to="/itemized" label="📋 Manual Item Selection" />
              <QuickLink to="/load-size" label="🚛 Load Size Guide" />
              <QuickLink to="/service-areas" label="📍 Cities We Serve" />
              <QuickLink to="/faq" label="❓ FAQ" />
              <QuickLink to="/blog" label="📰 Blog Articles" />
            </div>

            {/* Close link */}
            <button
              className="text-gold mt-10 text-sm underline"
              onClick={() => setSearchOpen(false)}
            >
              Close Search
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function QuickLink({ to, label, onClick }) {
  const shared =
    "bg-zinc-900/60 border border-gold/30 text-gold px-5 py-2 rounded-full text-sm hover:bg-gold hover:text-black transition w-full";
  return onClick ? (
    <button onClick={onClick} className={shared}>
      {label}
    </button>
  ) : (
    <Link to={to} className={shared}>
      {label}
    </Link>
  );
}
