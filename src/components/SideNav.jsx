// SideNav.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Calculator,
  MapPin,
  BookOpen,
  HelpCircle,
  ClipboardList,
} from "lucide-react";

export default function SideNav() {
  const [open, setOpen] = useState(true);

  return (
    <motion.aside
      animate={{ width: open ? 220 : 70 }}
      transition={{ duration: 0.3 }}
      className={`hidden lg:flex flex-col h-screen bg-black/95 border-r border-gold/30 text-white fixed top-0 left-0 z-40`}
    >
      {/* Menu Toggle (merged look) */}
      <div className="flex items-center justify-end px-4 pt-4">
        <button
          onClick={() => setOpen(!open)}
          className="text-gold hover:text-white transition"
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 mt-6">
        <NavItem to="/" icon={<Home />} label="Home" open={open} />
        <NavItem to="/itemized" icon={<Calculator />} label="Instant Pricing" open={open} />
        <NavItem to="/load-size" icon={<ClipboardList />} label="Load Sizes" open={open} />
        <NavItem to="/service-areas" icon={<MapPin />} label="Cities" open={open} />
        <NavItem to="/blog" icon={<BookOpen />} label="Blog" open={open} />
        <NavItem to="/faq" icon={<HelpCircle />} label="FAQ" open={open} />
      </nav>

      <div className="flex-1"></div>

      {/* Footer text */}
      {open && (
        <div className="px-4 py-4 text-xs text-gold/60">
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
      className="flex items-center gap-3 text-gray-200 hover:text-gold px-4 py-2 transition"
    >
      <span>{icon}</span>
      {open && <span className="text-sm">{label}</span>}
    </Link>
  );
}
