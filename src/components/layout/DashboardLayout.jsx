import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useIdleTimeout } from "../../hooks/useIdleTimeout";

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-logout after 5 minutes of inactivity
  useIdleTimeout(5 * 60 * 1000);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-3 sm:px-4 py-3 sm:py-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
