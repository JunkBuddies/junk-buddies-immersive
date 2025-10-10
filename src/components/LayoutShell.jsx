import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";

export default function LayoutShell() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Static background layer */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-neutral-900 to-black pointer-events-none" />

      {/* Animated route transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="relative z-10"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      {/* Optional global overlay elements */}
      <div className="fixed bottom-6 right-6 z-20 text-gold text-sm opacity-75">
        Junk Buddies © {new Date().getFullYear()}
      </div>
    </div>
  );
}
