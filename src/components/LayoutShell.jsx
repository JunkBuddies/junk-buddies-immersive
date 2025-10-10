// File: src/components/LayoutShell.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, useLocation, Link } from "react-router-dom";

export default function LayoutShell() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* 🏁 Cinematic Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-md border-b border-gold/40 z-50 flex justify-between items-center px-6 py-3">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/images/logo-icon.png"
            alt="Junk Buddies Logo"
            className="h-8 w-auto"
          />
          <span className="text-gold text-xl font-bold tracking-wide">
            Junk Buddies
          </span>
        </Link>
        <div className="flex items-center space-x-6 text-sm sm:text-base">
          <Link to="/itemized" className="hover:text-gold transition">Instant Pricing</Link>
          <Link to="/selection" className="hover:text-gold transition">Book Now</Link>
          <Link to="/service-areas" className="hover:text-gold transition">Cities</Link>
        </div>
      </nav>

      {/* 🔄 Page Transitions */}
      <main className="pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
