// TopNav.jsx
import { motion } from "framer-motion";

export default function TopNav({ connectedBorder = false }) {
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`flex items-center justify-between px-6 py-4 bg-black/95 text-gold font-semibold border-b ${
        connectedBorder ? "border-gold" : "border-gold/30"
      }`}
    >
      <h1 className="text-2xl font-bold tracking-wide">JUNK BUDDIES</h1>
      <div className="text-sm text-gray-400">
        Making Space For What Matters
      </div>
    </motion.header>
  );
}
