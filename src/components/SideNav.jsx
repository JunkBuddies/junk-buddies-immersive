// SideNav.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Home,
  Calculator,
  ClipboardList,
  MapPin,
  BookOpen,
  HelpCircle,
  Menu,
} from "lucide-react";
import { useCallback } from "react";

export default function SideNav({ open, setOpen }) {
  // Open your existing chat widget (Instant Pricing)
  const openChatWidget = useCallback(() => {
    const selectors = [
      "#jb-open-button",
      ".jb-chat-bubble",
      ".chat-widget-trigger",
      "[data-open-chat]",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        el.click();
        return;
      }
    }
    // Fallback: custom event your widget can listen for
    window.dispatchEvent(new CustomEvent("jb:openChat"));
  }, []);

  return (
    <motion.aside
      // Solid, not transparent; border on the right to meet TopNav’s bottom border visually
      className="hidden lg:flex fixed top-0 left-0 h-screen bg-black border-r border-gold/50 z-40"
      animate={{ width: open ? 240 : 80 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header row with collapse button (in SideNav, not TopNav) */}
      <div className="w-full flex items-center justify-between px-4 py-3 border-b border-gold/30">
        {open ? (
          <span className="text-gold font-bold text-sm">Navigation</span>
        ) : (
          <span className="sr-only">Navigation</span>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="text-gold hover:text-white transition"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Vertically centered nav items */}
      <nav className="flex flex-col justify-center items-start gap-2 w-full px-3">
        <NavItem to="/" icon={<Home />} label="Home" open={open} />

        {/* Instant Pricing → chat widget (no route change) */}
        <button
          onClick={openChatWidget}
          className="flex items-center gap-3 w-full text-gray-200 hover:text-gold px-3 py-2 rounded transition"
          title="Instant Pricing"
        >
          <Calculator />
          {open && <span className="text-sm">Instant Pricing</span>}
        </button>

        {/* Manual selection (Itemized page) */}
        <NavItem
          to="/itemized"
          icon={<ClipboardList />}
          label="Manual Selection"
          open={open}
        />

        <NavItem
          to="/service-areas"
          icon={<MapPin />}
          label="Cities"
          open={open}
        />
        <NavItem to="/blog" icon={<BookOpen />} label="Blog" open={open} />
        <NavItem to="/faq" icon={<HelpCircle />} label="FAQ" open={open} />
      </nav>

      {/* Footer (kept minimal; no layout changes) */}
      {open && (
        <div className="absolute bottom-3 left-0 right-0 px-4 text-[11px] text-gold/60">
          © {new Date().getFullYear()} Junk Buddies
        </div>
      )}
    </motion.aside>
  );
}

function NavItem({ to, icon, label, open }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 w-full text-gray-200 hover:text-gold px-3 py-2 rounded transition"
    >
      <span>{icon}</span>
      {open && <span className="text-sm">{label}</span>}
    </Link>
  );
}
