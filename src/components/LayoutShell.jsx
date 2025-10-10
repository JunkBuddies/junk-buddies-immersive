// LayoutShell.jsx
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import TopNav from "./TopNav";
import SideNav from "./SideNav";
import ChatWidget from "./chat/ChatWidget";

export default function LayoutShell() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Left vertical nav (L shape part 1) */}
      {isDesktop && <SideNav open={sidebarOpen} setOpen={setSidebarOpen} />}

      {/* Main column (L shape part 2: Top bar + content) */}
      <div className="flex-1 flex flex-col relative">
        <TopNav />

        {/* The gold L-line meeting at the corner (visual sync only) */}
        {!isDesktop ? null : (
          <div
            className="absolute top-0 left-0 w-[1px] bg-gold h-full z-40"
            style={{
              transform: `translateX(${sidebarOpen ? "240px" : "80px"})`,
              transition: "transform 0.3s ease",
            }}
          />
        )}

        {/* Scrollable main content — touches bottom/right edges */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            marginLeft: isDesktop ? (sidebarOpen ? 240 : 80) : 0,
            marginTop: 64, // matches TopNav height
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Global chat stays mounted */}
      <ChatWidget />
    </div>
  );
}
