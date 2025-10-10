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
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      {!isMobile && (
        <SideNav open={sidebarOpen} setOpen={setSidebarOpen} />
      )}
      <div className="flex-1 flex flex-col relative">
        <TopNav sidebarOpen={sidebarOpen} />
        
        {/* Gold border meeting line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-gold via-gold/80 to-gold/0 z-40" />
        {!isMobile && (
          <div
            className={`absolute top-0 h-full w-[1px] ${
              sidebarOpen ? "left-[240px]" : "left-[80px]"
            } bg-gradient-to-b from-gold via-gold/60 to-gold/0 transition-all duration-300 z-40`}
          />
        )}

        {/* Main content inside gold frame */}
        <main className="flex-1 overflow-y-auto scroll-smooth p-3 sm:p-6 md:p-8">
          <div className="border-2 border-gold/60 rounded-2xl shadow-inner shadow-gold/10 p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-sm">
            <Outlet />
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}
