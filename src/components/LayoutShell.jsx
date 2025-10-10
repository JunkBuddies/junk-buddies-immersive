// LayoutShell.jsx
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import TopNav from "./TopNav";
import TopNavMobile from "./TopNavMobile";
import SideNav from "./SideNav";
import ChatWidget from "./chat/ChatWidget";

export default function LayoutShell() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {!isMobile && <SideNav />}
      <div className="flex-1 flex flex-col">
        {isMobile ? <TopNavMobile /> : <TopNav />}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <Outlet />
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
