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
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Left vertical nav */}
      {isDesktop && <SideNav open={sidebarOpen} />}

      {/* Main area */}
      <div className="flex-1 flex flex-col relative">
        <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Scrollable main content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            marginLeft: isDesktop ? (sidebarOpen ? 240 : 80) : 0,
            marginTop: 64, // TopNav height
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Global chat widget */}
      <ChatWidget />
    </div>
  );
}
