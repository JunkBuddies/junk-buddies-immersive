// TopNav.jsx
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  Home,
  Calculator,
  ClipboardList,
  MapPin,
  BookOpen,
  HelpCircle,
  X,
} from "lucide-react";

export default function TopNav({ sidebarOpen, setSidebarOpen }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const closeSearch = () => setSearchOpen(false);

  const openChatWidget = useCallback(() => {
    const trigger = document.querySelector(".jb-chat-bubble, .chat-widget-trigger, #jb-open-button");
    if (trigger) trigger.click();
    setSearchOpen(false);
  }, []);

  const go = (path) => {
    navigate(path);
    setSearchOpen(false);
  };

  const suggestions = [
    { label: "Home", icon: Home, action: () => go("/") },
    { label: "Instant Pricing", icon: Calculator, action: openChatWidget },
    { label: "Manual Selection", icon: ClipboardList, action: () => go("/itemized") },
    { label: "Cities", icon: MapPin, action: () => go("/service-areas") },
    { label: "Blog", icon: BookOpen, action: () => go("/blog") },
    { label: "FAQ", icon: HelpCircle, action: () => go("/faq") },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-[70] h-16 bg-black flex items-center border-b border-gold"
      >
        {/* Left controls remain independent from the viewport-centered search */}
        <div className="flex items-center gap-3 pl-4 z-10">
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

        {/* Exact viewport center — same 50vw centerline as the hero */}
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: "50vw", transform: "translate(-50%, -50%)" }}
        >
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-expanded={searchOpen}
            className="relative w-[min(32rem,46vw)] text-left"
          >
            <span className="block w-full px-5 py-2.5 pr-12 rounded-full bg-zinc-900 border border-gold/50 text-gray-400 hover:border-gold transition">
              Search items, pricing, or cities...
            </span>
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gold" size={20} />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {searchOpen && (
          <>
            {/* Page fade — starts below the fixed top bar */}
            <motion.button
              type="button"
              aria-label="Close search"
              className="fixed top-16 inset-x-0 bottom-0 z-[55] bg-black/65 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSearch}
            />

            {/* Large dropdown centered on the same physical screen axis */}
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="fixed top-[72px] z-[80] w-[min(720px,72vw)] rounded-2xl border border-gold/40 bg-zinc-950/95 shadow-2xl overflow-hidden"
              style={{ left: "50vw", transform: "translateX(-50%)" }}
            >
              <div className="p-4 border-b border-gold/20">
                <div className="relative">
                  <input
                    autoFocus
                    type="search"
                    placeholder="Search Junk Buddies..."
                    className="w-full rounded-xl bg-zinc-900 border border-gold/40 px-4 py-3 pr-11 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gold" size={20} />
                </div>
              </div>

              <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-[0.18em] text-gold/70">
                Suggested
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 pt-2">
                {suggestions.map(({ label, icon: Icon, action }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={action}
                    className="flex items-center gap-3 rounded-xl border border-gold/20 bg-zinc-900/70 px-4 py-4 text-left text-gray-100 hover:border-gold/60 hover:bg-zinc-900 transition"
                  >
                    <Icon className="text-gold shrink-0" size={22} />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={closeSearch}
                className="absolute right-6 top-7 text-gold/70 hover:text-gold sr-only"
                aria-label="Close search panel"
              >
                <X size={20} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
