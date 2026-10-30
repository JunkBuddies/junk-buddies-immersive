// SideNav.jsx
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { goToPriceMirror } from "../utils/mirrorNavigation";
import {
  Home,
  Calculator,
  ClipboardList,
  MapPin,
  BookOpen,
  HelpCircle,
} from "lucide-react";

export default function SideNav({ open }) {
  const navigate = useNavigate();
  const openPriceMirror = () => goToPriceMirror(navigate);

  return (
    <motion.aside
      className="hidden lg:flex fixed top-16 left-0 h-[calc(100vh-4rem)] bg-black border-r border-gold z-40 flex-col shadow-2xl"
      animate={{ width: 240, x: open ? 0 : -240, opacity: open ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Vertical nav icons (centered) */}
      <nav className="flex flex-col justify-center items-start gap-2 flex-1 px-3">
        <NavItem to="/" icon={<Home />} label="Home" open={open} />
        <button
          onClick={openPriceMirror}
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
        <NavItem to="/lookup" icon={<ClipboardList />} label="Order Lookup" open={open} />
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
