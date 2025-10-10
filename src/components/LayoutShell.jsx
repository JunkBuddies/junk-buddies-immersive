// LayoutShell.jsx
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import TopNav from "./TopNav";
import SideNav from "./SideNav";
import ChatWidget from "./chat/ChatWidget";

export default function LayoutShell() {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {!isMobile && (
        <SideNav open={sidebarOpen} setOpen={setSidebarOpen} />
      )}

      <div
        className={`flex-1 flex flex-col border-l border-gold transition-all duration-300 ${
          sidebarOpen ? "ml-[240px]" : "ml-[80px]"
        }`}
      >
        <TopNav connectedBorder={true} />
        <main className="flex-1 overflow-y-auto scroll-smooth border-t border-gold">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}
