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

export default function SideNav({ open, setOpen }) {
  const navItems = [
    { icon: <Home />, label: "Home", to: "/" },
    {
      icon: <Calculator />,
      label: "Instant Pricing (Chat)",
      to: "#",
      action: () => {
        const widget = document.querySelector("#jb-chat-widget");
        if (widget) widget.click(); // simulate open widget
      },
    },
    { icon: <ClipboardList />, label: "Manual Selection", to: "/itemized" },
    { icon: <MapPin />, label: "Cities", to: "/service-areas" },
    { icon: <BookOpen />, label: "Blog", to: "/blog" },
    { icon: <HelpCircle />, label: "FAQ", to: "/faq" },
  ];

  return (
    <motion.aside
      animate={{ width: open ? 240 : 80 }}
      transition={{ duration: 0.3 }}
      className="hidden lg:flex flex-col items-center h-screen bg-black border-r border-gold fixed top-0 left-0 z-40"
    >
      {/* Menu toggle */}
      <div className="w-full flex justify-end px-3 py-4 border-b border-gold/40">
        <button
          onClick={() => setOpen(!open)}
          className="text-gold hover:text-white transition"
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col items-start gap-3 mt-6 w-full px-3">
        {navItems.map((item, idx) =>
          item.to === "#" ? (
            <button
              key={idx}
              onClick={item.action}
              className="flex items-center gap-3 text-gray-200 hover:text-gold px-3 py-2 w-full transition"
            >
              {item.icon}
              {open && <span className="text-sm">{item.label}</span>}
            </button>
          ) : (
            <Link
              key={idx}
              to={item.to}
              className="flex items-center gap-3 text-gray-200 hover:text-gold px-3 py-2 w-full transition"
            >
              {item.icon}
              {open && <span className="text-sm">{item.label}</span>}
            </Link>
          )
        )}
      </nav>

      {/* Footer */}
      {open && (
        <div className="mt-auto mb-4 text-xs text-gold/60 text-center">
          © {new Date().getFullYear()} Junk Buddies
        </div>
      )}
    </motion.aside>
  );
}
