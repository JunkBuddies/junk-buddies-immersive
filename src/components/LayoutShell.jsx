// LayoutShell.jsx
import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";
import SideNav from "./SideNav";
import ChatWidget from "./chat/ChatWidget";

export default function LayoutShell() {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar (desktop) */}
      <SideNav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <TopNav />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <Outlet />
        </main>
      </div>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}
