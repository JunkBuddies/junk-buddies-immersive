// SideNav.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCallback } from "react";
import { Home, Calculator, MapPin, BookOpen, HelpCircle, ClipboardList, Menu } from "lucide-react";

export default function SideNav({ open, setOpen }) {
  const handleInstantPricing = useCallback(() => {
    const widgetButton = document.querySelector(".jb-chat-bubble, .chat-widget-trigger");
    if (widgetButton) widgetButton.click();
  }, []);

  return (
    <motion.aside
      animate={{ width: open ? 240 : 80 }}
      transition={{ duration: 0.3 }}
      className="hidden lg:flex flex-col h-screen bg-black border-r border-gold/50 fixed top-0 left-0 z-40"
    >
      <div className="flex items-center justify-between p-4 border-b border-gold/30">
        <h1 className={`${open ? "text-gold text-lg font-bold" : "hidden"}`}>JB</h1>
        <button
          onClick={() => setOpen(!open)}
          className="text-gold hover:text-white transition"
        >
          <Menu size={22} />
        </button>
      </div>

      <nav className="flex flex-col items-start justify-center gap-2 px-3 mt-10 flex-1">
        <NavItem to="/" icon={<Home />} label="Home" open={open} />
        <button
          onClick={handleInstantPricing}
          className="flex items-center gap-3 w-full text-gray-200 hover:text-gold px-3 py-2 transition"
        >
          <Calculator /> {open && <span className="text-sm">Instant Pricing</span>}
        </button>
        <NavItem to="/itemized" icon={<ClipboardList />} label="Manual Selection" open={open} />
        <NavItem to="/service-areas" icon={<MapPin />} label="Cities" open={open} />
        <NavItem to="/blog" icon={<BookOpen />} label="Blog" open={open} />
        <NavItem to="/faq" icon={<HelpCircle />} label="FAQ" open={open} />
      </nav>

      {open && (
        <div className="px-4 py-4 text-xs text-gold/60 border-t border-gold/30">
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
