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
  const openChatWidget = useCallback(() => {
    const trigger = document.querySelector(".jb-chat-bubble, .chat-widget-trigger");
    if (trigger) trigger.click();
  }, []);

  return (
    <motion.aside
      className="hidden lg:flex fixed top-0 left-0 h-screen bg-black border-r border-gold z-40 flex-col"
      animate={{ width: open ? 240 : 80 }}
      transition={{ duration: 0.3 }}
    >
      {/* Collapse button in top corner */}
      <div className="flex items-center justify-between w-full px-3 py-3 border-b border-gold/40 h-16">
        {open && <span className="text-gold font-semibold text-sm">Navigation</span>}
        <button
          onClick={() => setOpen(!open)}
          className="text-gold hover:text-white transition"
          title="Toggle sidebar"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Navigation links (vertically centered) */}
      <nav className="flex flex-col justify-center items-start gap-2 flex-1 px-3">
        <NavItem to="/" icon={<Home />} label="Home" open={open} />
        <button
          onClick={openChatWidget}
          className="flex items-center gap-3 w-full text-gray-200 hover:text-gold px-3 py-2 transition rounded"
          title="Instant Pricing"
        >
          <Calculator />
          {open && <span className="text-sm">Instant Pricing</span>}
        </button>
        <NavItem to="/itemized" icon={<ClipboardList />} label="Manual Selection" open={open} />
        <NavItem to="/service-areas" icon={<MapPin />} label="Cities" open={open} />
        <NavItem to="/blog" icon={<BookOpen />} label="Blog" open={open} />
        <NavItem to="/faq" icon={<HelpCircle />} label="FAQ" open={open} />
      </nav>

      {open && (
        <div className="px-4 py-4 text-xs text-gold/60 border-t border-gold/40">
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
      className="flex items-center gap-3 text-gray-200 hover:text-gold w-full px-3 py-2 rounded transition"
    >
      {icon}
      {open && <span className="text-sm">{label}</span>}
    </Link>
  );
}
