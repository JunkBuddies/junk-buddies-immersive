// LayoutShell.jsx
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import TopNav from "./TopNav";            // ← unchanged, as requested
import SideNav from "./SideNav";
import ChatWidget from "./chat/ChatWidget";

export default function LayoutShell() {
  const [isDesktop, setIsDesktop] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Desktop-only SideNav (solid, collapsible) */}
      {isDesktop && <SideNav open={sidebarOpen} setOpen={setSidebarOpen} />}

      {/* Main column: TopNav (unchanged) + page content */}
      <div className="flex-1 flex flex-col">
        <TopNav />

        {/* Scrollable content; full width to right/bottom; only offset left under SideNav on desktop */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            paddingLeft: isDesktop ? (sidebarOpen ? 240 : 80) : 0, // match SideNav widths; no other padding
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Floating chat stays global */}
      <ChatWidget />
    </div>
  );
}
