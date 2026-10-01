// File: src/components/TopNavMobile.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { Search, X, Home, Sparkles, CalendarDays, MapPin, CircleHelp } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const goldStyle = {
  backgroundImage:
    "linear-gradient(180deg, #6f4d12 0%, #b88722 10%, #f6df86 22%, #fff7c7 31%, #d6a936 38%, #8a5c10 48%, #f2cf63 58%, #fff3ad 66%, #c18b20 75%, #765014 88%, #d4a63e 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
};

export default function TopNavMobile() {
  const [searchOpen, setSearchOpen] = useState(false);

  const openChatWidget = useCallback(() => {
    document.querySelector(".jb-chat-bubble, .chat-widget-trigger, #jb-open-button")?.click();
    setSearchOpen(false);
  }, []);

  return (
    <>
      <motion.header
        className="lg:hidden fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[#9b7a2e]/35 bg-[#090909]/95 px-3 backdrop-blur-xl"
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Link to="/" className="flex min-w-0 items-center gap-2" aria-label="Junk Buddies home">
          <img src="/images/logo-icon.png" alt="" className="h-7 w-7 shrink-0 object-contain" />
          <span className="truncate bg-clip-text text-sm font-bold text-transparent min-[360px]:text-base" style={goldStyle}>
            Junk Buddies
          </span>
        </Link>
        <button
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#d4b65e] active:bg-white/10"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
        >
          <Search size={21} />
        </button>
      </motion.header>

      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed inset-x-0 bottom-0 z-[70] border-t border-[#9b7a2e]/35 bg-[#090909]/96 px-1 backdrop-blur-xl"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 4px)" }}
      >
        <div className="mx-auto grid h-[62px] max-w-lg grid-cols-5">
          <MobileTab to="/" icon={Home} label="Home" />
          <button onClick={openChatWidget} className="group flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[#b8b1a2] active:bg-white/10" aria-label="Instant pricing">
            <Sparkles size={21} strokeWidth={1.8} className="text-[#d4b65e]" />
            <span className="max-w-full truncate text-[10px] font-medium leading-none">Price</span>
          </button>
          <MobileTab to="/schedule" icon={CalendarDays} label="Schedule" />
          <MobileTab to="/service-areas" icon={MapPin} label="Areas" />
          <MobileTab to="/faq" icon={CircleHelp} label="Help" />
        </div>
      </nav>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="searchOverlay"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex flex-col bg-black/95 px-4 pb-24 pt-[max(72px,env(safe-area-inset-top))] backdrop-blur-md"
          >
            <div className="mb-5 flex w-full items-center justify-between">
              <h2 className="text-base font-semibold text-[#d4b65e]">Search Junk Buddies</h2>
              <button className="grid h-11 w-11 place-items-center rounded-full text-[#d4b65e] active:bg-white/10" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X size={24} />
              </button>
            </div>
            <div className="relative mb-5 w-full">
              <input autoFocus type="text" placeholder="Search items, pricing, or cities..." className="h-12 w-full rounded-full border border-[#9b7a2e]/45 bg-zinc-900 px-4 pr-11 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c8a74a]/50" />
              <Search className="pointer-events-none absolute right-4 top-3.5 text-[#d4b65e]" size={19} />
            </div>
            <div className="flex w-full flex-col gap-3 text-center">
              <QuickLink onClick={openChatWidget} label="Instant Pricing" />
              <QuickLink to="/itemized" label="Manual Item Selection" />
              <QuickLink to="/load-size" label="Load Size Guide" />
              <QuickLink to="/service-areas" label="Cities We Serve" />
              <QuickLink to="/faq" label="FAQ" />
              <QuickLink to="/blog" label="Blog Articles" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileTab({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `group flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 active:bg-white/10 ${isActive ? "text-[#e0c56e]" : "text-[#b8b1a2]"}`
      }
    >
      <Icon size={21} strokeWidth={1.8} />
      <span className="max-w-full truncate text-[10px] font-medium leading-none">{label}</span>
    </NavLink>
  );
}

function QuickLink({ to, label, onClick }) {
  const shared = "flex min-h-12 w-full items-center justify-center rounded-2xl border border-[#9b7a2e]/35 bg-zinc-900/70 px-4 text-sm text-[#d4b65e] active:bg-[#b89536] active:text-black";
  return onClick ? <button onClick={onClick} className={shared}>{label}</button> : <Link to={to} onClick={() => {}} className={shared}>{label}</Link>;
}
