// File: src/components/LayoutShell.jsx
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import TopNav from "./TopNav";
import SideNav from "./SideNav";
import TopNavMobile from "./TopNavMobile";
import ChatWidget from "./chat/ChatWidget";

export default function LayoutShell() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Detect window resize for responsive layout
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* === SIDENAV (Desktop only) === */}
      {isDesktop && <SideNav open={sidebarOpen} />}

      {/* === MAIN CONTAINER === */}
      <div className="flex-1 flex flex-col relative">
        {/* === TOP NAV === */}
        {isDesktop ? (
          <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        ) : (
          <TopNavMobile />
        )}

        {/* === PAGE CONTENT === */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            marginLeft: isDesktop ? (sidebarOpen ? 240 : 80) : 0,
            marginTop: isDesktop ? 64 : 56, // 64px desktop height, ~56px mobile
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* === GLOBAL CHAT WIDGET === */}
      <ChatWidget />
    </div>
  );
}
