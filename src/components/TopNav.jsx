// TopNav.jsx
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  Home,
  Calculator,
  ClipboardList,
  MapPin,
  BookOpen,
  HelpCircle,
} from "lucide-react";

export default function TopNav({ sidebarOpen, setSidebarOpen }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredSuggestions = suggestions.filter(({ label }) =>
    label.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const submitSearch = (event) => {
    event.preventDefault();
    const first = filteredSuggestions[0];
    if (first) first.action();
  };

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
          <form
            onSubmit={submitSearch}
            className="relative w-[min(32rem,46vw)] z-[90]"
          >
            <input
              type="search"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onClick={() => setSearchOpen(true)}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              aria-expanded={searchOpen}
              placeholder="Search items, pricing, or cities..."
              className={`block w-full px-5 py-2.5 pr-12 rounded-full bg-zinc-900 border text-white
                         placeholder-gray-400 outline-none cursor-text caret-gold transition
                         ${searchOpen
                           ? "border-gold shadow-[0_0_24px_rgba(212,175,55,0.16)]"
                           : "border-gold/50 hover:border-gold focus:border-gold"}`}
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gold hover:text-yellow-300 transition"
            >
              <Search size={20} />
            </button>
          </form>
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

            {/* Floating suggestions — no second search bar or enclosing panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[76px] left-0 z-[80] w-screen pointer-events-none"
            >
              <div
                className="mb-2 mx-auto w-[min(32rem,46vw)] text-center text-[11px] uppercase tracking-[0.2em] text-gold/65"
              >
                Suggested
              </div>
              <div className="flex flex-col items-center gap-1.5">
                {filteredSuggestions.length === 0 && (
                  <div className="pointer-events-auto w-[min(32rem,46vw)] px-4 py-4 text-center text-sm text-gray-400 bg-black/25 backdrop-blur-md rounded-xl">
                    No matching shortcut
                  </div>
                )}
                {filteredSuggestions.map(({ label, icon: Icon, action }, index) => (
                  <motion.button
                    key={label}
                    type="button"
                    onClick={action}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.035 }}
                    className="group pointer-events-auto relative flex w-[min(32rem,46vw)] items-center justify-center rounded-xl px-4 py-3 text-center text-gray-100
                               bg-black/35 border border-transparent backdrop-blur-md
                               hover:bg-zinc-900/75 hover:border-gold/30 transition"
                  >
                    <span className="absolute left-4 flex h-9 w-9 items-center justify-center rounded-lg bg-black/35 border border-gold/15">
                      <Icon className="text-gold/90 group-hover:text-gold" size={20} />
                    </span>
                    <span className="font-medium text-center">{label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
