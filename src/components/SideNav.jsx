// SideNav.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Calculator, MapPin, BookOpen, HelpCircle, ClipboardList, Menu } from "lucide-react";

export default function SideNav() {
  const [open, setOpen] = useState(true);

  return (
    <motion.aside
      animate={{ width: open ? 240 : 80 }}
      transition={{ duration: 0.3 }}
      className="hidden lg:flex flex-col items-center justify-center h-screen bg-black border-r border-gold/30 fixed top-0 left-0 z-40"
    >
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-4 right-3 text-gold hover:text-white transition"
      >
        <Menu size={24} />
      </button>

      <nav className="flex flex-col items-start justify-center gap-4 w-full px-4">
        <NavItem to="/" icon={<Home />} label="Home" open={open} />
        <NavItem to="/itemized" icon={<Calculator />} label="Instant Pricing" open={open} />
        <NavItem to="/load-size" icon={<ClipboardList />} label="Load Sizes" open={open} />
        <NavItem to="/service-areas" icon={<MapPin />} label="Cities" open={open} />
        <NavItem to="/blog" icon={<BookOpen />} label="Blog" open={open} />
        <NavItem to="/faq" icon={<HelpCircle />} label="FAQ" open={open} />
      </nav>

      {open && (
        <div className="absolute bottom-5 text-xs text-gold/60 text-center w-full">
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
      className="flex items-center gap-3 text-gray-200 hover:text-gold w-full px-3 py-2 transition"
    >
      {icon}
      {open && <span className="text-sm">{label}</span>}
    </Link>
  );
}
