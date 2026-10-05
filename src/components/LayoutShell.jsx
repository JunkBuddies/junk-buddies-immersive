// File: src/components/LayoutShell.jsx
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import TopNav from "./TopNav";
import SideNav from "./SideNav";
import TopNavMobile from "./TopNavMobile";

export default function LayoutShell() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {isDesktop && sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed top-16 inset-x-0 bottom-0 z-30 bg-black/45 backdrop-blur-[1px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
          className="flex-1 overflow-y-auto snap-y snap-mandatory"
          style={{
            marginTop: isDesktop ? 64 : 56,
            paddingBottom: isDesktop ? 0 : "calc(66px + env(safe-area-inset-bottom))",
          }}
          onClick={() => {
            if (isDesktop && sidebarOpen) setSidebarOpen(false);
          }}
        >
          <Outlet />
        </main>
      </div>

    </div>
  );
}
